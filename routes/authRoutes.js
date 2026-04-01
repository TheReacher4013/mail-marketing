const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate }   = require('../middlewares/authenticate');
const { validateRequest } = require('../middlewares/validateRequest');
const c = require('../controllers/authController');

router.post('/register',
  [body('name').notEmpty(), body('email').isEmail(), body('password').isLength({ min: 6 })],
  validateRequest, c.register
);
router.post('/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validateRequest, c.login
);
router.post('/forgot-password', c.forgotPassword);
router.post('/reset-password',  c.resetPassword);
router.get('/me',      authenticate, c.getMe);
router.post('/logout', authenticate, c.logout);

module.exports = router;
