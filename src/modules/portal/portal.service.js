const prisma = require("../../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../../config/env");

/*
|--------------------------------------------------------------------------
| B2B CUSTOMER LOGIN
|--------------------------------------------------------------------------
*/
const portalLogin = async (emailOrPhone, password) => {
  const customer = await prisma.customer.findFirst({
    where: {
      OR: [
        { email: emailOrPhone },
        { phoneNumber: emailOrPhone }
      ]
    }
  });

  if (customer) {
    if (!customer.isPortalActive || customer.status !== "ACTIVE") {
      throw new Error("Portal access disabled for this account.");
    }

    if (!customer.passwordHash) {
      throw new Error("Invalid login credentials.");
    }

    const isMatch = await bcrypt.compare(password, customer.passwordHash);
    if (!isMatch) {
      throw new Error("Invalid login credentials.");
    }

    const token = jwt.sign(
      {
        id: customer.id,
        email: customer.email,
        fullName: customer.fullName,
        role: "CUSTOMER"
      },
      process.env.JWT_SECRET || "default_jwt_secret_key_123",
      { expiresIn: "7d" }
    );

    return {
      token,
      user: {
        id: customer.id,
        name: customer.fullName,
        email: customer.email,
        companyName: customer.companyName,
        role: "CUSTOMER",
        customerCode: customer.customerCode
      }
    };
  }

  // Fallback: check if an admin/staff User is logging in
  const user = await prisma.user.findUnique({
    where: { email: emailOrPhone }
  });

  if (user) {
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error("Invalid login credentials.");
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        fullName: user.name,
        role: user.role
      },
      process.env.JWT_SECRET || "default_jwt_secret_key_123",
      { expiresIn: "7d" }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        companyName: "Internal Staff",
        role: user.role,
        customerCode: "STAFF"
      }
    };
  }

  throw new Error("Invalid login credentials.");
};

