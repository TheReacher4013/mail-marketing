const csvImportService = require('../services/csvImportService');

const { sendSuccess, sendError } = require('../utils/responseHelper');

exports.uploadCSV = async (req, res) => {
  if (!req.file) return sendError(res, 'CSV file is required.', 400);
  try {
    const result = await csvImportService.importCSV(req.file.path, req.user.id);
    return sendSuccess(res, result, `${result.inserted} contacts imported, ${result.skipped} skipped.`);
  } catch (err) {
    return sendError(res, 'CSV processing failed.', 500);
  }
};
