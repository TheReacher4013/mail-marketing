const router = require('express').Router();
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const c = require('../controllers/whatsappController');

const ALL = ['super_admin', 'business_admin', 'marketing_manager', 'viewer'];
const EDIT = ['super_admin', 'business_admin', 'marketing_manager'];
const ADM = ['super_admin', 'business_admin'];
const SA = 'super_admin';

// Green API Config
router.get('/config', authenticate, authorize(...ADM), c.getConfig);
router.post('/config', authenticate, authorize(SA), c.saveConfig);
router.get('/config/status', authenticate, authorize(...ADM), c.checkStatus);

// WhatsApp Campaigns
router.get('/', authenticate, authorize(...ALL), c.getAll);
router.get('/:id', authenticate, authorize(...ALL), c.getById);
router.post('/', authenticate, authorize(...EDIT), c.create);
router.put('/:id', authenticate, authorize(...EDIT), c.update);
router.delete('/:id', authenticate, authorize(...ADM), c.remove);
router.post('/:id/send', authenticate, authorize(...ADM), c.send);
router.get('/:id/logs', authenticate, authorize(...ALL), c.getLogs);

module.exports = router;
