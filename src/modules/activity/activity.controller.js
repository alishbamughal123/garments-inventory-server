const {
  successResponse,
  handleControllerError,
} = require("../../utils/responseHandler");

const {
  createActivitySchema,
  getActivitiesQuerySchema,
} = require("./activity.validation");

const {
  createActivity,
  getActivities,
} = require("./activity.service");

const createActivityHandler =
  async (req, res) => {
    try {
      const validatedData =
        createActivitySchema.parse(
          req.body
        );

      const result =
        await createActivity(
          validatedData,
          req.user.id
        );

      return successResponse(
        res,
        result,
        "Activity created successfully"
      );
    } catch (error) {
      return handleControllerError(
        res,
        error
      );
    }
  };

const getActivitiesHandler =
  async (req, res) => {
    try {
      const filters =
        getActivitiesQuerySchema.parse(
          req.query
        );

      const result =
        await getActivities(
          filters
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

module.exports = {
  createActivityHandler,
  getActivitiesHandler,
};
