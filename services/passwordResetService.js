const crypto = require('crypto');
const PasswordReset = require("../models/PasswordReset");

const { hashedPassword } = require("../utils/hashPassword");

const sendReset = async (email) => {
    const token = crypto.randomBytes(32).toString('hex');

    const expires = new Date(Date.now() + 3600000);
    await PasswordReset.set (email, token , expires);
    return token;
};

const reset = async (token, newPassword) => {
    const [rows] = await PasswordReset.find(token);
    if (!rows.length) throw {status:400, message: "Invalid or expired for password please reset token."};
    const hashed = await hashedPassword(newPassword);
    await PasswordReset.clear(rows[0].id, hashed);
};

module.exports = {sendReset, reset};