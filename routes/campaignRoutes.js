const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate }    = require('../middlewares/authenticate');
const { authorize }       = require('../middlewares/authorize');
const { validateRequest } = require('../middlewares/validateRequest');
const { auditLog }        = require('../middlewares/auditLogger');
const c = require('../controllers/campaignController');

const ALL  = ['super_admin','business_admin','marketing_manager','viewer'];
const EDIT = ['super_admin','business_admin','marketing_manager'];
const ADM  = ['super_admin','business_admin'];

router.get('/',       authenticate, authorize(...ALL),  c.getAll);
router.get('/:id',    authenticate, authorize(...ALL),  c.getById);
router.post('/',      authenticate, authorize(...EDIT),
  [body('name').notEmpty(), body('subject').notEmpty(), body('template_id').isInt()],
  validateRequest, auditLog('CREATE','campaigns'), c.create
);
router.put('/:id',    authenticate, authorize(...EDIT), auditLog('UPDATE','campaigns'), c.update);
router.delete('/:id', authenticate, authorize(...ADM),  auditLog('DELETE','campaigns'), c.remove);

router.post('/:id/submit',  authenticate, authorize(...EDIT), c.submit);
router.post('/:id/approve', authenticate, authorize(...ADM),  auditLog('UPDATE','campaigns'), c.approve);
router.post('/:id/reject',  authenticate, authorize(...ADM),  c.reject);
router.post('/:id/send',    authenticate, authorize(...ADM),  c.sendNow);

module.exports = router;
