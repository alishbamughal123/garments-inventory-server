const express = require("express");
const {
  createTicketHandler,
  getTicketsHandler,
  getTicketByIdHandler,
  updateTicketHandler,
  deleteTicketHandler,
} = require("./support.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  createTicketHandler
);

router.get(
  "/",
  authMiddleware,
  getTicketsHandler
);

router.get(
  "/:id",
  authMiddleware,
  getTicketByIdHandler
);

router.put(
  "/:id",
  authMiddleware,
  updateTicketHandler
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER"),
  deleteTicketHandler
);

module.exports = router;
