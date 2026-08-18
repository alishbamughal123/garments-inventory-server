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

  // Prisma Unique Constraint Violation
  if (
    error?.code === "P2002" ||
    /unique constraint/i.test(error?.message || "")
  ) {
    const fieldInfo = error?.meta?.target ? ` on (${Array.isArray(error.meta.target) ? error.meta.target.join(", ") : error.meta.target})` : "";
    return errorResponse(
      res,
      `A record with this identifier already exists${fieldInfo}.`,
      409
    );
  }

  // Prisma Record Not Found
  if (
    error?.code === "P2025" ||
    /not found/i.test(error?.message || "")
  ) {
    return errorResponse(
      res,
      error.message || "Requested resource not found",
      404
    );
  }

  // Prisma Foreign Key Constraint Violation
  if (error?.code === "P2003") {
    return errorResponse(
      res,
      "Related foreign key record not found or operation violates data relationship.",
      400
    );
  }

  if (
    /invalid credentials/i.test(
      error?.message || ""
    ) ||
    /invalid email/i.test(
      error?.message || ""
    ) ||
    /disabled/i.test(
      error?.message || ""
    ) ||
    /unauthorized/i.test(
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

  if (
    /required|invalid|insufficient|empty|must contain|cannot|not allowed|missing/i.test(
      error?.message || ""
    )
  ) {
    return errorResponse(
      res,
      error.message,
      400
    );
  }

  return errorResponse(
    res,
    error?.message || "Internal server error",
    500
  );
};

module.exports = {
  successResponse,
  errorResponse,
  handleControllerError,
};

