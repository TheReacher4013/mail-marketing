const { query } = require("express-validator");
const User = require("../models/User");
const { hashedPassword } = require("../utils/hashPassword");
const {paginate, paginatedResponse } = require("../utils/responseHelper");

const getAll = async(query) =>{
    const {page, limit, offset} = paginate(query);
    const search = query.search ? `%${query.search}%`: '%';

    const [[{total}]] = await require("../config/db").pool.query(
        `SELECT COUNT (*) AS total FROM users u JOIN roles r ON u.role_id=r.id
        WHERE u.name LIKE ? OR u.email LIKE ?`,
        [search, search]
    );

    const [rows] = await require("../config/db").pool.query(
        `SELECT u.id, u.name, u.email, u.is_active, u.is_verified, r.name AS role, u.created_at FROM users u JOIN roles r ON u.role_id=r.id
        WHERE u.name LIKE ? OR u.email LIKE ?
        ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
        [search, search , limit, offset]
    );
    return paginatedResponse(rows, total, page, limit);
};


const getById = async (id) => {
    const [rows] = await User.findById(id);
    if (!rows.length) throw { status: 404, message: 'User not found.' };
    return rows[0];
};

const create = async (data) => {
    const [ex] = await User.findByEmail(data.email);
    if (ex.length) throw { status: 409, message: 'Email already exists.' };
    const hashed = await hashPassword(data.password);
    const [r] = await User.create({ ...data, password: hashed });
    return r.insertId;
};

const update = async (id, data) =>{
    await User.update(id, data);
};

const remove = async (id, requesterId) =>{
    if (id == requesterId) throw {status:400, message:"Cannot delete yourself."};
    await User.delete(id);
};

const getRoles = async () =>{
    const [rows] = await require("../config/db").pool.query('SELECT * FROM roles');
    return rows;
};

module.exports = {getAll, getById, create, update, remove, getRoles}