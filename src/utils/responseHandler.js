const successResponse = (res, data, message = "Success") => {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (
  res,
  message = "Something went wrong",
  statusCode = 500
) => {
  const normalizedMessage =
    Array.isArray(message)
      ? message.join(", ")
      : message;

  return res.status(statusCode).json({
    success: false,
    message: normalizedMessage,
  });
};

const handleControllerError = (
  res,
  error
) => {
  if (
    error?.name === "ZodError"
  ) {
    return errorResponse(
      res,
      error.issues?.map(
        (issue) =>
          issue.message
      ) || "Validation failed",
      400
    );
  }

  if (
    /invalid credentials/i.test(
      error?.message || ""
    )
  ) {
    return errorResponse(
      res,
      error.message,
      401
    );
  }

  if (
    /not found/i.test(
      error?.message || ""
    )
  ) {
    return errorResponse(
      res,
      error.message,
      404
    );
  }

  if (
    /already exists/i.test(
      error?.message || ""
    )
  ) {
    return errorResponse(
      res,
      error.message,
      409
    );
  }

  return errorResponse(
    res,
    error?.message
  );
};

module.exports = {
  successResponse,
  errorResponse,
  handleControllerError,
};
