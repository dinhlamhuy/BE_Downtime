const express = require("express");
const damageRouter = express.Router("./damage_report.route");
const damageController = require("./damage_report.controller");
const { isAuth } = require("../auth/auth.middleware");
damageRouter.post("/callMechanic", isAuth, damageController.callMechanic);
damageRouter.post("/getTaskInfo", isAuth, damageController.getTaskInfo);
damageRouter.post(
  "/getHistoryTaskProduct",
  isAuth,
  damageController.getHistoryTaskProduct
);
damageRouter.post("/deleteTask", isAuth, damageController.deleteTask);
damageRouter.post("/getMachine", isAuth, damageController.getMachine);
damageRouter.post("/getAllMachine", isAuth, damageController.getallMachi);
damageRouter.post("/getInforReason", isAuth, damageController.getInforReason);


// damageRouter.post("/ownerAsignTask", isAuth, taskController.ownerAsignTask);
// damageRouter.post("/mechanicAccept", isAuth, taskController.mechanicAccept);
// damageRouter.post("/userCfmfinish", isAuth, taskController.userCfmfinish);
// damageRouter.post("/machineCfmfinish", isAuth, taskController.machineCfmfinish);

module.exports = damageRouter;
