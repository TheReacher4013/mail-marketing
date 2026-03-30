const Template = require("../models/Template");

const { paginate, paginatedResponse } = require("../utils/responseHelper");

const getAll = async (query) => {
    const { page, limit, offset } = paginate(query);
    const search = query.search ? `%${query.search}%` : '%';
    const [[{total}]] = await Template.count(search);
    const [rows] = await Template.findAll(search, limit, offset);
    return paginatedResponse(rows, total, page, limit);
};

const getById = async (id) => {
    const [rows] = await Template.findById(id);
    if (!rows.length) throw { status: 404, message: 'Template not found.' };
    return rows[0];
};

const create = async (data, userId) => {
    const [r] = await Template.create(data, userId);
    return r.insertId;
};

const update = async (id, data) => {
    const [rows] = await Template.findById(id);
    if (!rows.length) throw { status: 404, message: 'Template not found.' };
    await Template.update(id, data);
};

const remove = async (id) => {
    const [used] = await Template.isUsedInCampaign(id);
    if (used.length) throw { status: 400, message: 'Template is used in a campaign. Cannot delete.' };
    await Template.delete(id);
};

module.exports = { getAll, getById, create, update, remove };
