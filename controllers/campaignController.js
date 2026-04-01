const campaignService  = require('../services/campaignService');
const approvalService  = require('../services/approvalService');
const { sendSuccess, sendError } = require('../utils/responseHelper');


exports.getAll = async (req, res) => { try { return sendSuccess(res, await campaignService.getAll(req.query)); } catch (e) { return sendError(res, e.message, e.status||500); } };
exports.getById         = async (req, res) => { try { return sendSuccess(res, { campaign: await campaignService.getById(req.params.id) }); } catch (e) { return sendError(res, e.message, e.status||500); } };

exports.create  = async (req, res) => { try { const id = await campaignService.create(req.body, req.user.id); return sendSuccess(res, { campaignId: id }, 'Campaign created.', 201); } catch (e) { return sendError(res, e.message, e.status||500); } };

exports.update  = async (req, res) => { try { await campaignService.update(req.params.id, req.body); return sendSuccess(res, {}, 'Updated.'); } catch (e) { return sendError(res, e.message, e.status||500); } };

exports.remove  = async (req, res) => { try { await campaignService.remove(req.params.id); return sendSuccess(res, {}, 'Deleted.'); } catch (e) { return sendError(res, e.message, e.status||500); } };

exports.submit  = async (req, res) => { try { await approvalService.submit(req.params.id); return sendSuccess(res, {}, 'Submitted for approval.'); } catch (e) { return sendError(res, e.message, e.status||500); } };

exports.approve = async (req, res) => { try { const status = await approvalService.approve(req.params.id, req.user.id); return sendSuccess(res, { status }, 'Campaign approved.'); } catch (e) { return sendError(res, e.message, e.status||500); } };

exports.reject  = async (req, res) => { try { await approvalService.reject(req.params.id, req.body.reason); return sendSuccess(res, {}, 'Campaign rejected.'); } catch (e) { return sendError(res, e.message, e.status||500); } };

exports.sendNow  = async (req, res) => { try { await campaignService.sendNow(req.params.id); return sendSuccess(res, {}, 'Campaign queued for sending.'); } catch (e) { return sendError(res, e.message, e.status||500); } };
