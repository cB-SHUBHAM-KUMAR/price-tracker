/**
 * @fileoverview Centralized response formatter — ensures every success
 * response follows the same shape across the entire API.
 */

class ResponseFormatter {
  /**
   * 200 OK
   */
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * 201 Created
   */
  static created(res, data = null, message = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  /**
   * 204 No Content
   */
  static noContent(res) {
    return res.status(204).send();
  }

  /**
   * Paginated list response
   */
  static paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit),
      },
    });
  }

  /**
   * Error response helper.
   */
  static error(res, message = 'Error', statusCode = 400, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors ? { errors } : {}),
    });
  }
}

module.exports = ResponseFormatter;
