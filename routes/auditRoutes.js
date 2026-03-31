const router =  require('express').Router();
const { authenticate } =
require('../middleware/authorize');
const { authorize } = require('../middleware/authorize');
const c = require('../controller/auditController');

router.get('/', authenticate, authorize('super_admin', 'business_admin'),
c.getLogs);

module.exports = router;