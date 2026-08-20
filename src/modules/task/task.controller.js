const {
  successResponse,
  handleControllerError,
} = require("../../utils/responseHandler");

const {
  createTaskSchema,
  updateTaskSchema,
  assignTaskSchema,
  createReminderSchema,
  getTasksQuerySchema,
} = require("./task.validation");

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
  addReminder,
} = require("./task.service");

const createTaskHandler =
  async (req, res) => {
    try {
      const validatedData =
        createTaskSchema.parse(
          req.body
        );

      const result =
        await createTask(
          validatedData,
          req.user.id
        );

      return successResponse(
        res,
        result,
        "Task created successfully"
      );
    } catch (error) {
      return handleControllerError(
        res,
        error
      );
    }
  };

const getTasksHandler =
  async (req, res) => {
    try {
      const validatedQuery =
        getTasksQuerySchema.parse(
          req.query
        );

      const result =
        await getTasks(
          validatedQuery
        );

      return successResponse(
        res,
        result,
        "Tasks fetched successfully",
        result.pagination
      );
    } catch (error) {
      return handleControllerError(
        res,
        error
      );
    }
  };

const getTaskByIdHandler =
  async (req, res) => {
    try {
      const result =
        await getTaskById(
          req.params.id
        );

      return successResponse(
        res,
        result,
        "Task fetched successfully"
      );
    } catch (error) {
      return handleControllerError(
        res,
        error
      );
    }
  };

const updateTaskHandler =
  async (req, res) => {
    try {
      const validatedData =
        updateTaskSchema.parse(
          req.body
        );

      const result =
        await updateTask(
          req.params.id,
          validatedData,
          req.user.id
        );

      return successResponse(
        res,
        result,
        "Task updated successfully"
      );
    } catch (error) {
      return handleControllerError(
        res,
        error
      );
    }
  };

const deleteTaskHandler =
  async (req, res) => {
    try {
      const result =
        await deleteTask(
          req.params.id
        );

      return successResponse(
        res,
        result,
        "Task deleted successfully"
      );
    } catch (error) {
      return handleControllerError(
        res,
        error
      );
    }
  };

const assignTaskHandler =
  async (req, res) => {
    try {
      const validatedData =
        assignTaskSchema.parse(
          req.body
        );

      const result =
        await assignTask(
          req.params.id,
          validatedData.assignedUserId ||
            null,
          req.user.id,
          validatedData.note
        );

      return successResponse(
        res,
        result,
        "Task assignment updated successfully"
      );
    } catch (error) {
      return handleControllerError(
        res,
        error
      );
    }
  };

const addReminderHandler =
  async (req, res) => {
    try {
      const validatedData =
        createReminderSchema.parse(
          req.body
        );

      const result =
        await addReminder(
          req.params.id,
          validatedData,
          req.user.id
        );

      return successResponse(
        res,
        result,
        "Reminder added successfully"
      );
    } catch (error) {
      return handleControllerError(
        res,
        error
      );
    }
  };

module.exports = {
  createTaskHandler,
  getTasksHandler,
  getTaskByIdHandler,
  updateTaskHandler,
  deleteTaskHandler,
  assignTaskHandler,
  addReminderHandler,
};
