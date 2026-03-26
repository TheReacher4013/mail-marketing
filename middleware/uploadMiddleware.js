const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// Upload folder create karo agar exist nahi karta
const uploadDir = process.env.UPLOAD_PATH || 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// File kahan save ho aur kya naam mile
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

// Sirf CSV allow karo
const csvFilter = (req, file, cb) => {
  const isCsv =
    file.mimetype === 'text/csv' ||
    path.extname(file.originalname).toLowerCase() === '.csv';

  if (isCsv) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed.'), false);
  }
};

// 5MB max size
const uploadCSV = multer({
  storage,
  fileFilter: csvFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = { uploadCSV };