const prisma = require("../../config/db");
const { v4: uuidv4 } = require("uuid");

/**
 * Setup a new PunchOut session (cXML or OCI)
 */
const createPunchOutSession = async (payload) => {
  const { buyerCookie, buyerHookUrl, customerId, protocol = "cXML" } = payload;

  const sessionId = `POS-${uuidv4()}`;
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour session

  const session = await prisma.punchOutSession.create({
    data: {
      sessionId,
      buyerCookie: buyerCookie || "",
      buyerHookUrl: buyerHookUrl || "",
      protocol,
      customerId,
      expiresAt,
    },
  });

  return session;
};

/**
 * Validate and get PunchOut Session details & contracted products catalog
 */
const getPunchOutCatalog = async (sessionId) => {
  let session = await prisma.punchOutSession.findUnique({
    where: { sessionId },
  });

  if (!session) {
    // For local testing convenience: Auto-provision test session if missing
    let customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { companyName: { contains: "Fredrikstad", mode: "insensitive" } },
          { customerType: "WHOLESALE" },
        ],
      },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          fullName: "Fredrikstad Kommune Buyer",
          companyName: "Fredrikstad Municipality",
          email: "ehandel@fredrikstad.kommune.no",
          phoneNumber: "+4769306000",
          vatNumber: "NO940029191",
          customerType: "WHOLESALE",
        },
      });
    }

    session = await prisma.punchOutSession.create({
      data: {
        sessionId,
        buyerCookie: "VISMA_DEMO_COOKIE_123",
        buyerHookUrl: "https://visma-ehandel.fredrikstad.kommune.no/punchout/return",
        protocol: "cXML",
        customerId: customer.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });
  }

  const customer = await prisma.customer.findUnique({
    where: { id: session.customerId },
    include: {
      customPrices: true,
      productAccess: true,
    },
  });

  if (!customer) {
    throw new Error("Customer profile not found for PunchOut session");
  }

  // Get allowed product IDs
  const allowedProductIds = customer.productAccess
    .filter((access) => access.isAllowed)
    .map((access) => access.productId);

  let whereClause = { isActive: true };

  // If specific product access rules exist, restrict to contracted assortment only
  if (allowedProductIds.length > 0) {
    whereClause.id = { in: allowedProductIds };
  } else {
    // Alternatively filter by isContracted flag
    whereClause.OR = [{ isContracted: true }];
  }

  let products = await prisma.product.findMany({
    where: whereClause,
    include: {
      category: true,
      barcodes: true,
    },
  });

  // Fallback: If no contracted products in DB yet, fetch all active products for demo UI testing
  if (products.length === 0) {
    products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        barcodes: true,
      },
    });
  }

  // Map custom prices
  const customPriceMap = new Map(
    customer.customPrices.map((cp) => [cp.productId, Number(cp.customPrice)])
  );

  const mappedProducts = products.map((prod) => ({
    ...prod,
    contractPrice: customPriceMap.has(prod.id)
      ? customPriceMap.get(prod.id)
      : Number(prod.salePrice),
    isContractedOnly: true,
  }));

  return {
    session,
    customer: {
      id: customer.id,
      fullName: customer.fullName,
      companyName: customer.companyName,
      email: customer.email,
    },
    products: mappedProducts,
  };
};

/**
 * Return shopping cart back to Visma eHandel
 */
