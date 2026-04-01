const Role = require('../models/Role');

const getAll = async () => {
    const [roles] = await Role.findAll();
    const [counts] = await Role.getUserCount();

    // User count merge karo
    const countMap = {};
    counts.forEach(c => countMap[c.id] = c.user_count);

    return roles.map(r => ({ ...r, user_count: countMap[r.id] || 0 }));
};

const getById = async (id) => {
    const [rows] = await Role.findById(id);
    if (!rows.length) throw { status: 404, message: 'Role not found.' };

    const [perms] = await Role.getPermissions(id);
    return { ...rows[0], permissions: perms };
};

const updatePermissions = async (roleId, permissions, updatedBy) => {
    const [rows] = await Role.findById(roleId);
    if (!rows.length) throw { status: 404, message: 'Role not found.' };

    // Super admin ki permissions nahi badle
    if (rows[0].name === 'super_admin')
        throw { status: 400, message: 'Super Admin permissions cannot be changed.' };

    await Role.updatePermissions(roleId, permissions, updatedBy);
};

module.exports = { getAll, getById, updatePermissions };
