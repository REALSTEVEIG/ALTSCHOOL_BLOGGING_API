const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const userValidation = require('../utils/userValidation');

router.route("/signup").post(authController.signup);
router.route("/login").post(userValidation, authController.login);

router.route("/").get(userController.getAllUsers);
router.route("/:id").get(userController.getUser);
module.exports = router;
