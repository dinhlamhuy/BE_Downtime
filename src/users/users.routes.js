const express = require("express");
const userRouter = express.Router();
const userController = require("./users.controller");
const { isAuth } = require("../auth/auth.middleware");
userRouter.get("/profile", isAuth, userController.profile);
userRouter.get("/getFac", isAuth, userController.getFac);
userRouter.post("/getAllLean", isAuth, userController.getAllLean);
userRouter.post("/getAllFloor", isAuth, userController.getAllFloor);
userRouter.post("/updateUser", isAuth, userController.updateUser);

// userRouter.get("/tts",  userController.sendNofity);


module.exports = userRouter;
 