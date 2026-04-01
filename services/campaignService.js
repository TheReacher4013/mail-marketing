const Campaign       = require('../models/Campaign');
const Template       = require('../models/Template');
const approvalService = require('./approvalService');
const { paginate, paginatedResponse } = require('../utils/responseHelper');

const getAll = async (query) => {
  const { page, limit, offset } = paginate(query);
  const search = query.search ? `%${query.search}%` : '%';
  let where = 'WHERE (c.name LIKE ? OR c.subject LIKE ?)';
  let params = [search, search];
  if (query.status) { where += ' AND c.status=?'; params.push(query.status); }

  const [[{ total }]] = await Campaign.count(where, params);
  const [rows]        = await Campaign.findAll(where, params, limit, offset);
  return paginatedResponse(rows, total, page, limit);
};

const getById = async (id) => {
  const [rows] = await Campaign.findById(id);
  if (!rows.length) throw { status: 404, message: 'Campaign not found.' };
  return rows[0];
};

const create = async (data, userId) => {
  const [tmpl] = await Template.findById(data.template_id);
  if (!tmpl.length) throw { status: 404, message: 'Template not found.' };
  const [r] = await Campaign.create(data, userId);
  return r.insertId;
};

const update = async (id, data) => {
  const [rows] = await Campaign.findById(id);
  if (!rows.length) throw { status: 404, message: 'Campaign not found.' };
  if (['sending', 'sent'].includes(rows[0].status))
    throw { status: 400, message: 'Cannot edit a sent/sending campaign.' };
  await Campaign.update(id, data);
};

const remove = async (id) => {
  const [rows] = await Campaign.findById(id);
  if (!rows.length) throw { status: 404, message: 'Campaign not found.' };
  if (['sending', 'sent'].includes(rows[0].status))
    throw { status: 400, message: 'Cannot delete a sent campaign.' };
  await Campaign.delete(id);
};

const sendNow = async (id) => {
  const [rows] = await Campaign.findById(id);
  if (!rows.length) throw { status: 404, message: 'Campaign not found.' };
  await Campaign.updateStatus(id, 'sending');
  await approvalService.dispatchCampaign(rows[0]);
};

module.exports = { getAll, getById, create, update, remove, sendNow };
