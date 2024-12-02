// const taskModel = require("../task/task.models");
const schedule = require("node-schedule");
const userModel = require("../users/users.models");
const taskModelss = require("../task/task.models");
const taskModelsss = require("./dashboard.models");

const { createResponse } = require("../../variables/createResponse");
// const socketIo = app.get("socketio");
var admin = require("firebase-admin");
var FCM = require("fcm-node");
// var serverkey =
//   "AAAAHlvA-68:APA91bHkIlBmlzMSVsftMqw6f_4TwgkTwOVNS8HYCNoyJCm4rrvb9YvIaDYGZd2-m1OCsQe3WAqz88NHBdDUzDsdgtFUhRM0IzZtqzg7xjBlW24QhtU9bomg_qYMJXcOi5IDI-4eeSTe";
// var fcm = new FCM(serverkey);
exports.getLean = async (req, res) => {
  const lean = req.body.lean;
  const factory = req.body.factory;
  let conditionlean = `1=1`;
  if (lean) {
    conditionlean += ` and lean ='${lean}'`;
  }
  if (factory) {
    conditionlean += `and factory = '${factory}'`;
  }
  if (1 == 1) {
    conditionlean += `and position > 6`;
  }
  const lean_results = await taskModelsss.getLean(conditionlean);

  if (lean_results) {
    res.status(200).send(createResponse(0, "Thành công", lean_results));
  } else {
    res.send(createResponse(1004, "Không tìm thấy dữ liệu yêu cầu!"));
  }
};

exports.getAnalyzDashboard = async (req, res) => {
  const lean = req.body.lean;
  const factory = req.body.factory;
  const floor = req.body.floor;
  let datestart = req.body.date_from;
  let dateend = req.body.date_to;
  let condition = `1=1`;
  var days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  if (lean) {
    condition += `and t.fixer ='${lean}'`;
  }
  if (factory) {
    condition += `and t.factory = '${factory}'`;
  }
  if (floor) {
    condition += `and u.floor = '${floor}'`;
  }
  if (datestart != "" && dateend != "") {
    condition += `and convert(date,t.date_user_request) between  '${datestart}' and  '${dateend}'`;
  }
  let check = {
    condition: condition,
    datestart: datestart,
    dateend: dateend,
  };
  const analyzDashboard = await taskModelsss.getAnalyz(check);

  let arrnameday = [];
  // console.log(analyzDashboard);
  if (analyzDashboard) {
    if (datestart != dateend) {
      for (i = 0; i < analyzDashboard.length; i++) {
        var d = new Date(analyzDashboard[i].date_user_request);
        var dayName = days[d.getDay()];
        arrnameday.push({ ...analyzDashboard[i], nameday: dayName });
      }
    } else {
      arrnameday = analyzDashboard;
      // for (i = 0; i < analyzDashboard.length; i++) {
      //   var d = analyzDashboard[i].date_user_request;
      //   var dayName = d.toISOString().split("T")[1];

      //   console.log(dayName);
      //   arrnameday.push({
      //     ...analyzDashboard[i],
      //     date_user_request: dayName.split("Z")[0],
      //   });
      // }
    }
  }
  let conditionS = `1=1`;
  if (floor && lean == "TD") {
    // const check = floor.search(",");
    // // console.log("object", check);
    // if (check > 0) {
    //   arr = floor.split(",");
    //   console.log("object", arr);
    //   const check1 = floor.replace(/,/g, "");
    //   conditionS += ` and  A.floor like '[${check1}]%'`;
    // } else {
    // }
  conditionS += ` and  ','+A.floor+',' like '%,${floor},%' `;
  }
  if (floor && lean == "TM") {
    // const check = floor.search(",");
    // // console.log("object", check);
    // if (check > 0) {
    //   arr = floor.split(",");
    //   console.log("TM", arr);
    //   const check0 = floor.replace(/,/g, "");
    //   const check1 = floor.replace(/[A-Z]/g, "");
    //   const check2 = check1.replace(/,/g, "");

    //   console.log("TM", check1);

    //   conditionS += ` and  A.floor like '[${check0}]%' and  A.floor like '%[${check2}]' `;
    // } else {
    //   conditionS += ` and  A.floor like '${floor}%'`;
    // }
  conditionS += ` and  ','+A.floor+',' like '%,${floor},%' `;
    
  }
  if (factory) {
    conditionS += `  AND A.factory = '${factory}' `;
  }

  if (lean) {
    conditionS += `  AND   A.lean = '${lean}' `;
  }
  // const getList = {
  //   floor: floor,
  //   factory: factory,
  //   user_name: position,
  // };
  // console.log(getList);
  // const mechanic = await userModel.getUser(task.id_user_request);
  const list = await taskModelss.getListStatus(conditionS);
  console.log("object", list.refresh_token);
  let a = list.map((e) =>
    delete e.refresh_token ? delete e.token_devices : delete e.token_devices
  );
  if (analyzDashboard) {
    res
      .status(200)
      .send(
        createResponse(0, "Thành công", [
          { avgindate: arrnameday, statuslist: list },
        ])
      );
  } else {
    res.send(createResponse(1004, "Không tìm thấy dữ liệu yêu cầu!"));
  }
};





