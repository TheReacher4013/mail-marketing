const campaignService  = require('../services/campaignService');
const approvalService  = require('../services/approvalService');
const { sendSuccess, sendError } = require('../utils/responseHelper');


const handleError = (res, error) => {
  return sendError(res, error.message, error.status || 500);
};


exports.getAll = async (req, res) => {
  try {
    const campaigns = await campaignService.getAll(req.query);
    return sendSuccess(res, campaigns);
  } catch (error) {
    return handleError(res, error);
  }
};


exports.getById = async (req, res) => {
  try {
    const campaign = await campaignService.getById(req.params.id);
    return sendSuccess(res, { campaign });
  } catch (error) {
    return handleError(res, error);
  }
};


exports.create = async (req, res) => {
  try {
    const campaignId = await campaignService.create(req.body, req.user.id);
    return sendSuccess(res, { campaignId }, 'Campaign created.', 201);
  } catch (error) {
    return handleError(res, error);
  }
};

exports.update = async (req, res) => {
  try {
    await campaignService.update(req.params.id, req.body);
    return sendSuccess(res, {}, 'Updated.');
  } catch (error) {
    return handleError(res, error);
  }
};


exports.remove = async (req, res) => {
  try {
    await campaignService.remove(req.params.id);
    return sendSuccess(res, {}, 'Deleted.');
  } catch (error) {
    return handleError(res, error);
  }
};


exports.submit = async (req, res) => {
  try {
    await approvalService.submit(req.params.id);
    return sendSuccess(res, {}, 'Submitted for approval.');
  } catch (error) {
    return handleError(res, error);
  }
};


exports.approve = async (req, res) => {
  try {
    const status = await approvalService.approve(req.params.id, req.user.id);
    return sendSuccess(res, { status }, 'Campaign approved.');
  } catch (error) {
    return handleError(res, error);
  }
};


exports.reject = async (req, res) => {
  try {
    await approvalService.reject(req.params.id, req.body.reason);
    return sendSuccess(res, {}, 'Campaign rejected.');
  } catch (error) {
    return handleError(res, error);
  }
};

exports.sendNow = async (req, res) => {
  try {
    await campaignService.sendNow(req.params.id);
    return sendSuccess(res, {}, 'Campaign queued for sending.');
  } catch (error) {
    return handleError(res, error);
  }
};