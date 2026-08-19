const prisma = require("../../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getJwtSecret = () => process.env.JWT_SECRET || "super_secret_jwt_key";

/*
|--------------------------------------------------------------------------
| COLLISION-SAFE UNIQUE CODE GENERATORS
|--------------------------------------------------------------------------
*/
const generateUniqueCustomerCode = async (tx = prisma) => {
  const year = new Date().getFullYear();
  const prefix = `CUST-${year}-`;

  const latestCustomer = await tx.customer.findFirst({
    where: { customerCode: { startsWith: prefix } },
    orderBy: { customerCode: "desc" },
    select: { customerCode: true }
  });

  let nextSeq = 1;
  if (latestCustomer?.customerCode) {
    const parts = latestCustomer.customerCode.split("-");
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) {
      nextSeq = lastNum + 1;
    }
  }

  const count = await tx.customer.count();
  if (count >= nextSeq) {
    nextSeq = count + 1;
  }

  let code = `${prefix}${String(nextSeq).padStart(4, "0")}`;
  let exists = await tx.customer.findUnique({ where: { customerCode: code } });
  while (exists) {
    nextSeq++;
    code = `${prefix}${String(nextSeq).padStart(4, "0")}`;
    exists = await tx.customer.findUnique({ where: { customerCode: code } });
  }
  return code;
};

const generateUniqueOrderNumber = async (tx = prisma) => {
  const year = new Date().getFullYear();
  const prefix = `ORD-${year}-`;

  const latestOrder = await tx.customerOrder.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true }
  });

  let nextSeq = 1;
  if (latestOrder?.orderNumber) {
    const parts = latestOrder.orderNumber.split("-");
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) {
      nextSeq = lastNum + 1;
    }
  }

  const count = await tx.customerOrder.count();
  if (count >= nextSeq) {
    nextSeq = count + 1;
  }

  let code = `${prefix}${String(nextSeq).padStart(4, "0")}`;
  let exists = await tx.customerOrder.findUnique({ where: { orderNumber: code } });
  while (exists) {
    nextSeq++;
    code = `${prefix}${String(nextSeq).padStart(4, "0")}`;
    exists = await tx.customerOrder.findUnique({ where: { orderNumber: code } });
  }
  return code;
};

const generateUniqueDeliveryNoteNumber = async (tx = prisma) => {
  const year = new Date().getFullYear();
  const prefix = `DN-${year}-`;

  const latestDN = await tx.deliveryNote.findFirst({
    where: { deliveryNoteNumber: { startsWith: prefix } },
    orderBy: { deliveryNoteNumber: "desc" },
    select: { deliveryNoteNumber: true }
  });

  let nextSeq = 1;
  if (latestDN?.deliveryNoteNumber) {
    const parts = latestDN.deliveryNoteNumber.split("-");
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) {
      nextSeq = lastNum + 1;
    }
  }

  const count = await tx.deliveryNote.count();
  if (count >= nextSeq) {
    nextSeq = count + 1;
  }

  let code = `${prefix}${String(nextSeq).padStart(4, "0")}`;
  let exists = await tx.deliveryNote.findUnique({ where: { deliveryNoteNumber: code } });
  while (exists) {
    nextSeq++;
    code = `${prefix}${String(nextSeq).padStart(4, "0")}`;
    exists = await tx.deliveryNote.findUnique({ where: { deliveryNoteNumber: code } });
  }
  return code;
};

