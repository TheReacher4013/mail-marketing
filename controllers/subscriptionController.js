const subscriptionService = require('../services/subscriptionService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

//plan sathi 
exports.getPlans = async (req, res) => {
    try { return sendSuccess(res, { plans: await subscriptionService.getPlans() }); }
    catch (err) { return sendError(res, err.message, 500); }
};

exports.createPlan = async (req, res) => {
    try {
        const id = await subscriptionService.createPlan(req.body);
        return sendSuccess(res, { planId: id }, 'Plan created.', 201);
    } catch (err) { return sendError(res, err.message, 500); }
};

exports.updatePlan = async (req, res) => {
    try {
        await subscriptionService.updatePlan(req.params.id, req.body);
        return sendSuccess(res, {}, 'Plan updated.');
    } catch (err) { return sendError(res, err.message, 500); }
};

exports.deletePlan = async (req, res) => {
    try {
        await subscriptionService.deletePlan(req.params.id);
        return sendSuccess(res, {}, 'Plan deactivated.');
    } catch (err) { return sendError(res, err.message, 500); }
};

// Subscriptions
exports.getAll = async (req, res) => {
    try { return sendSuccess(res, await subscriptionService.getAllSubscriptions(req.query)); }
    catch (err) { return sendError(res, err.message, 500); }
};

exports.getMySubscription = async (req, res) => {
    try {
        const sub = await subscriptionService.getUserSubscription(req.user.id);
        return sendSuccess(res, { subscription: sub });
    } catch (err) { return sendError(res, err.message, 500); }
};

exports.assign = async (req, res) => {
    try {
        const { user_id, plan_id, amount_paid } = req.body;
        const id = await subscriptionService.assignSubscription(user_id, plan_id, amount_paid);
        return sendSuccess(res, { subscriptionId: id }, 'Subscription assigned.', 201);
    } catch (err) { return sendError(res, err.message, err.status || 500); }
};

exports.cancel = async (req, res) => {
    try {
        await subscriptionService.cancelSubscription(req.params.id);
        return sendSuccess(res, {}, 'Subscription cancelled.');
    } catch (err) { return sendError(res, err.message, 500); }
};

exports.getStats = async (req, res) => {
    try { return sendSuccess(res, await subscriptionService.getStats()); }
    catch (err) { return sendError(res, err.message, 500); }
};
