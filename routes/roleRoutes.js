const router = require('express').Router();
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const c = require('../controllers/roleController');

const SA = 'super_admin';

// GET /api/roles       — saare roles + user count
router.get('/', authenticate, authorize(SA), c.getAll);

// GET /api/roles/:id   — role ki detail + permissions
router.get('/:id', authenticate, authorize(SA), c.getById);

// PUT /api/roles/:id/permissions — permissions update karo
router.put('/:id/permissions', authenticate, authorize(SA), c.updatePermissions);

module.exports = router;
