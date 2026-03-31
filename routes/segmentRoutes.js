const router = require('express').Router();
const { authenticate } = require('../middlewares/authenticate');
const { authorize }    = require('../middlewares/authorize');
const c = require('../controllers/segmentController');

const ALL  = ['super_admin','business_admin','marketing_manager','viewer'];
const EDIT = ['super_admin','business_admin','marketing_manager'];
const ADM  = ['super_admin','business_admin'];

router.get('/',      authenticate, authorize(...ALL),  c.getAll);
router.post('/',     authenticate, authorize(...EDIT), c.create);
router.put('/:id',   authenticate, authorize(...EDIT), c.update);
router.delete('/:id',authenticate, authorize(...ADM),  c.remove);

module.exports = router;
