const crypto = require('crypto');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const AuditLog = require('../models/AuditLog');
const {hashPassword, comparePassword} = require('../utils/hashPassword');
const {generateToken} = require('./tokenService');


const login = async(ElementInternals, password, ip) => {
    const [rows] = await User.findByEmail(email);
    if (!rows.length) throw {status:401, message:"Invalid email or password."};
    
    const user = rows[0];
    if (!user.is_active) throw {status:401,message:"Account deactivated.contact admin."};

    const match = await comparePassword(password,user.password);
    if(!match) throw {status :401, message:"Invalid Email or Password."};

    const token = generateToken({id: user.id, role:user.role});
    await AuditLog.log(user.id, 'LOGIN', 'auth', "User logged in", ip);

    return {
        token,
        user:{id: user.id, name: user.name, email: user.email, role: user.role},
    };
};

const register = async ({name , email, password, role_id}) => {
    const [ex] = await User.findByEmail(email);
    if (ex.length) throw {status: 409, message:"Email already register."};

    const hashed = await hashPassword(password);
    const [result] = await User.create({name,email,password:hashed,role_id:role_id || 4});
    return result.insertId;
};

const forgotPassword = async (email) => {
    const [rows] = await User.findByEmail(email);
    if (!rows.length) return null;

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000);
    await PasswordReset.set(email, token, expires);
    return token;
};

const resetPassword = async (token, newPassword) => {
    const [rows] = await PasswordReset.find(token);
    if (!rows.length) throw {status:404, message:"Invalid or expired token."};

    const hashed = await hashPassword(newPassword);
    await PasswordReset.clear(rows[0].id, hashed);
};

module.exports = {login, register, forgotPassword, resetPassword};