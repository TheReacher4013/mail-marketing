const router =  require('express').Router();
const { authenticate } =
require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const c = require('../controllers/auditController');

router.get('/', authenticate, authorize('super_admin', 'business_admin'),
c.getLogs);

module.exports = router;