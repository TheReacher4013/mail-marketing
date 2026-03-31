const automationService = require('../services/automationService');
const triggerService    = require('../services/triggerService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

exports.getAll   = async (req, res) => { try { return sendSuccess(res, await automationService.getAll(req.query)); } catch (e) { return sendError(res, e.message, e.status||500); } };
exports.getById  = async (req, res) => { try { return sendSuccess(res, { automation: await automationService.getById(req.params.id) }); } catch (e) { return sendError(res, e.message, e.status||500); } };
exports.create   = async (req, res) => { try { const id = await automationService.create(req.body, req.user.id); return sendSuccess(res, { automationId: id }, 'Automation created.', 201); } catch (e) { return sendError(res, e.message, e.status||500); } };
exports.update   = async (req, res) => { try { await automationService.update(req.params.id, req.body); return sendSuccess(res, {}, 'Updated.'); } catch (e) { return sendError(res, e.message, e.status||500); } };
exports.remove   = async (req, res) => { try { await automationService.remove(req.params.id); return sendSuccess(res, {}, 'Deleted.'); } catch (e) { return sendError(res, e.message, e.status||500); } };
exports.trigger  = async (req, res) => { try { const r = await triggerService.trigger(req.body.trigger_event, req.body.contact_id); return sendSuccess(res, r, 'Automation triggered.'); } catch (e) { return sendError(res, e.message, e.status||500); } };
