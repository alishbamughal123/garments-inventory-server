const {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
} = require("./support.service");
const {
  successResponse,
  errorResponse,
  handleControllerError,
} = require("../../utils/responseHandler");
const { createTicketSchema, updateTicketSchema } = require("./support.validation");

const createTicketHandler = async (req, res) => {
  try {
    const validatedData = createTicketSchema.parse(req.body);
    const result = await createTicket(validatedData, req.user.id);
    return successResponse(res, result, "Support ticket created successfully", 201);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const getTicketsHandler = async (req, res) => {
  try {
    const filters = req.query;
    const result = await getTickets(filters);
    return successResponse(res, result, "Support tickets fetched successfully");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const getTicketByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getTicketById(id);
    if (!result) {
      return errorResponse(res, "Support ticket not found", 404);
    }
    return successResponse(res, result, "Support ticket details fetched successfully");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const updateTicketHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateTicketSchema.parse(req.body);
    const result = await updateTicket(id, validatedData);
    return successResponse(res, result, "Support ticket updated successfully");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const deleteTicketHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteTicket(id);
    return successResponse(res, null, "Support ticket deleted successfully");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

module.exports = {
  createTicketHandler,
  getTicketsHandler,
  getTicketByIdHandler,
  updateTicketHandler,
  deleteTicketHandler,
};
