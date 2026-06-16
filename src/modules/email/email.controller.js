const {
  successResponse,
  handleControllerError,
  errorResponse,
} = require("../../utils/responseHandler");
const env = require("../../config/env");
const {
  sendEmailSchema,
  inboundEmailSchema,
  getEmailsQuerySchema,
} = require("./email.validation");
const {
  sendEmail,
  receiveInboundEmail,
  getEmailConversations,
  trackEmailOpen,
} = require("./email.service");

const sendEmailHandler =
  async (req, res) => {
    try {
      const validatedData =
        sendEmailSchema.parse(
          req.body
        );

      const result =
        await sendEmail(
          validatedData,
          req.user.id
        );

      return successResponse(
        res,
        result,
        "Email sent successfully"
      );
    } catch (error) {
      return handleControllerError(
        res,
        error
      );
    }
  };

const getEmailsHandler =
  async (req, res) => {
    try {
      const filters =
        getEmailsQuerySchema.parse(
          req.query
        );

      const result =
        await getEmailConversations(
          filters
        );

      return successResponse(
        res,
        result,
        "Email conversations fetched successfully"
      );
    } catch (error) {
      return handleControllerError(
        res,
        error
      );
    }
  };

const receiveInboundEmailHandler =
  async (req, res) => {
    try {
      if (
        !env.emailInboundSecret ||
        req.headers[
          "x-inbound-secret"
        ] !==
          env.emailInboundSecret
      ) {
        return errorResponse(
          res,
          "Invalid inbound email secret",
          401
        );
      }

      const validatedData =
        inboundEmailSchema.parse(
          req.body
        );

      const result =
        await receiveInboundEmail(
          validatedData
        );

      return successResponse(
        res,
        result,
        "Inbound email logged successfully"
      );
    } catch (error) {
      return handleControllerError(
        res,
        error
      );
    }
  };

const trackEmailOpenHandler =
  async (req, res) => {
    try {
      const pixel =
        await trackEmailOpen(
          req.params.token
        );

      res.setHeader(
        "Content-Type",
        "image/gif"
      );
      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
      );

      return res.status(200).send(pixel);
    } catch {
      return res.status(200).send(
        Buffer.from(
          "R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
          "base64"
        )
      );
    }
  };

module.exports = {
  sendEmailHandler,
  getEmailsHandler,
  receiveInboundEmailHandler,
  trackEmailOpenHandler,
};
