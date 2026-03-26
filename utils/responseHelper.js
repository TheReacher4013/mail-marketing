const sendSuccess = (res, data = {}, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

const sendError = (res, message = 'Error', statusCode = 500, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

const paginate = (q) => {
  const page   = Math.max(1, parseInt(q.page)  || 1);
  const limit  = Math.min(100, parseInt(q.limit) || 20);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const paginatedResponse = (data, total, page, limit) => ({
  data,
  pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
});

module.exports = { sendSuccess, sendError, paginate, paginatedResponse };