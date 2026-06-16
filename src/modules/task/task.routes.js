const router =
  require("express").Router();

const authMiddleware =
  require("../../middlewares/auth.middleware");

const {
  createTaskHandler,
  getTasksHandler,
  getTaskByIdHandler,
  updateTaskHandler,
  deleteTaskHandler,
  assignTaskHandler,
  addReminderHandler,
} = require("./task.controller");

router.post(
  "/",
  authMiddleware,
  createTaskHandler
);

router.get(
  "/",
  authMiddleware,
  getTasksHandler
);

router.get(
  "/:id",
  authMiddleware,
  getTaskByIdHandler
);

router.patch(
  "/:id",
  authMiddleware,
  updateTaskHandler
);

router.delete(
  "/:id",
  authMiddleware,
  deleteTaskHandler
);

router.post(
  "/:id/assign",
  authMiddleware,
  assignTaskHandler
);

router.post(
  "/:id/reminder",
  authMiddleware,
  addReminderHandler
);

module.exports = router;
