const prisma = require("../../config/db");
const bcrypt = require("bcryptjs");
const { logActivity } = require("../activity/activity.service");
const {
  getPaginationParams,
  formatPaginationMeta,
} = require("../../utils/pagination.helper");

const buildCustomerFilters = (search, customerType, status) => {
  const filters = [];

  if (search) {
    filters.push({
      OR: [
        { fullName: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
        { customerCode: { contains: search, mode: "insensitive" } },
        { phoneNumber: { contains: search } },
        { email: { contains: search, mode: "insensitive" } }
      ]
    });
  }

  if (customerType) {
    filters.push({ customerType });
  }

  if (status) {
    filters.push({ status });
  }

  return filters.length > 0 ? { AND: filters } : undefined;
};

/*
|--------------------------------------------------------------------------
| CREATE CUSTOMER (With Customer Code & Initial Contacts)
|--------------------------------------------------------------------------
*/
const createCustomer = async (payload) => {
  const existingCustomer = await prisma.customer.findFirst({
    where: {
      OR: [
        { phoneNumber: payload.phoneNumber },
        { email: payload.email || undefined }
      ]
    }
  });

  if (existingCustomer) {
    throw new Error("Customer with this email or phone number already exists.");
  }

  // Generate unique customer code if not provided
  let customerCode = payload.customerCode;
  if (!customerCode) {
    const { generateUniqueCustomerCode } = require("../portal/portal.service");
    customerCode = await generateUniqueCustomerCode(prisma);
  }

  const { contacts, password, ...customerData } = payload;

  let passwordHash = null;
  if (password) {
    passwordHash = await bcrypt.hash(password, 10);
  }

  const customer = await prisma.customer.create({
    data: {
      ...customerData,
      customerCode,
      passwordHash,
      isPortalActive: !!password,
      contacts: contacts && Array.isArray(contacts) && contacts.length > 0 ? {
        create: contacts.map(c => ({
          name: c.name,
          title: c.title || "",
          email: c.email || "",
          phone: c.phone || "",
          isPrimary: !!c.isPrimary
        }))
      } : undefined
    },
    include: {
      contacts: true,
      customPrices: true,
      productAccess: true
    }
  });

  await prisma.auditLog.create({
    data: {
      action: "CUSTOMER_CREATED",
      entity: "Customer",
      entityId: customer.id,
      performedBy: "SYSTEM",
      details: `Created customer ${customer.fullName} (${customer.customerCode})`
    }
  });

  return customer;
};

/*
|--------------------------------------------------------------------------
| GET CUSTOMERS
|--------------------------------------------------------------------------
*/
const getCustomers = async (searchOrQuery = "", customerType, status) => {
  const query =
    typeof searchOrQuery === "object" && searchOrQuery !== null
      ? searchOrQuery
      : { search: searchOrQuery, customerType, status };

  const { page, limit, skip, take, isAll } = getPaginationParams(query, 25, 200);
  const where = buildCustomerFilters(query.search, query.customerType, query.status);

  if (isAll) {
    const customers = await prisma.customer.findMany({
      where,
      include: {
        contacts: true,
        customPrices: true,
        productAccess: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      customers,
      pagination: formatPaginationMeta(customers.length, 1, customers.length || 1),
    };
  }

  const [total, customers] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      include: {
        contacts: true,
        customPrices: true,
        productAccess: true,
      },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    customers,
    pagination: formatPaginationMeta(total, page, limit),
  };
};

/*
|--------------------------------------------------------------------------
| GET CUSTOMER BY ID (Full History: Orders, Stock Outs, Delivery Notes, Contacts)
|--------------------------------------------------------------------------
*/
const getCustomerById = async (id) => {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      contacts: { orderBy: { isPrimary: "desc" } },
      customPrices: { include: { product: true } },
      productAccess: { include: { product: true } },
      customerOrders: {
        include: {
          orderItems: { include: { product: true } },
          deliveryNote: true
        },
        orderBy: { createdAt: "desc" }
      },
      stockOuts: {
        include: {
          product: true,
          performedBy: { select: { id: true, name: true, email: true } }
        },
        orderBy: { createdAt: "desc" }
      },
      deliveryNotes: { orderBy: { createdAt: "desc" } },
      sales: true,
      tasks: {
        include: {
          assignedUser: { select: { id: true, name: true, email: true, role: true } }
        },
        orderBy: { dueDate: "asc" }
      },
      activities: {
        include: {
          createdBy: { select: { id: true, name: true, email: true, role: true } }
        },
        orderBy: { createdAt: "desc" }
      },
      interactions: { orderBy: { createdAt: "desc" } }
    }
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  const activityTimeline = [
    ...customer.interactions.map(interaction => ({
      id: interaction.id,
      type: interaction.type,
      subject: interaction.subject,
      description: interaction.description,
      createdAt: interaction.createdAt,
      source: "LEGACY_INTERACTION"
    })),
    ...customer.activities.map(activity => ({
      ...activity,
      source: "ACTIVITY"
    }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return {
    ...customer,
    activityTimeline
  };
};

/*
|--------------------------------------------------------------------------
| UPDATE CUSTOMER
|--------------------------------------------------------------------------
*/
const updateCustomer = async (id, payload) => {
  const { contacts, password, ...customerData } = payload;

  const dataToUpdate = { ...customerData };
  if (password) {
    dataToUpdate.passwordHash = await bcrypt.hash(password, 10);
    dataToUpdate.isPortalActive = true;
  }

  const updated = await prisma.customer.update({
    where: { id },
    data: dataToUpdate,
    include: {
      contacts: true,
      customPrices: true,
      productAccess: true
    }
  });

  await prisma.auditLog.create({
    data: {
      action: "CUSTOMER_UPDATED",
      entity: "Customer",
      entityId: id,
      performedBy: "SYSTEM",
      details: `Updated customer information for ${updated.fullName}`
    }
  });

  return updated;
};

/*
|--------------------------------------------------------------------------
| DELETE CUSTOMER
|--------------------------------------------------------------------------
*/
const deleteCustomer = async (id) => {
  return await prisma.customer.delete({ where: { id } });
};

/*
|--------------------------------------------------------------------------
| CONTACT MANAGEMENT (Multiple contacts per customer)
|--------------------------------------------------------------------------
*/
const addContact = async (customerId, contactPayload) => {
  if (contactPayload.isPrimary) {
    await prisma.customerContact.updateMany({
      where: { customerId },
      data: { isPrimary: false }
    });
  }

  return await prisma.customerContact.create({
    data: {
      customerId,
      name: contactPayload.name,
      title: contactPayload.title || "",
      email: contactPayload.email || "",
      phone: contactPayload.phone || "",
      isPrimary: !!contactPayload.isPrimary
    }
  });
};

const deleteContact = async (contactId) => {
  return await prisma.customerContact.delete({ where: { id: contactId } });
};

/*
|--------------------------------------------------------------------------
| CUSTOM PRICING MANAGEMENT
|--------------------------------------------------------------------------
*/
const setCustomPricing = async (customerId, pricingArray) => {
  // Clear old custom prices for this customer and replace
  await prisma.customerPrice.deleteMany({ where: { customerId } });

  if (Array.isArray(pricingArray) && pricingArray.length > 0) {
    await prisma.customerPrice.createMany({
      data: pricingArray.map(item => ({
        customerId,
        productId: item.productId,
        customPrice: Number(item.customPrice)
      }))
    });
  }

  return await prisma.customerPrice.findMany({
    where: { customerId },
    include: { product: true }
  });
};

/*
|--------------------------------------------------------------------------
| CATALOG ACCESS PERMISSIONS MANAGEMENT
|--------------------------------------------------------------------------
*/
const setProductAccess = async (customerId, accessArray) => {
  await prisma.customerProductAccess.deleteMany({ where: { customerId } });

  if (Array.isArray(accessArray) && accessArray.length > 0) {
    await prisma.customerProductAccess.createMany({
      data: accessArray.map(item => ({
        customerId,
        productId: item.productId,
        isAllowed: !!item.isAllowed
      }))
    });
  }

  return await prisma.customerProductAccess.findMany({
    where: { customerId },
    include: { product: true }
  });
};

/*
|--------------------------------------------------------------------------
| B2B PORTAL PASSWORD SETTING
|--------------------------------------------------------------------------
*/
const setPortalAccess = async (customerId, password, isPortalActive = true) => {
  const passwordHash = await bcrypt.hash(password, 10);
  return await prisma.customer.update({
    where: { id: customerId },
    data: { passwordHash, isPortalActive }
  });
};

/*
|--------------------------------------------------------------------------
| GDPR DATA EXPORT
|--------------------------------------------------------------------------
*/
const exportGDPRData = async (customerId) => {
  const customer = await getCustomerById(customerId);
  return {
    gdprExportDate: new Date().toISOString(),
    customerProfile: {
      customerCode: customer.customerCode,
      fullName: customer.fullName,
      companyName: customer.companyName,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      address: customer.address,
      city: customer.city,
      vatNumber: customer.vatNumber,
      notes: customer.notes
    },
    contacts: customer.contacts,
    orders: customer.customerOrders,
    stockOutHistory: customer.stockOuts,
    deliveryNotes: customer.deliveryNotes
  };
};

/*
|--------------------------------------------------------------------------
| GDPR ANONYMIZE CUSTOMER
|--------------------------------------------------------------------------
*/
const anonymizeGDPRData = async (customerId) => {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const anonymized = await prisma.customer.update({
    where: { id: customerId },
    data: {
      fullName: `Anonymized Customer #${randomSuffix}`,
      companyName: "Anonymized Company",
      email: `anonymized_${randomSuffix}@gdpr-removed.local`,
      phoneNumber: `+0000000${randomSuffix}`,
      alternatePhone: null,
      address: "Redacted for GDPR",
      city: "Redacted",
      website: null,
      notes: "Customer data anonymized per GDPR request.",
      passwordHash: null,
      isPortalActive: false
    }
  });

  await prisma.customerContact.deleteMany({ where: { customerId } });

  await prisma.auditLog.create({
    data: {
      action: "GDPR_ANONYMIZED",
      entity: "Customer",
      entityId: customerId,
      performedBy: "SYSTEM",
      details: `Anonymized personal data for customer ID ${customerId}`
    }
  });

  return anonymized;
};

/*
|--------------------------------------------------------------------------
| ADD INTERACTION
|--------------------------------------------------------------------------
*/
const addInteraction = async (customerId, payload, userId) => {
  return prisma.$transaction(async (tx) => {
    const interaction = await tx.customerInteraction.create({
      data: {
        customerId,
        type: payload.type,
        subject: payload.subject,
        description: payload.description
      }
    });

    await logActivity({
      tx,
      type: payload.type === "FOLLOW_UP" ? "FOLLOW_UP" : payload.type,
      subject: payload.subject,
      description: payload.description,
      customerId,
      startsAt: payload.startsAt,
      endsAt: payload.endsAt,
      createdById: userId
    });

    return interaction;
  });
};

const getCustomerInteractions = async (customerId) => {
  return await prisma.customerInteraction.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" }
  });
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  addContact,
  deleteContact,
  setCustomPricing,
  setProductAccess,
  setPortalAccess,
  exportGDPRData,
  anonymizeGDPRData,
  addInteraction,
  getCustomerInteractions
};
