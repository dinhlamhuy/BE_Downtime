const express = require("express");
const authRouter = express.Router();

const authController = require("./auth.controller");

authRouter.post("/register",authController.register);
authRouter.post("/login",authController.login);
authRouter.post("/refresh",authController.refreshToken);



module.exports = authRouter;