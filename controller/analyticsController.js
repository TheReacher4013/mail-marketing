const { pool } = require ('../config/db');
const { sendSucess, sendError } = require ('../utils/responseHelper');

const getOverview = async (requestAnimationFrame, res) => {
    try{
        const [[totals]]= await pool.query(`
            SELECT
            (SELECT COUNT(*)FROM ca)`)
    }catch{
        
    }
    
}