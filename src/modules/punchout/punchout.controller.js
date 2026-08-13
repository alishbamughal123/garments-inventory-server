const {
  createPunchOutSession,
  getPunchOutCatalog,
  prepareReturnCartPayload,
} = require("./punchout.service");
const { successResponse, errorResponse } = require("../../utils/responseHandler");
const prisma = require("../../config/db");

/**
 * Endpoint for Visma eHandel to initiate PunchOut session
 */
const initiatePunchOut = async (req, res) => {
  try {
    const { buyerCookie, buyerHookUrl, customerCode, customerEmail, protocol } = req.body;

    // Find customer or default to municipality customer profile
    let customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { customerCode: customerCode || undefined },
          { email: customerEmail || undefined },
          { companyName: { contains: "Fredrikstad", mode: "insensitive" } },
        ],
      },
    });

    if (!customer) {
      // Create default customer profile for Fredrikstad Municipality if not existing
      customer = await prisma.customer.create({
        data: {
          fullName: "Fredrikstad Kommune Buyer",
          companyName: "Fredrikstad Municipality",
          email: customerEmail || "ehandel@fredrikstad.kommune.no",
          phoneNumber: "+4769306000",
          vatNumber: "NO940029191",
          customerType: "WHOLESALE",
        },
      });
    }

    const session = await createPunchOutSession({
      buyerCookie: buyerCookie || req.query.BUYER_COOKIE || "VISMA_COOKIE_DEFAULT",
      buyerHookUrl: buyerHookUrl || req.query.HOOK_URL || "https://visma-ehandel.fredrikstad.kommune.no/punchout/return",
      customerId: customer.id,
      protocol: protocol || (req.query.HOOK_URL ? "OCI" : "cXML"),
    });

    const redirectUrl = `${process.env.CLIENT_ORIGINS || "http://localhost:5173"}/punchout?sessionId=${session.sessionId}`;

    if (req.headers["content-type"]?.includes("xml") || req.body.cxml) {
      // Return cXML PunchOutSetupResponse
      const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<cXML payloadID="${Date.now()}@nordicprowear.no" timestamp="${new Date().toISOString()}">
  <Response>
    <Status code="200" text="OK"/>
    <PunchOutSetupResponse>
      <StartPage><URL>${redirectUrl}</URL></StartPage>
    </PunchOutSetupResponse>
  </Response>
</cXML>`;
      res.setHeader("Content-Type", "application/xml");
      return res.send(xmlResponse);
    }

    return successResponse(
      res,
      { sessionId: session.sessionId, redirectUrl, session },
      "PunchOut session initiated"
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

/**
 * Get PunchOut portal catalog for active session
 */
const getCatalog = async (req, res) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) {
      return errorResponse(res, "Session ID is required");
    }

    const catalogData = await getPunchOutCatalog(sessionId);
    return successResponse(res, catalogData, "PunchOut catalog loaded");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

/**
 * Return Cart to Visma eHandel
 */
const returnCart = async (req, res) => {
  try {
    const { sessionId, cartItems } = req.body;
    if (!sessionId || !Array.isArray(cartItems)) {
      return errorResponse(res, "Invalid sessionId or cartItems");
    }

    const payload = await prepareReturnCartPayload(sessionId, cartItems);
    return successResponse(res, payload, "PunchOut Cart return payload generated successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  initiatePunchOut,
  getCatalog,
  returnCart,
};
