const Contact  = require('../models/Contact');
const { paginate, paginatedResponse } = require('../utils/responseHelper');

const getAll = async (query) => {
  const { page, limit, offset } = paginate(query);
  const search = query.search ? `%${query.search}%` : '%';
  let where = 'WHERE (c.email LIKE ? OR c.name LIKE ?)';
  let params = [search, search];
  if (query.status)     { where += ' AND c.status=?';     params.push(query.status); }
  if (query.segment_id) { where += ' AND c.segment_id=?'; params.push(query.segment_id); }

  const [[{ total }]] = await Contact.count(where, params);
  const [rows]        = await Contact.findAll(where, params, limit, offset);
  return paginatedResponse(rows, total, page, limit);
};

const getById = async (id) => {
  const [rows] = await Contact.findById(id);
  if (!rows.length) throw { status: 404, message: 'Contact not found.' };
  return rows[0];
};

const create = async (data, userId) => {
  const [ex] = await Contact.findByEmail(data.email);
  if (ex.length) throw { status: 409, message: 'Email already exists.' };
  const [r] = await Contact.create(data, userId);
  return r.insertId;
};

const update = async (id, data) => { await Contact.update(id, data); };
const remove = async (id)       => { await Contact.delete(id); };

module.exports = { getAll, getById, create, update, remove };
