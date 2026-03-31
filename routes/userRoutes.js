const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const { validateRequest } = require('../middlewares/validateRequest');
const { auditLog } = require('../middlewares/auditLogger');
const c = require('../controllers/userController');

const SA = 'super_admin';

router.get('/', authenticate, authorize(SA), c.getAll);
router.get('/roles', authenticate, authorize(SA, 'business_admin'), c.getRoles);
router.get('/:id', authenticate, authorize(SA), c.getById);
router.post('/', authenticate, authorize(SA),
    [body('name').notEmpty(), body('email').isEmail(), body('password').isLength({ min: 6 }), body('role_id').isInt()],
    validateRequest, auditLog('CREATE', 'users'), c.create
);
router.put('/:id', authenticate, authorize(SA), auditLog('UPDATE', 'users'), c.update);
router.delete('/:id', authenticate, authorize(SA), auditLog('DELETE', 'users'), c.remove);

module.exports = router;
