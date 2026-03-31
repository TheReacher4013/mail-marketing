const analyticsService = require('../services/analyticsService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

exports.getOverview = async (req, res) => { try { return sendSuccess(res, await analyticsService.getOverview()); } 
catch (e) { return sendError(res, e.message, e.status || 500); } };

exports.getCampaignStats = async (req, res) => { try { return sendSuccess(res, await analyticsService.getCampaignStats(req.params.id)); } 
catch (e) { return sendError(res, e.message, e.status || 500); } };

exports.getCampaignChart = async (req, res) => { try { return sendSuccess(res, { chartData: await analyticsService.getCampaignChart() }); } 
catch (e) { return sendError(res, e.message, 500); } };

exports.getContactGrowth = async (req, res) => { try { return sendSuccess(res, { growth: await analyticsService.getContactGrowth() }); }
 catch (e) { return sendError(res, e.message, 500); } };

 
exports.getAuditLogs = async (req, res) => { try { return sendSuccess(res, { logs: await analyticsService.getAuditLogs() }); } catch (e) { return sendError(res, e.message, 500); } };
