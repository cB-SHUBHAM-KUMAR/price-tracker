const AppError = require('./AppError');

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized — please log in') {
    super(message, 401);
  }
}

module.exports = UnauthorizedError;
