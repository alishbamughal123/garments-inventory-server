const {
  stockIn,
  stockOut,
  getTransactions,
  getDeliveryNotes,
  getDeliveryNoteById
} = require("./inventory.service");

const { successResponse, errorResponse } = require("../../utils/responseHandler");

/*
|--------------------------------------------------------------------------
| STOCK IN
|--------------------------------------------------------------------------
*/
const addStock = async (req, res) => {
  try {
    const result = await stockIn(req.body, req.user.id);
    return successResponse(res, result, "Stock added successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

/*
|--------------------------------------------------------------------------
| STOCK OUT (Task 2: Mandatory Customer Selection & Parcel Weight)
|--------------------------------------------------------------------------
*/
const removeStock = async (req, res) => {
  try {
    const result = await stockOut(req.body, req.user.id);
    return successResponse(res, result, "Stock deducted and Delivery Note created successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

/*
|--------------------------------------------------------------------------
| GET INVENTORY TRANSACTIONS
|--------------------------------------------------------------------------
*/
const getAllTransactions = async (req, res) => {
  try {
    const { transactionType, customerId } = req.query;
    const result = await getTransactions(transactionType, customerId);
    return successResponse(res, result, "Transactions fetched successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

/*
|--------------------------------------------------------------------------
| GET DELIVERY NOTES (For CRM Storage & PDF Reprinting)
|--------------------------------------------------------------------------
*/
const fetchDeliveryNotes = async (req, res) => {
  try {
    const { customerId } = req.query;
    const notes = await getDeliveryNotes(customerId);
    return successResponse(res, notes, "Delivery notes fetched successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const fetchDeliveryNoteDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await getDeliveryNoteById(id);
    return successResponse(res, note, "Delivery note details fetched");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  addStock,
  removeStock,
  getAllTransactions,
  fetchDeliveryNotes,
  fetchDeliveryNoteDetails
};