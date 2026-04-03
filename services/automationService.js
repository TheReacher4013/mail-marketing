const Automation = require('../models/Automation');
const { paginate, paginatedResponse } =
require('../utils/responseHelper');

const getAll = async (query) => {
    const { page, limit, offset } = paginate(query);
    const [[{ total }]] = await Automation.count();
    const [rows] = await Automation.findAll(limit, offset);
    return paginatedResponse(rows, total, page, limit);
};

const getById = async (id) => {
    const [rows]= await Automation.findById(id);
    if (!rows.length) throw { status: 404, message: 'Automation not Found.'};
    return rows[0];

};

const create = async (Data, userId) =>{
    const[r]= await Automation.create(data, userId);
    return r.insertId;
};

const update = async (id, data) => {
    const [rows] = await Automation.findById(id);
    if (!rows.length) throw { status: 404, message: 'automation is not found.'};
    await Automation.update(id, data);

};

const remove = async (id) => {
    await Automation.delete(id);
};

module.exports = { getAll, getById, create, update, remove };