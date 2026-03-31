const router = require('express').Router();

const c = require("../controllers/webhookController");

router.post("/sendgrid", c.sendgrid);

module.exports = router;