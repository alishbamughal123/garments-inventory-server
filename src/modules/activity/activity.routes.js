const router =
  require("express").Router();

const authMiddleware =
  require("../../middlewares/auth.middleware");

const {
  createActivityHandler,
  getActivitiesHandler,
} = require("./activity.controller");

router.post(
  "/",
  authMiddleware,
  createActivityHandler
);

router.get(
  "/",
  authMiddleware,
  getActivitiesHandler
);

module.exports = router;
