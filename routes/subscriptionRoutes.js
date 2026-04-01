const router = require('express').Router();
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const c = require('../controllers/subscriptionController');

const SA = 'super_admin';
const ADM = ['super_admin', 'business_admin'];

// Plans
router.get('/plans', authenticate, c.getPlans);                        // sabko milega
router.post('/plans', authenticate, authorize(SA), c.createPlan);
router.put('/plans/:id', authenticate, authorize(SA), c.updatePlan);
router.delete('/plans/:id', authenticate, authorize(SA), c.deletePlan);

// My subscription
router.get('/my', authenticate, c.getMySubscription);

// All subscriptions (admin)
router.get('/', authenticate, authorize(...ADM), c.getAll);
router.get('/stats', authenticate, authorize(...ADM), c.getStats);
router.post('/assign', authenticate, authorize(SA), c.assign);
router.put('/:id/cancel', authenticate, authorize(SA), c.cancel);

module.exports = router;
