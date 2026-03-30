const {pool} = require("../config/db");
const { get } = require("../routes/userRoutes");

const SystemSettings = {
    getAll: () => pool.query('SELECT * FROM system_settings'),
    get: (key) => pool.query('SELECT setting_val FROM system_settings WHERE setting_key=?',[key]),
    set : (key, val, userId) => 
        pool.query(
            'INSERT INTO system_settings (setting_key, setting_val, updated_by) VALUES (?,?,?) ON DUPLICATE KEY UPDATE setting_val=?,updated_by=?',
            [key, val, userId, val, userId] 
        ),
};

module.exports = SystemSettings;