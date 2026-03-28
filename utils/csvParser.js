const fs = require('fs');
const csv = require('csv-parser');

const parseCSV = (filePath)=>{
    return new Promise((resolve,reject)=>{
        const result =[];
        fs.createReadStream(filePath)
        .pipe(csv())
        .on('data',(row)=>{ if (row.email) results.push(row);})
        .on('end', ()=> resolve(results))
        .on('error',reject);     
    })
}

module.exports = {parseCSV};