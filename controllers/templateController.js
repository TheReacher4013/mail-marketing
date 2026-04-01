const templateService = require('../services/templateService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

const handleError = (res, error) => {
  return sendError(res, error.message, error.status || 500);
};


exports.getAll = async (req, res) => {
  try {
    const templates = await templateService.getAll(req.query);
    return sendSuccess(res, templates);
  } catch (error) {
    return handleError(res, error);
  }
};


exports.getById = async (req, res) => {
  try {
    const template = await templateService.getById(req.params.id);
    return sendSuccess(res, { template });
  } catch (error) {
    return handleError(res, error);
  }
};


exports.create = async (req, res) => {
  try {
    const templateId = await templateService.create(req.body, req.user.id);
    return sendSuccess(res, { templateId }, 'Template created.', 201);
  } catch (error) {
    return handleError(res, error);
  }
};

exports.update = async (req, res) => {
  try {
    await templateService.update(req.params.id, req.body);
    return sendSuccess(res, {}, 'Updated.');
  } catch (error) {
    return handleError(res, error);
  }
};


exports.remove = async (req, res) => {
  try {
    await templateService.remove(req.params.id);
    return sendSuccess(res, {}, 'Deleted.');
  } catch (error) {
    return handleError(res, error);
  }
};