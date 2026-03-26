const {validationResult} = require('express-validator');

const {pool} = require('../config/db');
const {paginate, paginationResponse} = require('../utils/helper');
const {sendSuccess, SendError} = require("../utils/responseHelper");


const getAutomations = async (req, res) =>{
    try {
        const {page, limit, offset} = paginate(req.query);
        const [[{total}]] = await pool.query('SELECT COUNT(*) AS total FROM automations');
        const [rows] = await pool.query(
            `SELECT a.id,a.name,a.trigger_event,a.is_active,a.created_at,u.name AS created_by_name
            FROM automation a JOIN users ON a.created_by=u.id
            ORDER BY a.created_at DESC LIMIT ? OFFSET ?`,
            [limit, offset]
        );
        return sendSuccess(res, paginationResponse(rows, total, page, limit));
    } catch (err) {
        return SendError(res, 'Failed.', 500);
    }
};

const getAutomationById = async (req,res) => {
    const [rows] = await pool.query(
        `SELECT a.*, u.name AS created_by_name FROM automations a JOIN users u ON a.created_by=u.id WHERE a.id=?`,
        [req.params.id]
    );
    if (!rows.length) return SendError(res, 'Not found.', 404);
    return sendSuccess(res,{automation: rows[0]});
};

const updateAutomation = async (req, res) => {
    const { name, trigger_event, workflow_json, is_active } = req.body;
    await pool.query(
        'UPDATE automations SET name=COALESCE(?,name),trigger_event=COALESCE(?,trigger_event),workflow_json=COALESCE(?,workflow_json),is_active=COALESCE(?,is_active) WHERE id=?',
        [name || null, trigger_event || null, workflow_json ? JSON.stringify(workflow_json) : null, is_active ?? null, req.params.id]
    );
    return sendSuccess(res, {}, 'Updated.');
};

const deleteAutomation = async (req, res) =>{
    await pool.query("DELETE FROM automations WHERE id=?",[req.params.id]);
    return sendSuccess(res, {}, 'Deleted.');
};

const triggerAutomation = async (req, res ) => {
    const {trigger_event, contact_id} = req.body;
    if (!trigger_event || !contact_id) return SendError(res, 'trigger_event and contact_id required.', 400);
    try{
        const [automations] = await pool.query(
            "SELECT * FROM automations WHERE trigger_event=? AND is_active=TRUE", [trigger_event]
        );
        if (!automations.length) return sendSuccess(res, {}, "No active automations.");
        const [contact] = await pool.query('SELECT id , email, name FROM contacts WHERE id=?',[contact_id]);
        if (!contact.length) return SendError(res, 'Contact not found..', 404);
        const emailQueue = require('../services/queueService');
        for (const auto of automations){
            const steps = auto.workflow_json?.steps || [];
            let delaysMs = 0;
            for (const step of steps){
                delaysMs += (steps.delay_days || 0)* 86400000;
                if (step.type === 'send_email' && step.template_id){
                    const [tmpl] = await pool.query('SELECT html_content,subject FROM templates WHERE id=?', [step.template_id]);
                    if (!tmpl.length) continue;
                    await emailQueue.add('automation-email', {
                        contactId: contact[0].id, toEmail: contact[0].email, toName: contact[0].name,
                        subject: tmpl[0].subject || 'Email', htmlContent: tmpl[0].html_content,
                    }, { delay: delayMs, attempts: 3 });
                }
            }
        }
        return sendSuccess(res, {}, 'Automation triggered.');
    } catch (err) { return sendError(res, 'Failed.', 500); }
};

module.exports = { getAutomations, getAutomationById, createAutomation, updateAutomation, deleteAutomation, triggerAutomation };