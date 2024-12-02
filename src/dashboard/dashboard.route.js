const express = require("express");
const dashboardRouter = express.Router("./dashboard.route");
const dashboardController = require("./dashboard.controller");
const { isAuth } = require("../auth/auth.middleware");
dashboardRouter.post(
  "/dashboardAnalyz",
  dashboardController.getAnalyzDashboard
);
dashboardRouter.post("/lean", dashboardController.getLean);

module.exports = dashboardRouter;
