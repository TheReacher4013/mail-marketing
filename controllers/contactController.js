const contactService = require('../services/contactService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

exports.getAll  = async (req, res) => { try { return sendSuccess(res, await contactService.getAll(req.query)); } catch (e) { return sendError(res, e.message, e.status||500); } };
exports.getById = async (req, res) => { try { return sendSuccess(res, { contact: await contactService.getById(req.params.id) }); } catch (e) { return sendError(res, e.message, e.status||500); } };
exports.create  = async (req, res) => { try { const id = await contactService.create(req.body, req.user.id); return sendSuccess(res, { contactId: id }, 'Contact created.', 201); } catch (e) { return sendError(res, e.message, e.status||500); } };
exports.update  = async (req, res) =>
   { try { await contactService.update(req.params.id, req.body); return sendSuccess(res, {}, 'Updated.'); } catch (e) { return sendError(res, e.message, e.status||500); } };


exports.remove  = async (req, res) => { try { await contactService.remove(req.params.id); return sendSuccess(res, {}, 'Deleted.'); } catch (e) { return sendError(res, e.message, e.status||500); } };
