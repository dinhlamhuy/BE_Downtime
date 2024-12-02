const express = require("express");
const taskRouter = express.Router("./task.route");
const taskController = require("./task.controller");
const { isAuth } = require("../auth/auth.middleware");
// taskRouter.post("/callMechanic", isAuth, taskController.callMechanic);
taskRouter.post("/ownerAsignTask", isAuth, taskController.ownerAsignTask);
taskRouter.post("/mechanicAccept", isAuth, taskController.mechanicAccept);
taskRouter.post("/userCfmfinish", isAuth, taskController.userCfmfinish);
taskRouter.post("/machineCfmfinish", isAuth, taskController.machineCfmfinishEP2);
taskRouter.post("/getMechalist", isAuth, taskController.getMechalist);
taskRouter.post("/getOwnerMechalist", isAuth, taskController.getOwnerMechalist);
taskRouter.post("/getTaskmechaInfo", isAuth, taskController.getTaskmechaInfo);
taskRouter.post(
  "/getHistoryMechanic",
  isAuth,
  taskController.getHistoryMechanic
);
taskRouter.post("/getInfoCalculates", isAuth, taskController.getInfoCalculates);
taskRouter.post("/getMehaListStaff", isAuth, taskController.getMehaListStaff);
taskRouter.post("/getInforSkill", isAuth, taskController.getInforSkill);
taskRouter.post("/getSkillMeachnic", isAuth, taskController.getSkillMeachnic);
taskRouter.post(
  "/getListStatusMechanic",
  isAuth,
  taskController.getListStatusMechanic
);
taskRouter.post(
  "/getListAsignMechanic",
  isAuth,
  taskController.getListAsignMechanic
);
taskRouter.post("/getInfoCalculate", isAuth, taskController.getInfoCalculate);
taskRouter.post("/getInfoTask", isAuth, taskController.getInfoTask);
taskRouter.post("/getListStatusTaskDetail", isAuth, taskController.getListStatusTaskDetail);
taskRouter.post("/getCountStatusTask", isAuth, taskController.getCountStatusTask);
taskRouter.post("/getListRepairedMechanic", isAuth, taskController.getListRepairedMechanic);
taskRouter.post("/getTop5LongestRepairTime", isAuth, taskController.getTop5LongestRepairTime);
taskRouter.post("/getTop3BrokenMachines", isAuth, taskController.getTop3BrokenMachines);
taskRouter.post("/callSupport", isAuth, taskController.callSupport);
taskRouter.post("/getTaskSupport", isAuth, taskController.getTaskSupport);
taskRouter.post("/acceptSupport", isAuth, taskController.acceptSupport);
taskRouter.post("/getHistoryTaskSupport", isAuth, taskController.getHistoryTaskSupport);
taskRouter.post("/changeFloor", isAuth, taskController.changeFloor);
taskRouter.post("/getMachineRepairLine", isAuth, taskController.getMachineRepairLine);
taskRouter.post("/getTaskRecordHistory", isAuth, taskController.getTaskRecordHistory);
taskRouter.get("/getAllTask", taskController.getAllTask);


module.exports = taskRouter;
