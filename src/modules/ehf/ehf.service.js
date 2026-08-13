const prisma = require("../../config/db");

/**
 * Receive EHF Order 3.0 (UBL XML) and store as CustomerOrder
 */
const processIncomingEhfOrder = async (xmlString, peppolMessageId) => {
  // Store raw EHF document
  const ehfDoc = await prisma.ehfDocument.create({
    data: {
      documentType: "ORDER",
      direction: "INBOUND",
      status: "PROCESSED",
      payloadXml: xmlString,
      peppolMessageId: peppolMessageId || `PEPPOL-MSG-${Date.now()}`,
    },
  });

  // Extract key order references from XML using Regex/string parsing
  const buyerRefMatch = xmlString.match(/<cbc:BuyerReference>([^<]+)<\/cbc:BuyerReference>/i);
  const orderIdMatch = xmlString.match(/<cbc:ID>([^<]+)<\/cbc:ID>/i);
  const totalAmountMatch = xmlString.match(/<cbc:PayableAmount[^>]*>([^<]+)<\/cbc:PayableAmount>/i);
  const customerEmailMatch = xmlString.match(/<cbc:ElectronicMail>([^<]+)<\/cbc:ElectronicMail>/i);

  const orderNumber = orderIdMatch ? orderIdMatch[1] : `EHF-${Date.now()}`;
  const totalAmount = totalAmountMatch ? parseFloat(totalAmountMatch[1]) : 0;
  const buyerEmail = customerEmailMatch ? customerEmailMatch[1] : "ehandel@fredrikstad.kommune.no";

  // Find customer or assign to default Fredrikstad Municipality
  let customer = await prisma.customer.findFirst({
    where: {
      OR: [{ email: buyerEmail }, { companyName: { contains: "Fredrikstad", mode: "insensitive" } }],
    },
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        fullName: "Fredrikstad Kommune Buyer",
        companyName: "Fredrikstad Municipality",
        email: buyerEmail,
        phoneNumber: "+4769306000",
        vatNumber: "NO940029191",
        customerType: "WHOLESALE",
      },
    });
  }

  // Create CustomerOrder
  const order = await prisma.customerOrder.create({
    data: {
      orderNumber,
      customerId: customer.id,
      status: "APPROVED",
      subtotal: totalAmount,
      totalAmount: totalAmount,
      notes: `EHF Peppol Order received via Access Point. Buyer Ref: ${buyerRefMatch ? buyerRefMatch[1] : 'N/A'}`,
    },
  });

  // Update EHF Document record
  await prisma.ehfDocument.update({
    where: { id: ehfDoc.id },
    data: { orderNumber: order.orderNumber },
  });

  return { order, ehfDocument: ehfDoc };
};

/**
 * Generate EHF Despatch Advice (EHF Pakkeseddel 3.0) XML for Peppol network
 */
const generateEhfDespatchAdviceXml = async (orderId) => {
  const order = await prisma.customerOrder.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      orderItems: { include: { product: true } },
      deliveryNote: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const despatchNoteNum = order.deliveryNote?.deliveryNoteNumber || `DN-${order.orderNumber}`;
  const issueDate = new Date().toISOString().split("T")[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<DespatchAdvice xmlns="urn:oasis:names:specification:ubl:schema:xsd:DespatchAdvice-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:CustomizationID>urn:fdc:peppol.eu:poacc:trns:despatch_advice:3</cbc:CustomizationID>
  <cbc:ProfileID>urn:fdc:peppol.eu:poacc:bis:despatch_advice:3</cbc:ProfileID>
  <cbc:ID>${despatchNoteNum}</cbc:ID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  <cbc:DespatchAdviceTypeCode>102</cbc:DespatchAdviceTypeCode>
  <cbc:Note>Nordic Prowear Electronic Packing Slip</cbc:Note>
  
  <cac:OrderReference>
    <cbc:ID>${order.orderNumber}</cbc:ID>
  </cac:OrderReference>

  <cac:DespatchSupplierParty>
    <cac:Party>
      <cbc:EndpointID schemeID="NO:ORGNR">999888777</cbc:EndpointID>
      <cac:PartyName><cbc:Name>Nordic Prowear AS</cbc:Name></cac:PartyName>
    </cac:Party>
  </cac:DespatchSupplierParty>

  <cac:DeliveryCustomerParty>
    <cac:Party>
      <cbc:EndpointID schemeID="NO:ORGNR">${order.customer.vatNumber || "940029191"}</cbc:EndpointID>
      <cac:PartyName><cbc:Name>${order.customer.companyName || order.customer.fullName}</cbc:Name></cac:PartyName>
    </cac:Party>
  </cac:DeliveryCustomerParty>

  ${order.orderItems
    .map(
      (item, idx) => `
  <cac:DespatchLine>
    <cbc:ID>${idx + 1}</cbc:ID>
    <cbc:DeliveredQuantity unitCode="PCE">${item.quantity}</cbc:DeliveredQuantity>
    <cac:OrderLineReference><cbc:LineID>${idx + 1}</cbc:LineID></cac:OrderLineReference>
    <cac:Item>
      <cbc:Name>${item.product.productName}</cbc:Name>
      <cac:SellersItemIdentification><cbc:ID>${item.product.sku}</cbc:ID></cac:SellersItemIdentification>
    </cac:Item>
  </cac:DespatchLine>`
    )
    .join("")}
</DespatchAdvice>`;

  // Record outbound EHF document
  const ehfDoc = await prisma.ehfDocument.create({
    data: {
      documentType: "DESPATCH_ADVICE",
      direction: "OUTBOUND",
      status: "SENT",
      payloadXml: xml,
      orderNumber: order.orderNumber,
      notes: "Generated EHF Pakkeseddel 3.0 Despatch Advice",
    },
  });

  return { xml, ehfDocument: ehfDoc };
};

/**
 * Get all EHF documents
 */
const getEhfDocumentHistory = async () => {
  return await prisma.ehfDocument.findMany({
    orderBy: { createdAt: "desc" },
  });
};

module.exports = {
  processIncomingEhfOrder,
  generateEhfDespatchAdviceXml,
  getEhfDocumentHistory,
};
