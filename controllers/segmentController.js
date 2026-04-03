const segmentService = require('../services/segmentService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

exports.getAll = async (req, res) => { try { return sendSuccess(res, 
    { segments: await segmentService.getAll() }); } 
    catch (e) { return sendError(res, e.message, 500); } };
    
exports.create = async (req, res) => { try 
    { const id = await segmentService.create(req.body.name, req.body.description, req.user.id); return sendSuccess(res, { segmentId: id }, 'Segment created.', 201); }
     catch (e) { return sendError(res, e.message, e.status || 500); } };

exports.update = async (req, res) => { try 
    { await segmentService.update(req.params.id, req.body.name, req.body.description); return sendSuccess(res, {}, 'Updated.'); } 
    catch (e) { return sendError(res, e.message, 500); } };

exports.remove = async (req, res) => { try 
    { await segmentService.remove(req.params.id); return sendSuccess(res, {}, 'Deleted.'); } catch (e) { return sendError(res, e.message, 500); } };
