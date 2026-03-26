const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");

const createUser = async (req, res) => {
    try {
        const { name, email, password, role_id } = req.body;

        const [exist] = await pool.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (exist.length > 0) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            `INSERT INTO users (name, email, password, role_id) 
       VALUES (?, ?, ?, ?)`,
            [name, email, hashedPassword, role_id]
        );

        res.json({ message: "User created successfully ✅" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating user" });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.query(`
      SELECT u.id, u.name, u.email, u.is_active, r.name AS role
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
    `);

        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching users" });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const [user] = await pool.query(
            `SELECT id, name, email, role_id, is_active 
       FROM users WHERE id = ?`,
            [id]
        );

        if (user.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching user" });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role_id, is_active } = req.body;

        await pool.query(
            `UPDATE users 
       SET name=?, email=?, role_id=?, is_active=? 
       WHERE id=?`,
            [name, email, role_id, is_active, id]
        );

        res.json({ message: "User updated successfully ✅" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating user" });
    }
};
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query("DELETE FROM users WHERE id = ?", [id]);

        res.json({ message: "User deleted successfully ✅" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error deleting user" });
    }
};
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;

        const [user] = await pool.query(
            "SELECT password FROM users WHERE id = ?",
            [userId]
        );

        const isMatch = await bcrypt.compare(oldPassword, user[0].password);

        if (!isMatch) {
            return res.status(400).json({ message: "Old password incorrect" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.query(
            "UPDATE users SET password=? WHERE id=?",
            [hashedPassword, userId]
        );

        res.json({ message: "Password updated successfully 🔐" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error changing password" });
    }
};

module.exports = { createUser,getAllUsers,getUserById,updateUser,deleteUser,changePassword,
};