/*
|--------------------------------------------------------------------------
| B2B CUSTOMER LOGIN
|--------------------------------------------------------------------------
*/
const portalLogin = async (emailOrPhone, password) => {
  const cleanIdentifier = String(emailOrPhone || "").trim();

  const customer = await prisma.customer.findFirst({
    where: {
      OR: [
        { email: { equals: cleanIdentifier, mode: "insensitive" } },
        { phoneNumber: cleanIdentifier }
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
      getJwtSecret(),
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
  const user = await prisma.user.findFirst({
    where: { email: { equals: cleanIdentifier, mode: "insensitive" } }
  });

  if (user) {
    if (!user.isActive) {
      throw new Error("User account is disabled.");
    }

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
      getJwtSecret(),
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
| B2B CUSTOMER REGISTER (SELF-SERVICE SIGN UP / ACTIVATION)
|--------------------------------------------------------------------------
*/
const registerCustomer = async (data) => {
  const { fullName, companyName, email, phone, address, city, vatNumber, password } = data;

  if (!email || !password || !fullName) {
    throw new Error("Full name, email, and password are required.");
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = (phone || "").replace(/\s+/g, "").trim();
  const cleanAddress = (address || "").trim();
  const cleanCity = (city || "").trim();
  const cleanVat = (vatNumber || "").trim();

  // Find if customer already exists in CRM by email or phone
  let existingCustomer = await prisma.customer.findFirst({
    where: {
      OR: [
        { email: { equals: cleanEmail, mode: "insensitive" } },
        cleanPhone ? { phoneNumber: cleanPhone } : undefined
      ].filter(Boolean)
    }
  });

  const passwordHash = await bcrypt.hash(password, 10);

  // If customer already exists (e.g. created by admin in CRM or seeded), activate portal credentials & login
  if (existingCustomer) {
    const updatedCustomer = await prisma.customer.update({
      where: { id: existingCustomer.id },
      data: {
        fullName: fullName.trim() || existingCustomer.fullName,
        companyName: (companyName || fullName || existingCustomer.companyName).trim(),
        passwordHash,
        isPortalActive: true,
        status: "ACTIVE",
        ...(cleanPhone ? { phoneNumber: cleanPhone } : {}),
        ...(cleanAddress ? { address: cleanAddress } : {}),
        ...(cleanCity ? { city: cleanCity } : {}),
        ...(cleanVat ? { vatNumber: cleanVat } : {})
      }
    });

    const token = jwt.sign(
      {
        id: updatedCustomer.id,
        email: updatedCustomer.email,
        fullName: updatedCustomer.fullName,
        role: "CUSTOMER"
      },
      getJwtSecret(),
      { expiresIn: "7d" }
    );

    try {
      await prisma.auditLog.create({
        data: {
          action: "CUSTOMER_PORTAL_ACTIVATED",
          entity: "Customer",
          entityId: updatedCustomer.id,
          performedBy: updatedCustomer.fullName,
          details: `Customer portal credentials activated/updated for (${updatedCustomer.customerCode})`
        }
      });
    } catch (auditErr) {
      console.warn("Audit log creation skipped:", auditErr.message);
    }

    return {
      token,
      user: {
        id: updatedCustomer.id,
        name: updatedCustomer.fullName,
        email: updatedCustomer.email,
        companyName: updatedCustomer.companyName,
        role: "CUSTOMER",
        customerCode: updatedCustomer.customerCode
      }
    };
  }

  // Create brand new customer
  const customerCode = await generateUniqueCustomerCode(prisma);

  let finalPhone = cleanPhone;
  if (!finalPhone) {
    finalPhone = `+47${Math.floor(10000000 + Math.random() * 90000000)}`;
  }
  let pExists = await prisma.customer.findUnique({ where: { phoneNumber: finalPhone } });
  while (pExists) {
    finalPhone = `+47${Math.floor(10000000 + Math.random() * 90000000)}`;
    pExists = await prisma.customer.findUnique({ where: { phoneNumber: finalPhone } });
  }

  const customer = await prisma.customer.create({
    data: {
      customerCode,
      fullName: fullName.trim(),
      companyName: (companyName || fullName).trim(),
      email: cleanEmail,
      phoneNumber: finalPhone,
      address: cleanAddress || null,
      city: cleanCity || null,
      vatNumber: cleanVat || null,
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
    getJwtSecret(),
    { expiresIn: "7d" }
  );

  try {
    await prisma.auditLog.create({
      data: {
        action: "CUSTOMER_REGISTERED_PORTAL",
        entity: "Customer",
        entityId: customer.id,
        performedBy: customer.fullName,
        details: `Customer registered via B2B portal (${customer.customerCode})`
      }
    });
  } catch (auditErr) {
    console.warn("Audit log creation skipped:", auditErr.message);
  }

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
| B2B CUSTOMER GOOGLE AUTHENTICATION (WITH GOOGLE CRYPTOGRAPHIC VERIFICATION)
|--------------------------------------------------------------------------
*/
const googleAuthCustomer = async ({ idToken, credential, accessToken, email, name, googleId }) => {
  let verifiedEmail = email;
  let verifiedName = name;
  let verifiedGoogleId = googleId;

  // 1. If Google ID Token / Credential is provided, verify directly with Google OAuth API
  const tokenToVerify = idToken || credential;
  if (tokenToVerify) {
    try {
      const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokenToVerify}`);
      if (!googleRes.ok) {
        throw new Error("Invalid Google authentication token.");
      }
      const tokenInfo = await googleRes.json();
      
      if (!tokenInfo.email) {
        throw new Error("Google token does not contain a valid email.");
      }

      // Check that Google has officially verified this email
      if (tokenInfo.email_verified === "false" || tokenInfo.email_verified === false) {
        throw new Error("Google email is not verified by Google.");
      }

      verifiedEmail = tokenInfo.email;
      verifiedName = tokenInfo.name || tokenInfo.given_name || name;
      verifiedGoogleId = tokenInfo.sub || googleId;
    } catch (verifyErr) {
      console.error("Google token verification failed:", verifyErr.message);
      // If token verification failed, reject untrusted login
      throw new Error(`Google verification failed: ${verifyErr.message}`);
    }
  } else if (accessToken) {
    // Verify using Google userinfo API
    try {
      const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!userRes.ok) {
        throw new Error("Invalid Google access token.");
      }
      const userInfo = await userRes.json();
      if (!userInfo.email) {
        throw new Error("Could not retrieve verified email from Google.");
      }
      if (userInfo.email_verified === false) {
        throw new Error("Google email is not verified by Google.");
      }
      verifiedEmail = userInfo.email;
      verifiedName = userInfo.name || userInfo.given_name || name;
      verifiedGoogleId = userInfo.sub || googleId;
    } catch (userErr) {
      console.error("Google access token verification failed:", userErr.message);
      throw new Error(`Google verification failed: ${userErr.message}`);
    }
  }

  if (!verifiedEmail) {
    throw new Error("Verified Google email is required.");
  }

  const cleanEmail = verifiedEmail.trim().toLowerCase();

  let customer = await prisma.customer.findFirst({
    where: { email: { equals: cleanEmail, mode: "insensitive" } }
  });

  if (!customer) {
    const customerCode = await generateUniqueCustomerCode(prisma);
    const dummyPasswordHash = await bcrypt.hash(verifiedGoogleId || "google-auth-secret", 10);

    let phone = `+47${Math.floor(10000000 + Math.random() * 90000000)}`;
    let phoneExists = await prisma.customer.findUnique({ where: { phoneNumber: phone } });
    while (phoneExists) {
      phone = `+47${Math.floor(10000000 + Math.random() * 90000000)}`;
      phoneExists = await prisma.customer.findUnique({ where: { phoneNumber: phone } });
    }

    const displayName = (verifiedName || cleanEmail.split("@")[0]).trim();
    const companyDisplayName = verifiedName ? `${verifiedName.trim()}'s Business` : "Nordic Business Client";

    customer = await prisma.customer.create({
      data: {
        customerCode,
        fullName: displayName,
        companyName: companyDisplayName,
        email: cleanEmail,
        phoneNumber: phone,
        passwordHash: dummyPasswordHash,
        isPortalActive: true,
        status: "ACTIVE"
      }
    });

    try {
      await prisma.auditLog.create({
        data: {
          action: "GOOGLE_AUTH_SIGNUP",
          entity: "Customer",
          entityId: customer.id,
          performedBy: customer.fullName,
          details: `Created new verified B2B customer via Google SSO (${customer.customerCode})`
        }
      });
    } catch (auditErr) {
      console.warn("Audit log creation skipped:", auditErr.message);
    }
  } else {
    if (!customer.isPortalActive || customer.status !== "ACTIVE") {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: { isPortalActive: true, status: "ACTIVE" }
      });
    }
  }

  const token = jwt.sign(
    {
      id: customer.id,
      email: customer.email,
      fullName: customer.fullName,
      role: "CUSTOMER"
    },
    getJwtSecret(),
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
  let customPriceMap = new Map();
  let forbiddenProductIds = new Set();

  if (customerId) {
    let resolvedCustomerId = customerId;
    const directCust = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!directCust) {
      const user = await prisma.user.findUnique({ where: { id: customerId } });
      if (user) {
        const custMatch = await prisma.customer.findFirst({ where: { email: user.email } });
        if (custMatch) resolvedCustomerId = custMatch.id;
      }
    }

    const customPrices = await prisma.customerPrice.findMany({
      where: { customerId: resolvedCustomerId }
    });
    customPriceMap = new Map(customPrices.map(cp => [cp.productId, Number(cp.customPrice)]));

    const accessRestrictions = await prisma.customerProductAccess.findMany({
      where: { customerId: resolvedCustomerId }
    });
    forbiddenProductIds = new Set(
      accessRestrictions.filter(a => !a.isAllowed).map(a => a.productId)
    );
  }

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
| GET B2B CUSTOMER PROFILE / STAFF PORTAL CONTEXT
|--------------------------------------------------------------------------
*/
const getCustomerProfile = async (userIdOrCustomerId) => {
  let customer = await prisma.customer.findUnique({
    where: { id: userIdOrCustomerId },
    include: {
      contacts: true
    }
  });

  if (customer) {
    const fullAddress = [customer.address, customer.city].filter(Boolean).join(", ");
    return {
      isStaff: false,
      customer: {
        id: customer.id,
        customerCode: customer.customerCode,
        fullName: customer.fullName,
        companyName: customer.companyName,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        address: customer.address || "",
        city: customer.city || "",
        fullAddress: fullAddress || customer.address || ""
      }
    };
  }

  // Check if it is a staff user
  const user = await prisma.user.findUnique({
    where: { id: userIdOrCustomerId }
  });

  if (user) {
    // Fetch active B2B customers for staff dropdown selector
    const customers = await prisma.customer.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        customerCode: true,
        fullName: true,
        companyName: true,
        email: true,
        phoneNumber: true,
        address: true,
        city: true
      },
      orderBy: { companyName: "asc" }
    });

    const staffCustomerMatch = await prisma.customer.findFirst({
      where: { email: { equals: user.email, mode: "insensitive" } }
    });

    return {
      isStaff: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      currentCustomer: staffCustomerMatch || null,
      customers: customers.map(c => ({
        ...c,
        fullAddress: [c.address, c.city].filter(Boolean).join(", ")
      }))
    };
  }

  throw new Error("User or customer profile not found.");
};

/*
|--------------------------------------------------------------------------
| CREATE B2B CUSTOMER ORDER
|--------------------------------------------------------------------------
*/
const createPortalOrder = async (userIdOrCustomerId, payload) => {
  const { items, shippingAddress, notes, packagingWeightKg = 0.2, targetCustomerId } = payload || {};

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("Order must contain at least one item.");
  }

  // 1. Resolve Customer entity: targetCustomerId if specified by staff dropdown, or current user/customer
  let customer = null;
  if (targetCustomerId) {
    customer = await prisma.customer.findUnique({
      where: { id: targetCustomerId }
    });
  }

  if (!customer) {
    customer = await prisma.customer.findUnique({
      where: { id: userIdOrCustomerId }
    });
  }

  if (!customer) {
    const user = await prisma.user.findUnique({
      where: { id: userIdOrCustomerId }
    });

    if (user) {
      customer = await prisma.customer.findFirst({
        where: { email: { equals: user.email, mode: "insensitive" } }
      });

      if (!customer) {
        const customerCode = await generateUniqueCustomerCode(prisma);
        const dummyPasswordHash = await bcrypt.hash("internal_staff_password", 10);
        let phone = user.phoneNumber || `+47${Math.floor(10000000 + Math.random() * 90000000)}`;
        let pExists = await prisma.customer.findUnique({ where: { phoneNumber: phone } });
        while (pExists) {
          phone = `+47${Math.floor(10000000 + Math.random() * 90000000)}`;
          pExists = await prisma.customer.findUnique({ where: { phoneNumber: phone } });
        }

        customer = await prisma.customer.create({
          data: {
            customerCode,
            fullName: user.name || "Staff Customer",
            companyName: "Nordic Prowear (Internal Staff)",
            email: user.email,
            phoneNumber: phone,
            passwordHash: dummyPasswordHash,
            isPortalActive: true,
            status: "ACTIVE"
          }
        });
      }
    }
  }

  if (!customer) {
    throw new Error("Customer record not found. Please log in again.");
  }

  const customerId = customer.id;

  const customPrices = await prisma.customerPrice.findMany({
    where: { customerId }
  });
  const customPriceMap = new Map(customPrices.map(cp => [cp.productId, Number(cp.customPrice)]));

  const productIds = items.map(i => i.productId).filter(Boolean);
  if (productIds.length === 0) {
    throw new Error("Invalid product items in cart.");
  }

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
      throw new Error(`Product with ID "${item.productId}" not found in catalogue. Please refresh your cart.`);
    }

    const unitPrice = customPriceMap.has(product.id)
      ? customPriceMap.get(product.id)
      : Number(product.salePrice);

    const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
    const totalPrice = Number((unitPrice * quantity).toFixed(2));
    const unitWeight = Number(product.weightInKg || 0);
    if (unitWeight === 0) {
      hasMissingWeights = true;
    }
    const itemTotalWeight = Number((unitWeight * quantity).toFixed(3));

    subtotal += totalPrice;
    totalGarmentWeightKg += itemTotalWeight;

    return {
      productId: product.id,
      quantity,
      unitPrice,
      unitWeight,
      totalPrice,
      totalWeight: itemTotalWeight,
      selectedLogo: item.selectedLogo || null,
      customNote: item.customNote || null
    };
  });

  const parsedPkgWeight = Number(Number(packagingWeightKg || 0.2).toFixed(2));
  const parsedGarmentWeight = Number(totalGarmentWeightKg.toFixed(2));
  const totalParcelWeight = Number((parsedGarmentWeight + parsedPkgWeight).toFixed(2));
  const subtotalRounded = Number(subtotal.toFixed(2));
  const tax = Number((subtotalRounded * 0.25).toFixed(2));
  const grandTotal = Number((subtotalRounded + tax).toFixed(2));

  const orderNumber = await generateUniqueOrderNumber(prisma);

  const order = await prisma.customerOrder.create({
    data: {
      orderNumber,
      customerId,
      status: "PENDING",
      subtotal: subtotalRounded,
      tax,
      totalAmount: grandTotal,
      garmentWeightKg: parsedGarmentWeight,
      packagingWeightKg: parsedPkgWeight,
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

  try {
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        totalOrders: { increment: 1 },
        totalSpent: { increment: grandTotal }
      }
    });
  } catch (custErr) {
    console.warn("Could not update customer totals:", custErr.message);
  }

  try {
    await prisma.auditLog.create({
      data: {
        action: "ORDER_PLACED",
        entity: "CustomerOrder",
        entityId: order.id,
        performedBy: customer.fullName || "B2B Client",
        details: `Placed B2B order ${order.orderNumber} for total ${grandTotal.toFixed(2)} NOK (Parcel weight: ${totalParcelWeight.toFixed(2)} kg)`
      }
    });
  } catch (auditErr) {
    console.warn("Audit log creation skipped:", auditErr.message);
  }

  return {
    order,
    hasMissingWeights
  };
};

/*
|--------------------------------------------------------------------------
| GET CUSTOMER PAST ORDERS
|--------------------------------------------------------------------------
*/
const getCustomerOrders = async (userIdOrCustomerId) => {
  let customer = await prisma.customer.findUnique({
    where: { id: userIdOrCustomerId }
  });

  if (!customer) {
    const user = await prisma.user.findUnique({
      where: { id: userIdOrCustomerId }
    });
    if (user) {
      customer = await prisma.customer.findFirst({
        where: { email: { equals: user.email, mode: "insensitive" } }
      });
    }
  }

  if (!customer) {
    return [];
  }

  return await prisma.customerOrder.findMany({
    where: { customerId: customer.id },
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
| ADMIN: GET ALL B2B ORDERS
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
| ADMIN: FULFILL ORDER (Direct Stock Out Connection)
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

    const deliveryNoteNumber = await generateUniqueDeliveryNoteNumber(tx);

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

    try {
      await tx.auditLog.create({
        data: {
          action: "ORDER_FULFILLED_STOCK_OUT",
          entity: "CustomerOrder",
          entityId: order.id,
          performedBy: userId,
          details: `Fulfilled order ${order.orderNumber} -> Created Delivery Note ${deliveryNoteNumber}`
        }
      });
    } catch (auditErr) {
      console.warn("Audit log creation skipped:", auditErr.message);
    }

    return updatedOrder;
  });

  return result;
};

/*
|--------------------------------------------------------------------------
| ADMIN: UPDATE ORDER STATUS
|--------------------------------------------------------------------------
*/
const updateOrderStatus = async (orderId, status, userId) => {
  const updated = await prisma.customerOrder.update({
    where: { id: orderId },
    data: { status },
    include: { customer: true, orderItems: { include: { product: true } } }
  });

  try {
    await prisma.auditLog.create({
      data: {
        action: "ORDER_STATUS_CHANGED",
        entity: "CustomerOrder",
        entityId: orderId,
        performedBy: userId,
        details: `Changed order ${updated.orderNumber} status to ${status}`
      }
    });
  } catch (auditErr) {
    console.warn("Audit log creation skipped:", auditErr.message);
  }

  return updated;
};

module.exports = {
  generateUniqueCustomerCode,
  generateUniqueOrderNumber,
  generateUniqueDeliveryNoteNumber,
  portalLogin,
  registerCustomer,
  googleAuthCustomer,
  getCustomerProfile,
  getPortalCatalog,
  createPortalOrder,
  getCustomerOrders,
  getAllOrders,
  fulfillOrder,
  updateOrderStatus
};
