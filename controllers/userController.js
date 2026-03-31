const userService = require('../services/userService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

exports.getAll = async (req, res) => { try { return sendSuccess(res, await userService.getAll(req.query)); } catch (e) { return sendError(res, e.message, e.status || 500); } };
exports.getById = async (req, res) => { try { return sendSuccess(res, { user: await userService.getById(req.params.id) }); } catch (e) { return sendError(res, e.message, e.status || 500); } };
exports.create = async (req, res) => { try { const id = await userService.create(req.body); return sendSuccess(res, { userId: id }, 'User created.', 201); } catch (e) { return sendError(res, e.message, e.status || 500); } };
exports.update = async (req, res) => { try { await userService.update(req.params.id, req.body); return sendSuccess(res, {}, 'Updated.'); } catch (e) { return sendError(res, e.message, e.status || 500); } };
exports.remove = async (req, res) => { try { await userService.remove(req.params.id, req.user.id); return sendSuccess(res, {}, 'Deleted.'); } catch (e) { return sendError(res, e.message, e.status || 500); } };
exports.getRoles = async (req, res) => { try { return sendSuccess(res, { roles: await userService.getRoles() }); } catch (e) { return sendError(res, e.message, 500); } };
