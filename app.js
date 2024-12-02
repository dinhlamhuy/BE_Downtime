const express = require("express");
const createError = require("http-errors");
require("express-async-errors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const authRouter = require("./src/auth/auth.routes");
const userRouter = require("./src/users/users.routes");
const taskRouter = require("./src/task/task.route");
const userModel = require("./src/users/users.models");
const taskModel = require("./src/task/task.models");
const damageModel = require("./src/damage_report/damage_report.models");
const db = require("./connection");
const damageRouter = require("./src/damage_report/damage_report.route");
const dashboardRouter = require("./src/dashboard/dashboard.route");
const userController = require("./src/users/users.controller")
dotenv.config();

const app = express();
app.use(express.static(path.join(__dirname, "build")));
app.use(morgan("dev"));
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.use(bodyParser.json());
app.use(cors());
const server = app.listen(process.env.PORT, () => {
  console.log(`Express running → PORT ${server.address().port}`);
  startWithServer();
});
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

io.sockets.on("connection", function (socket) {
  console.log("client connect", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});
app.set("etag", "strong");
app.set("socketio", io);
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/task", taskRouter);
app.use("/damage_report", damageRouter);
app.use("/dashboard", dashboardRouter);
app.get("/*", (req, res) => {
  const exemptedRoute = "/user/tts";

if (req.path.startsWith(exemptedRoute)){
    userController.sendNofity(req, res);
  } else {
    // console.log('test')
    // Otherwise, serve the index.html file
    res.sendFile(path.join(__dirname, "build/index.html"), function (err) {
      if (err) {
        res.status(500).send(err);
      }
    });
  }


  // res.sendFile(path.join(__dirname, "build/index.html"), function (err) {
  //   if (err) {
  //     res.status(500).send(err);
  //   }
  // });
});
// app.get("/timedown", (req, res) => {
//   // res.send("APP hehehe");
//   res.sendFile(path.join(__dirname, "build", "index.html"));
// });

const startWithServer = async () => {
  try {
    const rs = await db.Execute(
      ` SELECT * FROM DT_task_detail where 
    DATEDIFF(SECOND,date_asign_task, GETDATE()) > 360 and 
    date_cfm_mechanic IS NULL and date_mechanic_cfm_onsite IS NULL and date_mechanic_cfm_finished IS NULL and id_user_mechanic IS NOT NULL `
    );
    if (rs.recordset && rs.recordset.length > 0) {
      for (var i = 0; i < rs.recordset.length; i++) {
        const getuser = {
          username: rs.recordset[i].id_user_request,
          factory: rs.recordset[i].factory,
        };
        const userreq = await userModel.getUser(getuser);
        const lean_req = userreq.floor;
        const fixer = rs.recordset[i].fixer;
        const factory = rs.recordset[i].factory;

        let condition = ` permission = 1 `;
        if (fixer) {
          condition += ` and lean = '${fixer}' `;
        }
        if (factory) {
          condition += ` and factory ='${factory}'`;
        }
        if (lean_req && lean_req.length >= 2 && fixer == "TD") {
          condition += ` and floor like '%${lean_req.substring(0, 1)}%'`;
        } else {
          condition += ` and floor like '%${lean_req.substring(0, 2)}%'`;
        }
        const owner = await taskModel.getOwner(condition);
        const getask0 = {
          id_machine: rs.recordset[i].id_machine,
          id_user_request: rs.recordset[i].id_user_request,
          factory: factory,
          lean: fixer,
        };

        const task = await damageModel.getTask(getask0);

        if (owner != null) {
          const updateTask = {
            usermechanic: task.id_user_mechanic,
            cfm_status: 1,
            idmachine: rs.recordset[i].id_machine,
            factory: factory,
            fixer: fixer,
            owner: owner.user_name,
          };
          const declineTask = await taskModel.cfmDeclineTask(updateTask);
          io.emit(`${task.id_user_mechanic}`, "req" + Math.random());
          io.emit(`${owner.user_name}`, "req" + Math.random());
        }
      }
    }
    return null;
  } catch (error) {
    return null;
  }
  // return rs.recordset ;
};



app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res) => {
  console.log(err.stack);
  res.status(err.status || 500).send(err.message);
});
