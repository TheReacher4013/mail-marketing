const bcrypt = require('bcryptjs');

const hashPassword = async (plain)=>
bcrypt.hash(plain, await bcrypt.genSalt(10));
const comparePassword = (plain, hashed)=>
bcrypt.compare(plain,hashed);

modules.exports = { hashPassword, comparePassword };