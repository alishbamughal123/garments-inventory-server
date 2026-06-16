const router =
  require("express").Router();

const authMiddleware =
  require("../../middlewares/auth.middleware");

const {
  sendEmailHandler,
  getEmailsHandler,
  receiveInboundEmailHandler,
  trackEmailOpenHandler,
} = require("./email.controller");

router.post(
  "/",
  authMiddleware,
  sendEmailHandler
);

router.get(
  "/",
  authMiddleware,
  getEmailsHandler
);

router.post(
  "/inbound",
  receiveInboundEmailHandler
);

router.get(
  "/track/open/:token",
  trackEmailOpenHandler
);

module.exports = router;
