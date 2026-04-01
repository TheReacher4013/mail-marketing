const templateService = require('../services/templateService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

exports.getAll  = async (req, res) => { try { return sendSuccess(res, await templateService.getAll(req.query)); } catch (e) { return sendError(res, e.message, e.status||500); } };

exports.getById = async (req, res) => { try { return sendSuccess(res, { template: await templateService.getById(req.params.id) }); } catch (e) { return sendError(res, e.message, e.status||500); } };

exports.create  = async (req, res) => { try { const id = await templateService.create(req.body, req.user.id); return sendSuccess(res, { templateId: id }, 'Template created.', 201); } catch (e) { return sendError(res, e.message, e.status||500); } };

exports.update  = async (req, res) => { try { await templateService.update(req.params.id, req.body); return sendSuccess(res, {}, 'Updated.'); } catch (e) { return sendError(res, e.message, e.status||500); } };

exports.remove  = async (req, res) => { try { await templateService.remove(req.params.id); return sendSuccess(res, {}, 'Deleted.'); } catch (e) { return sendError(res, e.message, e.status||500); } };
