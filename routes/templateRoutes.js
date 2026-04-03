const router = require('express').Router();
const { authenticate }    = require('../middlewares/authenticate');
const { authorize }       = require('../middlewares/authorize');
const { auditLog }        = require('../middlewares/auditLogger');
const { body }            = require('express-validator');
const { validateRequest } = require('../middlewares/validateRequest');
const c = require('../controllers/templateController');

const ALL  = ['super_admin','business_admin','marketing_manager','viewer'];
const EDIT = ['super_admin','business_admin','marketing_manager'];
const ADM  = ['super_admin','business_admin'];

router.get('/',      authenticate, authorize(...ALL),  c.getAll);
router.get('/:id',   authenticate, authorize(...ALL),  c.getById);
router.post('/',     authenticate, authorize(...EDIT),
  [body('name').notEmpty(), body('html_content').notEmpty()],
  validateRequest, auditLog('CREATE','templates'), c.create
);
router.put('/:id',   authenticate, authorize(...EDIT), auditLog('UPDATE','templates'), c.update);
router.delete('/:id',authenticate, authorize(...ADM),  auditLog('DELETE','templates'), c.remove);

module.exports = router;
