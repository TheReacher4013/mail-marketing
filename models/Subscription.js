const { pool } = require('../config/db');

const Subscription = {
    // All plans
    getPlans: () =>
        pool.query('SELECT * FROM subscription_plans WHERE is_active=TRUE ORDER BY price ASC'),

    getPlanById: (id) =>
        pool.query('SELECT * FROM subscription_plans WHERE id=?', [id]),

    createPlan: (data) =>
        pool.query(
            'INSERT INTO subscription_plans (name, price, duration, max_contacts, max_emails_per_month, features) VALUES (?,?,?,?,?,?)',
            [data.name, data.price, data.duration, data.max_contacts, data.max_emails_per_month, JSON.stringify(data.features || [])]
        ),

    updatePlan: (id, data) =>
        pool.query(
            'UPDATE subscription_plans SET name=COALESCE(?,name), price=COALESCE(?,price), duration=COALESCE(?,duration), max_contacts=COALESCE(?,max_contacts), max_emails_per_month=COALESCE(?,max_emails_per_month), is_active=COALESCE(?,is_active) WHERE id=?',
            [data.name || null, data.price || null, data.duration || null, data.max_contacts || null, data.max_emails_per_month || null, data.is_active ?? null, id]
        ),

    deletePlan: (id) =>
        pool.query('UPDATE subscription_plans SET is_active=FALSE WHERE id=?', [id]),

    // User subscriptions
    getAllSubscriptions: (limit, offset) =>
        pool.query(`
      SELECT s.*, u.name AS user_name, u.email AS user_email, p.name AS plan_name
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      JOIN subscription_plans p ON s.plan_id = p.id
      ORDER BY s.created_at DESC LIMIT ? OFFSET ?
    `, [limit, offset]),

    countSubscriptions: () =>
        pool.query('SELECT COUNT(*) AS total FROM subscriptions'),

    getUserSubscription: (userId) =>
        pool.query(`
      SELECT s.*, p.name AS plan_name, p.max_contacts, p.max_emails_per_month, p.features
      FROM subscriptions s
      JOIN subscription_plans p ON s.plan_id = p.id
      WHERE s.user_id=? AND s.status='active'
      ORDER BY s.created_at DESC LIMIT 1
    `, [userId]),

    createSubscription: (userId, planId, startDate, endDate, amountPaid) =>
        pool.query(
            'INSERT INTO subscriptions (user_id, plan_id, start_date, end_date, amount_paid) VALUES (?,?,?,?,?)',
            [userId, planId, startDate, endDate, amountPaid]
        ),

    cancelSubscription: (id) =>
        pool.query("UPDATE subscriptions SET status='cancelled' WHERE id=?", [id]),

    getStats: () =>
        pool.query(`
      SELECT
        (SELECT COUNT(*) FROM subscriptions WHERE status='active') AS active_count,
        (SELECT COALESCE(SUM(amount_paid),0) FROM subscriptions) AS total_revenue,
        (SELECT COUNT(*) FROM subscriptions WHERE MONTH(created_at)=MONTH(NOW())) AS this_month
    `),
};

module.exports = Subscription;
