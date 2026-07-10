const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const {
    registerValidator,
    loginValidator
} = require("../validators/authValidator");

router.post(
    "/register",
    registerValidator,
    authController.register
);

router.post(
    "/login",
    loginValidator,
    authController.login
);

router.post(
    "/logout",
    authMiddleware,
    authController.logout
);

module.exports = router;