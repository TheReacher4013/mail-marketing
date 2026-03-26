const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const checkPermission = require("../middlewares/checkPermission");

router.post(
    "/",
    checkPermission("users", "create"),
    userController.createUser
);
router.get(
    "/",
    checkPermission("users", "view"),
    userController.getAllUsers
);
router.get(
    "/:id",
    checkPermission("users", "view"),
    userController.getUserById
);
router.put(
    "/:id",
    checkPermission("users", "edit"),
    userController.updateUser
);
router.delete(
    "/:id",
    checkPermission("users", "delete"),
    userController.deleteUser
);
router.put("/change-password", userController.changePassword);

module.exports = router;