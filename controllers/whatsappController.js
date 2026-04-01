const whatsappService = require("../services/whatsappCampaignService");
const greenApi = require('../services/greenApiService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

exports.getAll = async (req, res) => {
    try { return sendSuccess(res, await
        whatsappService.getAll(req.query)
    );      
    } catch (err) { return sendError(res, err.message, err.status || 500);
    }
};

exports.getById = async (req,res) => {
    try {
        return sendSuccess(res,{
            campaign: await whatsappService.getById(req.params.id)
        });
    } catch (err) { 
        return sendError(res, err.message, err.status || 500);
        
    }
};

exports.create = async(req, res) =>{
    try {
        const id = await whatsappService.create(req.body, req.user.id);
        return sendSuccess(res, {campaignId: id},
            'WhatsApp campaign created.', 201
        );
    } catch (err) {
        return sendError(res, err.message, err.status || 500);
    }
};

exports.update = async (req, res) => {
    try {
        await whatsappService.update(req.params.id, req.body);
        return sendSuccess(res, {}, 'updated.');
    } catch (err) {
        return sendError(res, err.message, err.status || 500);
    }
};

exports.remove = async (req, res) => {
    try {
        await whatsappService.remove(req.params.id);
        return sendSuccess(res, {}, 'Deleted.');
    } catch (err) {
        return sendError (res, err.message, err.status || 500);
    }
};

exports.send = async (req, res) => {
    try {
        const result = await whatsappService.sendCampaign(req.params.id);
        return sendSuccess(res, result, `Campaign sent: ${result.sent} delivered, ${result.failed} failed.`);
    } catch (err) {
        return sendError (res, err.message, err.status || 500);
    }
};

exports.getLogs = async (req, res) => {
    try {
        const logs = await whatsappService.getLogs
        (req.params.id);
        return sendSuccess(res, {logs});
    } catch (err) {return sendError (res, err.message, 500);
    }
};

exports.getConfig = async (req, res) => {
    try {
        const config = await greenApi.getConfig();
        return sendSuccess(res, {
            config:{
                instance_id: config.instance_id,
                phone_number: config.phone_number,
                is_active : config.is_active,
                api_token : '****' + config.api_token.slice(-4),
            }
        });
    } catch (err) {
        return sendSuccess(res,{
            config : null
        });
    }
};

exports.saveConfig = async (req, res) => {
    try {
        const {instance_id, api_token, phone_number} = req.body;
        if (!instance_id || !api_token) return sendError(res, 'instance_id and api_token required.', 400);
        await greenApi.saveConfig(instance_id, api_token, phone_number, req.user.id);
        return sendSuccess(res, {}, 'Whatsapp config saved.');
    } catch (err) {
        return sendError(res, err.message, 500);
    }
};

exports.checkStatus = async (req, res) => {
    try {
        const status = await greenApi.checkInstanceStatus();
        return sendSuccess(res, {status});
    } catch (err) {
        return sendError (res, err.message, err.status || 500);
    }
};