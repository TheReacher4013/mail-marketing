const router = require('express').Router();
const { authenticate }  = require('../middlewares/authenticate');
const { authorize }     = require('../middlewares/authorize');
const { uploadCSV }     = require('../middlewares/uploadMiddleware');
const c = require('../controllers/uploadController');

const EDIT = ['super_admin','business_admin','marketing_manager'];

router.post('/csv', authenticate, authorize(...EDIT), uploadCSV.single('file'), c.uploadCSV);

module.exports = router;
