const { pool } = require('../config/db');
const User = {
    findByEmail: (email) =>
        pool.query(`SELECT u.*,r.name AS role FROM users u JOIN roles r ON u.role_id=r.id WHERE u.email=?`, [email]),

    findById: (id) =>
        pool.query(`SELECT u.id,u.name,u.email,u.is_active,u.is_verified,r.name AS role,u.created_at
                FROM users u JOIN roles r ON u.role_id=r.id WHERE u.id=?`, [id]),

    create: (data) =>
        pool.query('INSERT INTO users (name,email,password,role_id,is_verified) VALUES (?,?,?,?,TRUE)',
            [data.name, data.email, data.password, data.role_id]),

    update: (id, data) =>
        pool.query('UPDATE users SET name=COALESCE(?,name),role_id=COALESCE(?,role_id),is_active=COALESCE(?,is_active) WHERE id=?',
            [data.name || null, data.role_id || null, data.is_active ?? null, id]),

    delete: (id) => pool.query('DELETE FROM users WHERE id=?', [id]),

    setResetToken: (email, token, expiry) =>
        pool.query('UPDATE users SET reset_token=?,reset_token_expires=? WHERE email=?', [token, expiry, email]),

    findByResetToken: (token) =>
        pool.query('SELECT id FROM users WHERE reset_token=? AND reset_token_expires>NOW()', [token]),

    updatePassword: (id, hashed) =>
        pool.query('UPDATE users SET password=?,reset_token=NULL,reset_token_expires=NULL WHERE id=?', [hashed, id]),
};

module.exports = User;
