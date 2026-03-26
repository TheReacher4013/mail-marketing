const { validationResult } = require('express-validator');
const { sendError }        = require('../utils/responseHelper');


const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation failed', 422, errors.array());
  }
  next();
};

module.exports = { validateRequest };