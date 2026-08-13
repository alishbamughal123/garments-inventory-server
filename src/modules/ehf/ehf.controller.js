const {
  processIncomingEhfOrder,
  generateEhfDespatchAdviceXml,
  getEhfDocumentHistory,
} = require("./ehf.service");
const { successResponse, errorResponse } = require("../../utils/responseHandler");

/**
 * Webhook/Endpoint to receive EHF Orders from Peppol Access Point
 */
const receiveOrder = async (req, res) => {
  try {
    const xmlString = typeof req.body === "string" ? req.body : req.body.xmlPayload || req.body.xml;
    const peppolMessageId = req.headers["x-peppol-message-id"] || req.body.peppolMessageId;

    if (!xmlString) {
      return errorResponse(res, "XML payload is required for EHF order receiving");
    }

    const result = await processIncomingEhfOrder(xmlString, peppolMessageId);
    return successResponse(res, result, "EHF Order processed successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

/**
 * Generate EHF Despatch Advice (Packing Slip) XML for an order
 */
const generateDespatchAdvice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const result = await generateEhfDespatchAdviceXml(orderId);

    if (req.headers.accept?.includes("application/xml")) {
      res.setHeader("Content-Type", "application/xml");
      return res.send(result.xml);
    }

    return successResponse(res, result, "EHF Despatch Advice generated successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

/**
 * Get history of all EHF documents
 */
const getHistory = async (req, res) => {
  try {
    const history = await getEhfDocumentHistory();
    return successResponse(res, history, "EHF document history retrieved");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  receiveOrder,
  generateDespatchAdvice,
  getHistory,
};
