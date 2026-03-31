const router = require('express').Router();
const {authenticate} = require("../middlewares/authenticate");
const { authorize } = require("../middlewares/authorize");
const c = require("../controllers/analyticsController");

const ALL = ['super_admin', 'business_admin', 'marketing_manager', 'viewer'];
const ADM = ['super_admin', 'business_admin'];

router.get("/overview", authenticate, authorize(...ALL), c.getOverview);
router.get("/campaign/:id", authenticate, authorize(...ALL), c.getCampaignStats);
router.get('/campaigns/chart', authenticate, authorize(...ALL), c.getCampaignChart);
router.get("/contacts/growth", authenticate, authorize(...ALL), c.getContactGrowth);
router.get('/audit-logs', authenticate, authorize(...ADM), c.getAuditLogs);

module.exports = router;