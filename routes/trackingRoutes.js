const router = require ('express').Router();
const {authenticate} = require('../middlewares/authenticate');
const {authorize} = require('../middlewares/authorize');
const c = require("../controllers/trackingController");

//public by email clients (no auth provide kela ahe )
router.get('/open/:campaignId/:contactId', c.trackOpen);
router.get('/click/:campaignId/:contactId', c.trackClick);
router.get('/unsubscribe/:campaignId/:contactId', c.unsubscribe);

//Authenticate 
router.get('/events/:campaignId', authenticate, authorize('super_admin', 'business_admin', 'marketing_manager', 'viewer'),
c.getCampaignEvents
);
module.exports = router;

