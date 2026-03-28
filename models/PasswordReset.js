const {pool} = require("../config/db");

const PasswordReset = {
    set: (email, token, expires)=>
        pool.query('UPDATE users SET reset_token=?,reset_token_expires=? WHERE email=?', [token, expires, email]),
    

    find: (token) =>
        pool.query('SELECT id FROM users WHERE reset_token=? AND reset_token_expires>NOW()', [token]),

    clear: (userId, hashedPassword) =>
        pool.query('UPDATE users SET password=?,reset_token=NULL,reset_token_expires=NULL WHERE id=?', [hashedPassword, userId]),
};

module.exports = PasswordReset;