/*
|--------------------------------------------------------------------------
| B2B CUSTOMER REGISTER (SELF-SERVICE SIGN UP)
|--------------------------------------------------------------------------
*/
const registerCustomer = async (data) => {
  const { fullName, companyName, email, phone, password } = data;

  if (!email || !password || !fullName) {
    throw new Error("Full name, email, and password are required.");
  }

  const existingCustomer = await prisma.customer.findFirst({
    where: {
      OR: [
        { email: email },
        phone ? { phoneNumber: phone } : undefined
      ].filter(Boolean)
    }
  });

  if (existingCustomer) {
    throw new Error("A customer account with this email or phone already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const count = await prisma.customer.count();
  const year = new Date().getFullYear();
  const customerCode = `CUST-${year}-${String(count + 1).padStart(4, "0")}`;

  const customer = await prisma.customer.create({
    data: {
      customerCode,
      fullName,
      companyName: companyName || fullName,
      email,
      phoneNumber: phone || "+4700000000",
      passwordHash,
      isPortalActive: true,
      status: "ACTIVE"
    }
  });

  const token = jwt.sign(
    {
      id: customer.id,
      email: customer.email,
      fullName: customer.fullName,
      role: "CUSTOMER"
    },
    process.env.JWT_SECRET || "default_jwt_secret_key_123",
    { expiresIn: "7d" }
  );

  return {
    token,
    user: {
      id: customer.id,
      name: customer.fullName,
      email: customer.email,
      companyName: customer.companyName,
      role: "CUSTOMER",
      customerCode: customer.customerCode
    }
  };
};

/*
|--------------------------------------------------------------------------
| B2B CUSTOMER GOOGLE AUTHENTICATION
|--------------------------------------------------------------------------
*/
const googleAuthCustomer = async (email, name, googleId) => {
  if (!email) {
    throw new Error("Google email is required.");
  }

  let customer = await prisma.customer.findFirst({
    where: { email }
  });

  if (!customer) {
    const count = await prisma.customer.count();
    const year = new Date().getFullYear();
    const customerCode = `CUST-${year}-${String(count + 1).padStart(4, "0")}`;
    const dummyPasswordHash = await bcrypt.hash(googleId || "google-auth-secret", 10);

    customer = await prisma.customer.create({
      data: {
        customerCode,
        fullName: name || "Google B2B Client",
        companyName: `${name || "Google"}'s Business`,
        email,
        phoneNumber: `+47${Math.floor(10000000 + Math.random() * 90000000)}`,
        passwordHash: dummyPasswordHash,
        isPortalActive: true,
        status: "ACTIVE"
      }
    });
  }

  const token = jwt.sign(
    {
      id: customer.id,
      email: customer.email,
      fullName: customer.fullName,
      role: "CUSTOMER"
    },
    process.env.JWT_SECRET || "default_jwt_secret_key_123",
    { expiresIn: "7d" }
  );

  return {
    token,
    user: {
      id: customer.id,
      name: customer.fullName,
      email: customer.email,
      companyName: customer.companyName,
      role: "CUSTOMER",
      customerCode: customer.customerCode
    }
  };
};

/*
|--------------------------------------------------------------------------
| B2B CUSTOMER CATALOG (Includes customer-specific pricing & access)
|--------------------------------------------------------------------------
*/
const getPortalCatalog = async (customerId, search = "", categoryId = null) => {
  const customPrices = await prisma.customerPrice.findMany({
    where: { customerId }
  });
  const customPriceMap = new Map(customPrices.map(cp => [cp.productId, Number(cp.customPrice)]));

  const accessRestrictions = await prisma.customerProductAccess.findMany({
    where: { customerId }
  });
  const forbiddenProductIds = new Set(
    accessRestrictions.filter(a => !a.isAllowed).map(a => a.productId)
  );

  const whereClause = {
    isActive: true,
    ...(forbiddenProductIds.size > 0 ? { id: { notIn: Array.from(forbiddenProductIds) } } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(search ? {
      OR: [
        { productName: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { styleNumber: { contains: search, mode: "insensitive" } },
        { styleName: { contains: search, mode: "insensitive" } },
        { color: { contains: search, mode: "insensitive" } }
      ]
    } : {})
  };

  const products = await prisma.product.findMany({
    where: whereClause,
    include: {
      category: true,
      barcodes: true
    },
    orderBy: { productName: "asc" }
  });

  return products.map(product => {
    const regularPrice = Number(product.salePrice);
    const effectivePrice = customPriceMap.has(product.id)
      ? customPriceMap.get(product.id)
      : regularPrice;

    return {
      ...product,
      effectivePrice,
      hasCustomPrice: customPriceMap.has(product.id),
      weightInKg: product.weightInKg || 0
    };
  });
};

/*
|--------------------------------------------------------------------------
| CREATE B2B CUSTOMER ORDER
|--------------------------------------------------------------------------
*/
const createPortalOrder = async (customerId, payload) => {
  const { items, shippingAddress, notes, packagingWeightKg = 0.2 } = payload;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("Order must contain at least one item.");
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId }
  });

  if (!customer) {
    throw new Error("Customer record not found.");
  }

  const customPrices = await prisma.customerPrice.findMany({
    where: { customerId }
  });
  const customPriceMap = new Map(customPrices.map(cp => [cp.productId, Number(cp.customPrice)]));

  const productIds = items.map(i => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } }
  });
  const productMap = new Map(products.map(p => [p.id, p]));

  let subtotal = 0;
  let totalGarmentWeightKg = 0;
  let hasMissingWeights = false;

  const orderItemsData = items.map(item => {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new Error(`Product ID ${item.productId} not found.`);
    }

    const unitPrice = customPriceMap.has(product.id)
      ? customPriceMap.get(product.id)
      : Number(product.salePrice);

    const quantity = Number(item.quantity);
    const totalPrice = unitPrice * quantity;
    const unitWeight = Number(product.weightInKg || 0);
    if (unitWeight === 0) {
      hasMissingWeights = true;
    }
    const itemTotalWeight = unitWeight * quantity;

    subtotal += totalPrice;
    totalGarmentWeightKg += itemTotalWeight;

    return {
      productId: product.id,
      quantity,
      unitPrice,
      unitWeight,
      totalPrice,
      totalWeight: itemTotalWeight
    };
  });

  const tax = subtotal * 0.25;
  const grandTotal = subtotal + tax;
  const totalParcelWeight = totalGarmentWeightKg + Number(packagingWeightKg);

  const count = await prisma.customerOrder.count();
  const year = new Date().getFullYear();
  const orderNumber = `ORD-${year}-${String(count + 1).padStart(4, "0")}`;

  const order = await prisma.customerOrder.create({
    data: {
      orderNumber,
      customerId,
      status: "PENDING",
      subtotal,
      tax,
      totalAmount: grandTotal,
      garmentWeightKg: totalGarmentWeightKg,
      packagingWeightKg: Number(packagingWeightKg),
      totalParcelWeight,
      notes: notes || "Order placed via Customer Portal",
      shippingAddress: shippingAddress || customer.address || "",
      orderItems: {
        create: orderItemsData
      }
    },
    include: {
      customer: true,
      orderItems: {
        include: { product: true }
      }
    }
  });

  await prisma.auditLog.create({
    data: {
      action: "ORDER_PLACED",
      entity: "CustomerOrder",
      entityId: order.id,
      performedBy: customer.fullName,
      details: `Placed B2B order ${order.orderNumber} for total ${grandTotal.toFixed(2)} NOK (Parcel weight: ${totalParcelWeight.toFixed(2)} kg)`
    }
  });

  return {
    order,
    hasMissingWeights
  };
};

