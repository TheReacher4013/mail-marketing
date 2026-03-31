const router = require('express').Router();
const {body} = require('express-validator');
const { authenticate } = require('../middlewares/authenticate');
const {authorize} = require("../middlewares/authorize");
const { validateRequest } = require("../middlewares/validateRequest");
const {auditLog} = require("../middlewares/auditLogger");

const c =require("../controllers/contactController");

const ALL = ['super_admin', 'business_admin', 'marketing_manager', 'viewer'];

const EDIT = ['super_admin', 'business_admin', 'marketing_manager'];

const ADM = ['super_admin', 'business_admin'];

router.get('/', authenticate, authorize(...ALL), c.getAll);
router.get('/:id', authenticate, authorize(...ALL), c.getById);
router.post('/', authenticate, authorize(...EDIT),
    [body('email').isEmail()], validateRequest,
    auditLog('CREATE', 'contacts'), c.create
);

router.put('/:id', authenticate, authorize(...EDIT),
auditLog('UPDATE', 'contacts'), c.update);
router.delete('/:id', authenticate, authorize(...ADM), auditLog('DELETE', 'contacts'), c.remove);

module.exports = router;