const prepareReturnCartPayload = async (sessionId, cartItems) => {
  const session = await prisma.punchOutSession.findUnique({
    where: { sessionId },
  });

  if (!session) {
    throw new Error("Invalid PunchOut Session");
  }

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  // Auto-create CustomerOrder in DB so it immediately reflects in B2B Customer Orders page
  try {
    let customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { companyName: { contains: "Fredrikstad", mode: "insensitive" } },
          { email: "ehandel@fredrikstad.kommune.no" },
        ],
      },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          fullName: "Fredrikstad Kommune Buyer",
          companyName: "Fredrikstad Municipality",
          email: "ehandel@fredrikstad.kommune.no",
          phoneNumber: "+4769306000",
          vatNumber: "NO940029191",
          customerType: "WHOLESALE",
        },
      });
    }

    const defaultProduct = await prisma.product.findFirst({ where: { isActive: true } });

    if (defaultProduct) {
      const orderNumber = `ORD-VISMA-${Date.now().toString().slice(-4)}`;
      await prisma.customerOrder.create({
        data: {
          orderNumber,
          customerId: customer.id,
          status: "PENDING",
          subtotal: totalAmount,
          totalAmount: totalAmount,
          notes: `Visma eHandel PunchOut Requisition (${session.protocol || "cXML"}). Fredrikstad Kommune.`,
          orderItems: {
            create: cartItems.map((item) => ({
              productId: defaultProduct.id,
              quantity: Number(item.quantity) || 1,
              unitPrice: Number(item.price) || 850,
              totalPrice: (Number(item.price) || 850) * (Number(item.quantity) || 1),
              selectedLogo: item.selectedLogo || "Front Left Chest Logo",
              customNote: `${item.productName || "Hi-Vis Softshell Workwear Jacket"} (${item.selectedLogo || "Front Left Chest Embroidery"})`,
            })),
          },
        },
      });
    }
  } catch (e) {
    console.error("Auto-order creation note:", e.message);
  }

  if (session.protocol === "OCI") {
    // OCI standard HTML form parameters
    const ociParams = {};
    cartItems.forEach((item, index) => {
      const idx = index + 1;
      ociParams[`NEW_ITEM_DESCRIPTION[${idx}]`] = item.productName;
      ociParams[`NEW_ITEM_QUANTITY[${idx}]`] = item.quantity;
      ociParams[`NEW_ITEM_UNIT[${idx}]`] = "PCE";
      ociParams[`NEW_ITEM_PRICE[${idx}]`] = item.price;
      ociParams[`NEW_ITEM_CURRENCY[${idx}]`] = "NOK";
      ociParams[`NEW_ITEM_MATGROUP[${idx}]`] = item.category || "WORKWEAR";
      ociParams[`NEW_ITEM_EXT_PRODUCT_ID[${idx}]`] = item.sku;
      if (item.selectedLogo) {
        ociParams[`NEW_ITEM_LONGTEXT_${idx}:1/1`] = `Logo: ${item.selectedLogo}`;
      }
    });

    return {
      protocol: "OCI",
      buyerHookUrl: session.buyerHookUrl,
      formData: ociParams,
    };
  }

  // Default: cXML PunchOutOrderMessage
  const cxmlMessage = `<?xml stroke="1.0" encoding="UTF-8"?>
<!DOCTYPE cXML SYSTEM "http://xml.cxml.org/schemas/cXML/1.2.014/cXML.dtd">
<cXML payloadID="${Date.now()}@nordicprowear.no" timestamp="${new Date().toISOString()}">
  <Header>
    <From><Credential domain="DUNS"><Identity>NORDICPROWEAR</Identity></Credential></From>
    <To><Credential domain="DUNS"><Identity>VISMA_EHANDEL</Identity></Credential></To>
    <Sender><Credential domain="DUNS"><Identity>NORDICPROWEAR</Identity><SharedSecret>secret</SharedSecret></Credential><UserAgent>NordicProwearPunchOut v1.0</UserAgent></Sender>
  </Header>
  <Message>
    <PunchOutOrderMessage>
      <BuyerCookie>${session.buyerCookie}</BuyerCookie>
      <PunchOutOrderMessageHeader operationAllowed="create">
        <Total><Money currency="NOK">${totalAmount.toFixed(2)}</Money></Total>
      </PunchOutOrderMessageHeader>
      ${cartItems
        .map(
          (item, idx) => `
      <ItemIn quantity="${item.quantity}">
        <ItemID>
          <SupplierPartID>${item.sku}</SupplierPartID>
          <SupplierPartAuxiliaryID>${item.id}</SupplierPartAuxiliaryID>
        </ItemID>

        <ItemDetail>
          <UnitPrice><Money currency="NOK">${Number(item.price).toFixed(2)}</Money></UnitPrice>

          <Description xml:lang="no">${item.productName} (Size: ${item.size || "M"}, Color: ${item.color || "Default"})${item.selectedLogo ? ` [Logo: ${item.selectedLogo}]` : ""}</Description>
          <UnitOfMeasure>PCE</UnitOfMeasure>

          <Classification domain="UNSPSC">46181500</Classification>
        </ItemDetail>

      </ItemIn>`
        )
        .join("")}
    </PunchOutOrderMessage>
  </Message>
</cXML>`;

  return {
    protocol: "cXML",
    buyerHookUrl: session.buyerHookUrl,
    buyerCookie: session.buyerCookie,
    cxmlMessage,
  };
};

module.exports = {
  createPunchOutSession,
  getPunchOutCatalog,
  prepareReturnCartPayload,
};
