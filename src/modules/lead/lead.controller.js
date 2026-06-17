const {
  successResponse,
  handleControllerError,
} = require("../../utils/responseHandler");

const {
  createLeadSchema,
  createActivitySchema,
} = require("./lead.validation");

const {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  addLeadActivity,
  getLeadActivities,
  assignLead,
  updateLeadStage,
  convertLeadToCustomer,
} = require("./lead.service");

/*
|--------------------------------------------------------------------------
| CREATE LEAD
|--------------------------------------------------------------------------
*/

const createLeadHandler =
  async (req, res) => {
    try {
      const validatedData =
        createLeadSchema.parse(
          req.body
        );

      const result =
        await createLead(
          validatedData,
          req.user.id
        );

      return successResponse(
        res,
        result,
        "Lead created successfully"
      );
    } catch (error) {
      return handleControllerError(
        res,
        error
      );
    }
  };

/*
|--------------------------------------------------------------------------
| GET ALL LEADS
|--------------------------------------------------------------------------
*/

const getLeadsHandler =
  async (req, res) => {
    try {
      const { search } = req.query;
      const result =
        await getLeads(search);

      return successResponse(
        res,
        result,
        "Leads fetched successfully"
      );
    } catch (error) {
      return handleControllerError(
        res,
        error
      );
    }
  };

/*
|--------------------------------------------------------------------------
| GET LEAD BY ID
|--------------------------------------------------------------------------
*/

const getLeadByIdHandler =
  async (req, res) => {
    try {
      const result =
        await getLeadById(
          req.params.id
        );

      return successResponse(
        res,
        result,
        "Lead fetched successfully"
      );
    } catch (error) {
      return handleControllerError(
        res,
        error
      );
    }
  };

/*
|--------------------------------------------------------------------------
| UPDATE LEAD
|--------------------------------------------------------------------------
*/

const updateLeadHandler =
  async (req, res) => {
    try {
      const result =
        await updateLead(
          req.params.id,
          req.body
        );

      return successResponse(
        res,
        result,
        "Lead updated successfully"
      );
    } catch (error) {
      return handleControllerError(
        res,
        error
      );
    }
  };

/*
|--------------------------------------------------------------------------
| DELETE LEAD
|--------------------------------------------------------------------------
*/

const deleteLeadHandler =
  async (req, res) => {
    try {
      const result =
        await deleteLead(
          req.params.id
        );

      return successResponse(
        res,
        result,
        "Lead deleted successfully"
      );
    } catch (error) {
      return handleControllerError(
        res,
        error
      );
    }
  };

/*
|--------------------------------------------------------------------------
| ADD LEAD ACTIVITY
|--------------------------------------------------------------------------
*/

const addLeadActivityHandler =
  async (req, res) => {
    try {
      const validatedData =
        createActivitySchema.parse(
          req.body
        );

      const result =
        await addLeadActivity(
          req.params.id,
          validatedData,
          req.user.id
        );

      return successResponse(
        res,
        result,
        "Activity added successfully"
      );
    } catch (error) {
      return handleControllerError(
        res,
        error
      );
    }
  };

/*
|--------------------------------------------------------------------------
| GET LEAD ACTIVITIES
|--------------------------------------------------------------------------
*/

const getLeadActivitiesHandler =
  async (req, res) => {
    try {
      const result =
        await getLeadActivities(
          req.params.id
        );

      return successResponse(
        res,
        result,
        "Activities fetched successfully"
      );
    } catch (error) {
      return handleControllerError(
        res,
        error
      );
    }
  };

/*
|--------------------------------------------------------------------------
| ASSIGN LEAD
|--------------------------------------------------------------------------
*/

const assignLeadHandler =
  async (req, res) => {
    try {
      const result =
        await assignLead(
          req.params.id,
          req.body.newOwnerId,
          req.user.id
        );

      return successResponse(
        res,
        result,
        "Lead assigned successfully"
      );
    } catch (error) {
      return handleControllerError(
        res,
        error
      );
    }
  };

/*
|--------------------------------------------------------------------------
| UPDATE LEAD STAGE
|--------------------------------------------------------------------------
*/

const updateLeadStageHandler =
  async (req, res) => {
    try {
      const result =
        await updateLeadStage(
          req.params.id,
          req.body.status,
          req.user.id
        );

      return successResponse(
        res,
        result,
        "Lead stage updated successfully"
      );
    } catch (error) {
      return handleControllerError(
        res,
        error
      );
    }
  };

/*
|--------------------------------------------------------------------------
| CONVERT LEAD TO CUSTOMER
|--------------------------------------------------------------------------
*/

const convertLeadHandler =
  async (req, res) => {
    try {
      const result =
        await convertLeadToCustomer(
          req.params.id
        );

      return successResponse(
        res,
        result,
        "Lead converted successfully"
      );
    } catch (error) {
      return handleControllerError(
        res,
        error
      );
    }
  };

module.exports = {
  createLeadHandler,
  getLeadsHandler,
  getLeadByIdHandler,
  updateLeadHandler,
  deleteLeadHandler,
  addLeadActivityHandler,
  getLeadActivitiesHandler,
  assignLeadHandler,
  updateLeadStageHandler,
  convertLeadHandler,
};
