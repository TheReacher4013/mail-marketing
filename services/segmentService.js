const ContactSegment = require('../models/ContactSegment');

const getAll = async () => {
    const [rows] = await ContactSegment.findAll();
    return rows;
};

const create = async (name, description, userId) => {
    if (!name) throw { status: 400, message: 'Segment name is required.' };
    const [r] = await ContactSegment.create(name, description, userId);
    return r.insertId;
};

const update = async (id, name, description) => {
    await ContactSegment.update(id, name, description);
};

const remove = async (id) => {
    await ContactSegment.delete(id);
};

module.exports = { getAll, create, update, remove };
