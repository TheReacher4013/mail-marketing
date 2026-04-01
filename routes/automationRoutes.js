const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate }    = require('../middlewares/authenticate');
const { authorize }       = require('../middlewares/authorize');
const { validateRequest } = require('../middlewares/validateRequest');
const { auditLog }        = require('../middlewares/auditLogger');
const c = require('../controllers/automationController');

const ALL  = ['super_admin','business_admin','marketing_manager','viewer'];
const EDIT = ['super_admin','business_admin','marketing_manager'];
const ADM  = ['super_admin','business_admin'];

router.get('/',      authenticate, authorize(...ALL),  c.getAll);
router.get('/:id',   authenticate, authorize(...ALL),  c.getById);
router.post('/',     authenticate, authorize(...EDIT),
  [body('name').notEmpty(), body('trigger_event').notEmpty(), body('workflow_json').notEmpty()],
  validateRequest, auditLog('CREATE','automations'), c.create
);
router.put('/:id',   authenticate, authorize(...EDIT), auditLog('UPDATE','automations'), c.update);
router.delete('/:id',authenticate, authorize(...ADM),  auditLog('DELETE','automations'), c.remove);
router.post('/trigger', authenticate, authorize(...EDIT), c.trigger);

module.exports = router;
