require('dotenv').config();

module.exports ={
    redis:{
        host: process.env.REDIS_HOST  || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6397,
        password : process.env.REDIS_PASSWORD || undefined,
    },
};