/*
|--------------------------------------------------------------------------
| GET CUSTOMER ORDERS
|--------------------------------------------------------------------------
*/
const getCustomerOrders = async (customerId) => {
  return await prisma.customerOrder.findMany({
    where: { customerId },
    include: {
      orderItems: {
        include: { product: true }
      },
      deliveryNote: true
    },
    orderBy: { createdAt: "desc" }
  });
};

/*
|--------------------------------------------------------------------------
| GET ALL B2B ORDERS (Admin/Staff View)
|--------------------------------------------------------------------------
*/
const getAllOrders = async (status = null, customerId = null) => {
  return await prisma.customerOrder.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(customerId ? { customerId } : {})
    },
    include: {
      customer: true,
      orderItems: {
        include: { product: true }
      },
      deliveryNote: true,
      fulfilledBy: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
};

/*
|--------------------------------------------------------------------------
| FULFILL ORDER & CONNECT DIRECTLY TO STOCK OUT
|--------------------------------------------------------------------------
*/
const fulfillOrder = async (orderId, userId) => {
  const order = await prisma.customerOrder.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      orderItems: { include: { product: true } }
    }
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status === "COMPLETED" || order.status === "SHIPPED") {
    throw new Error("Order is already fulfilled/completed");
  }

  const result = await prisma.$transaction(async (tx) => {
    for (const item of order.orderItems) {
      const p = await tx.product.findUnique({ where: { id: item.productId } });
      if (!p || p.stockQuantity < item.quantity) {
        throw new Error(`Insufficient stock for product ${p?.productName || item.productId}. Required: ${item.quantity}, Available: ${p?.stockQuantity || 0}`);
      }

      const previousStock = p.stockQuantity;
      const newStock = previousStock - item.quantity;

      await tx.product.update({
        where: { id: item.productId },
        data: { stockQuantity: newStock }
      });

      await tx.inventoryTransaction.create({
        data: {
          transactionType: "STOCK_OUT",
          quantity: item.quantity,
          previousStock,
          newStock,
          referenceNumber: order.orderNumber,
          notes: `Fulfillment of Customer Order ${order.orderNumber}`,
          productId: item.productId,
          performedById: userId,
          customerId: order.customerId,
          packagingWeightKg: order.packagingWeightKg,
          totalWeightKg: item.totalWeight + (order.packagingWeightKg / order.orderItems.length)
        }
      });
    }

    const dnCount = await tx.deliveryNote.count();
    const year = new Date().getFullYear();
    const deliveryNoteNumber = `DN-${year}-${String(dnCount + 1).padStart(4, "0")}`;

    const deliveryNote = await tx.deliveryNote.create({
      data: {
        deliveryNoteNumber,
        customerId: order.customerId,
        orderId: order.id,
        garmentWeightKg: order.garmentWeightKg,
        packagingWeightKg: order.packagingWeightKg,
        totalParcelWeight: order.totalParcelWeight,
        notes: `Delivery note for B2B Order ${order.orderNumber}`
      }
    });

    const updatedOrder = await tx.customerOrder.update({
      where: { id: orderId },
      data: {
        status: "COMPLETED",
        fulfilledAt: new Date(),
        fulfilledById: userId
      },
      include: {
        customer: true,
        orderItems: { include: { product: true } },
        deliveryNote: true
      }
    });

    await tx.auditLog.create({
      data: {
        action: "ORDER_FULFILLED_STOCK_OUT",
        entity: "CustomerOrder",
        entityId: order.id,
        performedBy: userId,
        details: `Fulfilled order ${order.orderNumber} -> Created Delivery Note ${deliveryNoteNumber}`
      }
    });

    return updatedOrder;
  });

  return result;
};

/*
|--------------------------------------------------------------------------
| UPDATE ORDER STATUS
|--------------------------------------------------------------------------
*/
const updateOrderStatus = async (orderId, status, userId) => {
  const updated = await prisma.customerOrder.update({
    where: { id: orderId },
    data: { status },
    include: { customer: true, orderItems: { include: { product: true } } }
  });

  await prisma.auditLog.create({
    data: {
      action: "ORDER_STATUS_CHANGED",
      entity: "CustomerOrder",
      entityId: orderId,
      performedBy: userId,
      details: `Changed order ${updated.orderNumber} status to ${status}`
    }
  });

  return updated;
};

module.exports = {
  portalLogin,
  registerCustomer,
  googleAuthCustomer,
  getPortalCatalog,
  createPortalOrder,
  getCustomerOrders,
  getAllOrders,
  fulfillOrder,
  updateOrderStatus
};
