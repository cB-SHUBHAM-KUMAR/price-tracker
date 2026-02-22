const AppError = require('./AppError');

class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors = []) {
    super(message, 422);
    this.errors = errors;
  }
}

module.exports = ValidationError;
