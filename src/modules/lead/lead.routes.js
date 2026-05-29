const router =
  require("express").Router();

const {
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
} = require("./lead.controller");

const authMiddleware =
  require("../../middlewares/auth.middleware");

/*
|--------------------------------------------------------------------------
| LEADS CRUD
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authMiddleware,
  createLeadHandler
);

router.get(
  "/",
  authMiddleware,
  getLeadsHandler
);

router.get(
  "/:id",
  authMiddleware,
  getLeadByIdHandler
);

router.patch(
  "/:id",
  authMiddleware,
  updateLeadHandler
);

router.delete(
  "/:id",
  authMiddleware,
  deleteLeadHandler
);

/*
|--------------------------------------------------------------------------
| LEAD ACTIVITIES
|--------------------------------------------------------------------------
*/

router.post(
  "/:id/activities",
  authMiddleware,
  addLeadActivityHandler
);

router.get(
  "/:id/activities",
  authMiddleware,
  getLeadActivitiesHandler
);

/*
|--------------------------------------------------------------------------
| LEAD ASSIGNMENT
|--------------------------------------------------------------------------
*/

router.post(
  "/:id/assign",
  authMiddleware,
  assignLeadHandler
);

/*
|--------------------------------------------------------------------------
| LEAD STAGE UPDATE
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id/stage",
  authMiddleware,
  updateLeadStageHandler
);

/*
|--------------------------------------------------------------------------
| LEAD CONVERSION
|--------------------------------------------------------------------------
*/

router.post(
  "/:id/convert",
  authMiddleware,
  convertLeadHandler
);

module.exports = router;