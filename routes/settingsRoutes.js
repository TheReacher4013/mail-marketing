const router = require('express').Router();
const { authenticate } = require('../middlewares/authenticate');
const { authorize }    = require('../middlewares/authorize');
const c = require('../controllers/settingsController');

const SA = 'super_admin';

router.get('/',                 authenticate, authorize(SA), c.getAll);
router.put('/',                 authenticate, authorize(SA), c.update);
router.get('/permissions',      authenticate, authorize(SA), c.getPermissions);
router.put('/permissions',      authenticate, authorize(SA), c.updatePermissions);

module.exports = router;
