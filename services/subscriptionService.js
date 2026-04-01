const Subscription = require('../models/Subscription');
const { paginate, paginatedResponse } = require('../utils/responseHelper');

const getPlans = async () => {
    const [rows] = await Subscription.getPlans();
    return rows;
};

const createPlan = async (data) => {
    const [r] = await Subscription.createPlan(data);
    return r.insertId;
};

const updatePlan = async (id, data) => {
    await Subscription.updatePlan(id, data);
};

const deletePlan = async (id) => {
    await Subscription.deletePlan(id);
};

const getAllSubscriptions = async (query) => {
    const { page, limit, offset } = paginate(query);
    const [[{ total }]] = await Subscription.countSubscriptions();
    const [rows] = await Subscription.getAllSubscriptions(limit, offset);
    return paginatedResponse(rows, total, page, limit);
};

const getUserSubscription = async (userId) => {
    const [rows] = await Subscription.getUserSubscription(userId);
    return rows[0] || null;
};

const assignSubscription = async (userId, planId, amountPaid) => {
    const [plan] = await Subscription.getPlanById(planId);
    if (!plan.length) throw { status: 404, message: 'Plan not found.' };

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan[0].duration);

    const [r] = await Subscription.createSubscription(
        userId, planId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        amountPaid || plan[0].price
    );

    return r.insertId;
};

const cancelSubscription = async (id) => {
    await Subscription.cancelSubscription(id);
};

const getStats = async () => {
    const [[stats]] = await Subscription.getStats();
    return stats;
};

module.exports = {
    getPlans, createPlan, updatePlan, deletePlan,
    getAllSubscriptions, getUserSubscription, assignSubscription, cancelSubscription, getStats,
};
