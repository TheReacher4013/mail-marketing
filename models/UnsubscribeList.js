const { pool } = require('../config/db');

const UnsubscribeList = {
    add: (email) => pool.query('INSERT IGNORE INTO unsubscribe_list (email) VALUES (?)', [email]),
    check: (email) => pool.query('SELECT id FROM unsubscribe_list WHERE email=?', [email]),
    getAll: () => pool.query('SELECT * FROM unsubscribe_list ORDER BY unsubscribed_at DESC'),
};

module.exports = UnsubscribeList;
