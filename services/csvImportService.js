const fs = require('fs');
const Contact = require("../models/Contact");
const {parseCSV} = require("../utils/csvParser");

const importCSV = async(fileURLToPath, userId) =>{
    let inserted = 0, skipped = 0, errors = [];
    try{
        const rows = await parseCSV(filePath);

        for (const row of rows){
            try{
                const email = row.email?.trim();
                if (!email) { skipped++; continue;}

                const [ex] = await Contact.findByEmail(email);
                if (ex.length) {skipped++; continue;}

                await Contact.create({
                    name: row.name || null,
                    email,
                    phone: row.phone || null,
                    tags: [],
                }, userId);
                inserted++;
            }catch (e){
                errors.push({email: row.email, error: e.message });
            }
        }
    }finally {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    return {inserted, skipped, errors};
};
module.exports = {importCSV};