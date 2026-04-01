const roleService = require("../services/roleService");
const {sendSuccess, sendError } = require("../utils/responseHelper");

exports.getAll = async(req, res) =>{
    try {
        const roles = await roleService.getAll();
        return sendSuccess(res, {roles});
    } catch (err) { return sendError(res, err.message, err.status || 500);      
    }
};

exports.getById = async (req, res)=>{
    try {
        const role = await roleService.getById(req.params.id);
        return sendSuccess(res, {role});
    } catch (err) { return sendError (res, err.message, err.status || 500);
    }
};

exports.updatePermissions = async(req, res) =>{
    try {
        await roleService.updatePermissions(req.params.id, req.body.permissions, req.user.id );
        return sendSuccess(res, {}, 'Permission updated successfully.');
    } catch (err) { return sendError(res, err.message, err.status || 500);
    }
};

