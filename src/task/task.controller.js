const schedule = require("node-schedule");
const taskModel = require("./task.models");
const userModel = require("../users/users.models");
const { createResponse } = require("../../variables/createResponse");
const damageModel = require("../damage_report/damage_report.models");
// const socketIo = app.get("socketio");
var admin = require("firebase-admin");
var FCM = require("fcm-node");
// var serverkey =
//   "AAAAHlvA-68:APA91bHkIlBmlzMSVsftMqw6f_4TwgkTwOVNS8HYCNoyJCm4rrvb9YvIaDYGZd2-m1OCsQe3WAqz88NHBdDUzDsdgtFUhRM0IzZtqzg7xjBlW24QhtU9bomg_qYMJXcOi5IDI-4eeSTe";
// var fcm = new FCM(serverkey);

const serviceAccount = require("./downtime-1a6e1-firebase-adminsdk-wgypp-d970c360f7.json");

const { get } = require("./task.route");
const { ChangeLng } = require("../../variables/langTransform");
const { Logo } = require("../../variables/changeLogo");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // databaseURL: "https://your-project-id.firebaseio.com", // Thay thế bằng URL của dự án Firebase của bạn
});

function sendMessing(lang, user, content, token_devices) {
  // var message = {
  //   to: tokendwn,
  //   // collapse_key: "XXX",
  //   // data: {
  //   //   my_key: "my value",
  //   //   contents: "abcv/",
  //   // },message
  //   notification: {
  //     title: "Thông báo",
  //     body: user + " " + content,
  //     click_action: "http://localhost:3000/",
  //     vibrate_timings: ["0.0s", "0.2s", "0.1s", "o.2s"],
  //     tag: "vibration-sample",
  //     icon: `data:image/png;base64,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`,
  //     sound: "/testnotification.wav",
  //   },
  // };

  // fcm.send(message, function (err, response) {
  //   if (err) {
  //     console.log(message);
  //     console.log("Something has gone wrong !");
  //   } else {
  //     console.log("Successfully sent with resposne :", response);
  //   }
  // });

  const message = {
    notification: {
      title: ChangeLng(lang, "Thông báo", "Notifications", "သတိပေးစာ"),
      // title: lang == "EN" ? "Notifications" : "Thông báo",
      body: content,
    },
    webpush: {
      fcmOptions: {
        link: "https://lyv.lacty.com.vn",
      },
      notification: {
        icon: `data:image/png;base64,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`,
        click_action: `https://lyv.lacty.com.vn`,
      },
    },
    token: token_devices,
  };

  admin
    .messaging()
    .send(message)
    .then((response) => {
      console.log("Successfully sent notification:", response);
      // res.send("Notification sent successfully.");
    })
    .catch((error) => {
      console.error("Error sending notification:", error);
      // res.status(500).send("Error sending notification.");
    });
}
function sendMessing2(lang, Factory, user, content, token_devices) {
  const logo = Logo(Factory);

  const message = {
    notification: {
      title: ChangeLng(lang, "Thông báo", "Notifications", "သတိပေးစာ"),
      // title: lang == "EN" ? "Notifications" : "Thông báo",
      body: content,
    },
    webpush: {
      fcmOptions: {
        link: "https://lyv.lacty.com.vn",
      },
      notification: {
        icon: logo,
        // icon: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAkFBMVEX///8SxREAwgAAxAD0/fQAwADG78bB7MBu1W3G7cbg9d6T35KP3o43yzj9//3D7MMexh1T0FIzzDKn5ag9zD3V89VJzUms5azl+Oa76ru56riZ35j4/fiB2oFFzkV+2n7Q8dCH3Ifw++9i02Ja0Vpt1m1113SQ35Ci46N42Hhm1Gad4p3q+eij4qNY0lfh9eD6b0wDAAAJa0lEQVR4nO2dC5e5TByANaO/SEmi1YWKxeLd/f7f7p1JaqaUXKJxfs9eDk418zT3aUqnAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACt4jjtTVRfWY0tk2KNV4qvTnrT47sj9jje1AlXBiqC4/8yMlahM/XeHc07+bKXVmqDDW22VpZD1XVVd+gr65lm4NTUWtpf747ujXzZ38Yp/tjaq05w7OqFbfTuV+CoewufPA1FHMvplqQdJrGehc7geg70Bk44O50ObTh9QfweZOpL1E5euEEx2crxAnchU0kpbLXk0TVkooc3vULSdQdBz54c1O1WdSf2vD/oFvb2ehtMz47hRi+J7e38W9OsZvgB92l36gxJYZPTaiVBxubKt4OcaOAbVHLVf1206+LtTBI1vAnYD//sHyurMbFkatZisbBMKf6AbE7SzPyeTLn8HCjkU2Tu2tWGdEMaK81mUiSab5KGEFvK1ukPIi8V0b3oL3DczYzmSlr41hO2Hu3aGjkaDosZ+V1EfpyzguyT43+zU9yt0PmrqnG+esPxKZENrh4NVvSQfjsKZDekkVlmPbCubcmxnVqzOp3ufuMqBoeD7MPjMnZ8fzrqB1qcmAzV39MkwSvnpvPv9ZdxFaPtsiPFWR+7tzQ6DeCQeKEwlfEmJs1x62JrUYO4KSVNTZZbo5A2HvNnRPRO/sYIy0qaP6O4vjEPd5cevRcXv1kv/eSoyBiN/x6M590MiY+VnvHjhmRPma1v7iFy6Vky7PSDqUXeDx876J1MDVIAnfM74kerimdUfvMFOZSUOTo0q76hLxeS7LM5FzeP1qdYfVYjHYxpbk/Ln0fOnhw+6dh1+TPJeQ3O7ya0Pt0+s2IPfonjIk24gOQX86WlcULC/zlX4wHtgTy9AxLQvLo/53rvh2SSyZODKEffk8BH57Dpm3UTg9cebTzc87sRKY37F7WNfwap0M9FjlQD2GhqJOASK/OcVT3SETReMg0wImd2m7yOaPulNhdWRDNIeE65LZN1GsQlTudg5rR5bva0jiQmGWlOdSs3fwKk4jYTJ502gbumA6R1TKr1Rarwn2bD+0VolmQa2mBor6jB+zSnJFW1PkPot8GwPI208slr+3WtsEdL+7k2IxlHa2z4H5FUO1crGybQ5rGZvqlKyklDI+OItBJJo9udkR7HKwfgA3Jy10nSke6G0UjYRFBOusMD4rpsIoxyaE41k3GaIzei2CWCyUiCFH3Zrt66AVwZ4+D0kio+fXrDI8mWdPZJLjkH9VJoVyM5sXOSUZ9c3ehWenRVflHnqcBAwvLh9NJB2LqxkzoYqhW447SS8RFevGsCLCKtVdJCkYw0dquiPBzkdh7FE4ClYDlpJjYYjd83++XN0j6NiqriSyKc78H+I8mulWP6p82+SaX9Uqc8a4y+T698syK+FkL/cnv+Q3KN4+/T47+Nb4T2NTaT7zNUsk7b+9jUOsuXDNHVvZZtEKQdxhrjizLDrmmVoyH87ix6ggyLtap40qq+1BBV1qhNjltu4beqEsWo0hBjZTss5Q0ylymP41bBuNoQtfD68k300TXD3oW9RGIEhmDYesAQDNsPGIJh+wFDMHwTUeC44XKz2fjDw3xaOdXXuKHNTOgdyjY6ZNtsr06eR/Y3XX+LzyAkG5t5qWV9w152TIzyc4/l7JnBqFm2kclsdGVaKV54LOXAFcuI6xv2UXZEVP9CqJJFB2llG1nZsbFSdbSRVtQ774isi453GtZPw2caRutSv5Pj/kJeFcnQrvSLd8bF5W4CGSryFb84jMLiU2EMvfG1BEwCcXI7imLoWfUESSiBmIYLJNUEY/6CtyCGq7opSI8wFtDwUEhB2pU5dWiKFSxfFIUwHOQFMVqo/a+u3vGO092s6Cic4YJXwNjn1g38bXJngFtaK4KhzQug38IN0YHEnQOuAyyAoc6n4MXllpHJKwZCGfLVTKFFP9E1WEXMXLgVwJBPnbLV63xtZGTLQ9pv6LBRx+WXs4fsmWAi2H7DGRtzo3zpjs4cA8vZUuXWG0ZsEhZHDgwhjuWQjFfuKOu5td5wwiQhLp0GoQxkjPBaHeXaktYbsoOm0mrmxHZ+aQFh2w09rhG4Z5ls2w2nTKh4VjtUhrYb/scWw7tuHnmlIb7DUGGLYVA7VIZXGkpa9HWRo4bLDNlhhXzXQt2XGkqlK7OYrMgZ6szOEr5H8MWGNeANu2xFs/hEwz/WsM5CWeEMucbivntWWm74jzUs3jcW7CYl7NIYttxwzhoWF3uq8fNB6CMJ8v/kdKAstqFbevBsFCKSYTGXfoBhjzX0P9GQDfTCDEb7DEu6NOyFQd6QnV/Cq9YbYnNaQmm/9MgGWuy4t83wjtETPwD+RMOOyYQqF4b4n2C4rhwffoIhO8+LC89rOEgmgyGkIdfkX7nTMWBjKIwhW5lKuPpmZjENuarmyipCQQ19tiBWZ1NBDdloX1kxKKghd/mw+o5OUQ2XXMc2+EBDdqqGUFGdimrY4Va05RY8cahs/0ckwx6XiKV3pnv7y9dSBTDsaFzvE68vXul2cktqhDLs8yURZ89nzDbJr1182LD+01qeseortzIRoTW32NmzzcLStocNF7MqNOZS+jMMo3z8sayp/aOn614UTFb08dh5HjWUmHsvLoCebMiNMM4RiK9YxRPCBb1nGFbzdMNOWD/w01Hwg7P6Lze8aZEwJyiMYWd1Qypi9tFxwhh28stky/34J0WLY9g5XL1l5uRn8ffNCGTYmRrXo8A+FVs8w/h6YVW4uOgnmmGnuyQtYEmgGI0vLV2sbziqbuVZZMbwm9mt4g7LrLdwZT2Cd9CKjTy978JUL3cl6xtWP4SPg32Wt7199l2yncFuLXF3ySJjPymdwRH0Tmf9q2+rP8q3oixdJ6hcsiio4Q2AIRi2HzAEw/YDhmDYfsAQDNtPHUOdw8vRLSe/aQn6jVxz4jfuXTOUjBzpqJP+YqlyKHza5LRd+ZSAQX7ov4aQqg0rHtArDlWG+sTO4WTMKb1e+se8zOHUJg4hHybHxJ7Q3woKe+gVhp/Dnc9kF4hLhjj9MoXkxXAYhqHPsqzCv0zo02OEPPwDqgkq/bn0tRMu/atBfj98KZdWfptCczQRLD1m3rBvmDni719OrvKOx2P6V4vSS8ULnvyz4jWL+/oJk/w+QmNfdwcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB8Mv8DC8wFVhMXZiEAAAAASUVORK5CYII=`,
        click_action: `https://lyv.lacty.com.vn`,
      },
    },
    token: token_devices,
  };

  admin
    .messaging()
    .send(message)
    .then((response) => {
      console.log("Successfully sent notification:", response);
      // res.send("Notification sent successfully.");
    })
    .catch((error) => {
      console.error("Error sending notification:", error);
      // res.status(500).send("Error sending notification.");
    });
}

// exports.callMechanic = async (req, res) => {
//   const id_machine = req.body.id_machine;
//   const id_user_request = req.body.id_user_request;
//   const remark = req.body.remark;
//   const getask0 = {
//     id_machine: id_machine,
//     id_user_request: id_user_request,
//     remark: remark,
//   };
//   const task = await taskModel.getTask(getask0);
//   const lean_req = await userModel.getUser(id_user_request);
//   console.log("tesst", task);
//   if (task != null)
//     res
//       .status(409)
//       .send(
//         createResponse(409, "Task đã tồn tại.", { id_machine: id_machine })
//       );
//   else {
//     const newTask = {
//       id_machine: id_machine,
//       id_user_request: id_user_request,
//       remark: remark,
//     };
//     console.log("task", newTask);
//     const createTask = await taskModel.createTask(newTask);
//     console.log(createTask);
//     if (!createTask) {
//       return res
//         .status(400)
//         .send("Có lỗi trong quá trình tạo task, vui lòng thử lại.");
//     }
//     const checkMechanic = await taskModel.getOwnerMechanic(lean_req.floor);
//     // console.log("â", checkMechanic);
//     if (checkMechanic[0].user_name) {
//       let content = "Gửi yêu cầu sửa máy! bấm vào để xem chi tiết!";
//       var io = req.app.get("socketio");
//       io.emit("create", "test");
//       sendMessing(lean_req.user_name, content, checkMechanic[0].token_devices);
//       return res.send(createResponse(0, "Gửi yêu cầu thành công!.", getask0));
//     }
//   }
// };
exports.getMechalist = async (req, res) => {
  const floor = req.body.floor;
  const factory = req.body.factory;
  const user_name = req.body.user_name;
  const lean = req.body.lean;
  // const fromDate = req.body.fromdate;
  // const toDate = req.body.todate;
  let condition = ``;
  const userInfo = {
    username: user_name,
    factory: factory,
  };
  const OnwerUsername = await userModel.getUser(userInfo);
  if (lean == "TD") {
    condition += ` and  ',${OnwerUsername.floor},' like '%,'+DT_user_manager.floor+',%'`;
    condition += ` and DT_task_detail.fixer = 'TD' `;
  }

  if (lean == "TM") {
    condition += ` and DT_task_detail.fixer = 'TM' `;
    condition += ` and  ',${OnwerUsername.floor},' like '%,'+DT_user_manager.floor+',%'`;
  }
  if (factory) {
    condition += `  AND DT_user_manager.factory = '${factory}' `;
  }
  // if (fromDate && toDate) {
  //   condition += ` AND CONVERT(DATE,DT_task_detail.date_user_request) BETWEEN CONVERT(DATE,'${fromDate}') AND CONVERT(DATE,'${toDate}')  `;
  // }
  if (user_name && (factory == "LYM"  ||  factory == "LYV")    ) {
    condition += `  and DT_task_detail.id_owner_mechanic = '${user_name}' `;
  }

  if(factory !== 'LYM'){
    condition+= ' and   DT_task_detail.date_asign_task > DT_task_detail.date_user_request '
  }
  const getList = {
    floor: floor,
    factory: factory,
    user_name: user_name,
  };

  // const mechanic = await userModel.getUser(task.id_user_request);
  const list = await taskModel.getListmehcanic(condition);
  // // console.log("get list", list);

  if (factory) {
    if (list != null) {
      res.status(200).send(createResponse(0, "Thành công", list));
    } else {
      res.send(createResponse(1004, "Không tìm thấy dữ liệu yêu cầu!", []));
    }
  } else {
    res.send(createResponse(1004, "Không tìm thấy dữ liệu yêu cầu!", []));
  }
};
exports.getListStatusMechanic = async (req, res) => {
  const floor = req.body.floor;
  const factory = req.body.factory;
  const position = req.body.position;
  const nameOnwer = req.body.user_name;
  const lean = req.body.lean;
  const permission = req.body.permission;
  const userOwner = await userModel.getUser({
    username: nameOnwer,
    factory: factory,
  });

  let condition = ` 1=1 `;

  if (factory) {
    condition += `  AND A.factory = '${factory}' `;
  }
  // if (position) {
  if (permission == 0) {
    condition += `  AND   permission BETWEEN 1 and 2 `;
  } else {
    condition += `  AND   permission = 2 AND   ',${userOwner.floor},' like '%,'+A.floor+',%' `;
  }
  // condition += `  AND   A.position > '${position}' `;
  // }
  if (lean) {
    condition += `  AND   A.lean = '${lean}' `;
  }

  const list = await taskModel.getListStatus({ condition, permission });

  if (factory) {
    if (list != null) {
      res.status(200).send(createResponse(0, "Thành công", list));
    } else {
      res.send(createResponse(1004, "Không tìm thấy dữ liệu yêu cầu!", []));
    }
  } else {
    res.send(createResponse(1004, "Không tìm thấy dữ liệu yêu cầu!", []));
  }
};

exports.getListAsignMechanic = async (req, res) => {
  const floor = req.body.floor;
  const factory = req.body.factory;
  const position = req.body.position;
  const lean = req.body.lean;
  const idmachine = req.body.id_machine;

  let condition = `1=1`;
  condition += ` and  ',${floor},' like '%,'+A.floor+',%'`;
  // if (floor && lean == "TD") {
  //   const check = floor.search(",");
  //   // console.log("object", check);
  //   if (check > 0) {
  //     arr = floor.split(",");
  //     // console.log("object", arr);
  //     const check1 = floor.replace(/,/g, "");
  //     condition += ` and  A.floor like '[${check1}]%'`;
  //   } else {
  //     condition += ` and  A.floor like '${floor}%'`;
  //   }
  // }
  // if (floor && lean == "TM") {
  //   const check = floor.search(",");
  //   // console.log("object", check);
  //   if (check > 0) {
  //     arr = floor.split(",");
  //     // console.log("TM", arr);
  //     const check0 = floor.replace(/,/g, "");
  //     const check1 = floor.replace(/[A-Z]/g, "");
  //     const check2 = check1.replace(/,/g, "");

  //     // console.log("TM", check1);

  //     condition += ` and  A.floor like '[${check0}]%' and  A.floor like '%[${check2}]' `;
  //   } else {
  //     condition += ` and  A.floor like '${floor}%'`;
  //   }
  // }
  // if (floor) {
  //   const check = floor.search(",");
  //   // console.log("object", check);
  //   if (check > 0) {
  //     arr = floor.split(",");
  //     const check1 = floor.replace(/,/g, "");
  //     console.log("object", check1);
  //     condition += ` and  A.floor like '[${check1}]%'`;
  //   }
  //   if (check == 0) {
  //     condition += ` and  A.floor like '${floor}%'`;
  //   }
  // }
  if (factory) {
    condition += `  AND A.factory = '${factory}' `;
  }
  if (position) {
    condition += `  AND   A.position >= '${position}' `;
  }
  if (lean) {
    condition += `  AND   A.lean = '${lean}' `;
  }

  const getList = {
    floor: floor,
    factory: factory,
    user_name: position,
  };
  // console.log(condition);
  // const mechanic = await userModel.getUser(task.id_user_request);
  const list = await taskModel.getListStatusMechanic({
    condition,
    idmachine,
    factory,
    lean,
  });
  // console.log("get list", list);

  if (factory) {
    if (list != null) {
      res.status(200).send(createResponse(0, "Thành công", list));
    } else {
      res.send(createResponse(1004, "Không tìm thấy dữ liệu yêu cầu!", []));
    }
  } else {
    res.send(createResponse(1004, "Không tìm thấy dữ liệu yêu cầu!", []));
  }
};

exports.getTaskmechaInfo = async (req, res) => {
  //   console.log(req);
  const id_user_mechanic = req.body.id_user_mechanic;
  const factory = req.body.factory;
  const fixer = req.body.lean;
  const userInfo = {
    id_user_mechanic: id_user_mechanic,
    factory: factory,
    fixer: fixer,
  };

  // console.log({userInfo})
  const task = await taskModel.getTaskinformecha(userInfo);
  // let name_userrq = ``;
  // let lean_req = ``;
  // let a = [];
  // // console.log(task[0]);
  // if (task.length > 0) {
  //   for (i = 0; i < task.length; i++) {
  //     const getuser = {
  //       username: task[i].id_user_request,
  //       factory: task[i].factory,
  //     };
  //     const userreq = await userModel.getUser(getuser);
  //     name_userrq = userreq.name;
  //     lean_req = userreq.lean;
  //     a.push({
  //       ...task[i],
  //       name_user_req: name_userrq,
  //       lean_req: lean_req,
  //     });
  //   }
  //   // task["tesst"] = name_userrq;
  //   // console.log(task["0"]);
  // } else {
  //   name_userrq = ``;
  //   lean_req = ``;
  // }
  if (task) {
    // res
    //   .status(200)
    //   .send(createResponse(0, "Thành công", task.length > 0 ? a : task));
    res.status(200).send(createResponse(0, "Thành công", task));
  } else {
    res.send(createResponse(1004, "Không tim thấy dữ liệu yêu cầu!"));
  }
};

exports.getInfoCalculate = async (req, res) => {
  const id_user_mechanic = req.body.user_name;
  const factory = req.body.factory;
  let datestart = req.body.date_from;
  let dateend = req.body.date_to;
  let condition = ``;

  if (datestart != "" && dateend != "") {
    condition += `and convert(date,date_user_request) between  '${datestart}' and  '${dateend}'`;
  }

  const userInfo = {
    id_user_mechanic: id_user_mechanic,
    factory: factory,
    condition: condition,
  };
  const task = await taskModel.getInfoCalcu(userInfo);
  if (task) {
    res.status(200).send(createResponse(0, "Thành công", task));
  } else {
    res.send(createResponse(1004, "Không tìm thấy dữ liệu yêu cầu!"));
  }
};
exports.getInfoTask = async (req, res) => {
  const id_user_mechanic = req.body.user_name;
  const factory = req.body.factory;
  let datestart = req.body.date_from;
  let dateend = req.body.date_to;
  let condition = ``;

  if (datestart != "" && dateend != "") {
    condition += `and convert(date,date_user_request) between  '${datestart}' and  '${dateend}'`;
  }
  const userInfoskill = {
    id_user_mechanic: id_user_mechanic,
    factory: factory,
    condition: condition,
  };
  const taskskill = await taskModel.getTaskhistoryForDasboard(userInfoskill);
  // console.log(taskskill.length);
  let a = "";
  let arrResult = [];
  let arrPercent = [];
  let arrPercentfn = [];
  const list = await taskModel.getSkillInfo();

  if (taskskill.length > 0) {
    for (i = 0; i < taskskill.length; i++) {
      let arr = [];
      let skill_cfm_vn = [];
      let skill_cfm_mm = [];
      let arr1 = [];
      const value = taskskill[i].skill_cfm;
      const value1 = value.split(",");

      let count = "";
      if (taskskill[i] != count) {
        for (ii = 0; ii < value1.length; ii++) {
          arrPercent.push(value1[ii]);

          // console.log("value", value1.search(value1[ii]));
          // console.log(value1[ii], getOccurrence(value1, value1[ii]));
          result1 = list.find((a) =>
            a.id == value1[ii]
              ? arr.push(a.info_skill_en) &&
                skill_cfm_vn.push(a.info_skill_vn) &&
                skill_cfm_mm.push(a.info_skill_mm)
              : ""
          );
          count = taskskill[i].id;
        }
        arr1 = arr;
      }
      a = {
        ...taskskill[i],
        skill_cfm: arr,
        skill_cfm_vn,
        skill_cfm_mm,
      };
      arrResult.push(a);
      // console.log("arrPer", arrResult);
    }
    let sum = 0;
    for (ii = 0; ii < list.length; ii++) {
      sum += getOccurrence(arrPercent, list[ii].id);
    }
    for (ii = 0; ii < list.length; ii++) {
      let namePercent = list[ii].id;

      let values = (
        (getOccurrence(arrPercent, list[ii].id) * 100) /
        sum
      ).toFixed(2);
      if (values > 0) {
        arrPercentfn.push({
          id: namePercent,
          value: values,
          skill_en: list[ii].info_skill_en,
          skill_vn: list[ii].info_skill_vn,
          skill_mm: list[ii].info_skill_mm,
        });
      }
    }
    res
      .status(200)
      .send(createResponse(0, "Thành công", { arrResult, arrPercentfn }));
  } else {
    res.send(
      createResponse(1004, "Không tìm thấy dữ liệu", {
        arrResult,
        arrPercentfn,
      })
    );
  }
};
//------------------CACULATORMULTI-----------------------------//
exports.getInfoCalculates = async (req, res) => {
  const id_user_mechanic = req.body.user_name;
  const factory = req.body.factory;
  let datestart = req.body.date_from;
  let dateend = req.body.date_to;
  let condition = ``;
  // let datestart = "2023-09-29";
  // let dateend = "2023-09-30";
  if (datestart != "" && dateend != "") {
    condition += `and convert(date,date_user_request) between  '${datestart}' and  '${dateend}'`;
  }
  const userInfo = {
    id_user_mechanic: id_user_mechanic,
    factory: factory,
    condition: condition,
  };
  const task = await taskModel.getInfoCalcu(userInfo);
  if (task) {
    const userInfoskill = {
      id_user_mechanic: id_user_mechanic,
      factory: factory,
      condition: condition,
    };
    const taskskill = await taskModel.getTaskhistoryForDasboard(userInfoskill);
    let a = "";
    let arrResult = [];
    let arrPercent = [];
    let arrPercentfn = [];
    const list = await taskModel.getSkillInfo();
    for (i = 0; i < taskskill.length; i++) {
      let arr = [];
      let skill_cfm_vn = [];
      let skill_cfm_mm = [];
      let arr1 = [];
      const value = taskskill[i].skill_cfm;
      const value1 = value.split(",");

      let count = "";
      if (taskskill[i] != count) {
        for (ii = 0; ii < value1.length; ii++) {
          arrPercent.push(value1[ii]);

          // console.log("value", value1.search(value1[ii]));
          // console.log(value1[ii], getOccurrence(value1, value1[ii]));
          result1 = list.find((a) =>
            a.id == value1[ii]
              ? arr.push(a.info_skill_en) &&
                skill_cfm_vn.push(a.info_skill_vn) &&
                skill_cfm_mm.push(a.info_skill_mm)
              : ""
          );
          count = taskskill[i].id;
        }
        arr1 = arr;
      }
      a = {
        ...taskskill[i],
        skill_cfm: arr,
        skill_cfm_vn,
        skill_cfm_mm,
      };
      arrResult.push(a);
      // console.log("arrPer", arrResult);
    }
    let sum = 0;
    for (ii = 0; ii < list.length; ii++) {
      sum += getOccurrence(arrPercent, list[ii].id);
    }
    for (ii = 0; ii < list.length; ii++) {
      let namePercent = list[ii].id;

      let values = (
        (getOccurrence(arrPercent, list[ii].id) * 100) /
        sum
      ).toFixed(2);
      if (values > 0) {
        arrPercentfn.push({
          id: namePercent,
          value: values,
          skill_en: list[ii].info_skill_en,
          skill_vn: list[ii].info_skill_vn,
          skill_mm: list[ii].info_skill_mm,
        });
      }
    }
    if (task) {
      res
        .status(200)
        .send(
          createResponse(0, "Thành công", { ...task, arrResult, arrPercentfn })
        );
    } else {
      res.send(createResponse(1004, "Không tìm thấy dữ liệu yêu cầu!"));
    }
  }
  // console.log("list", list.length);
};

//------------------CACULATORMULTI-----------------------------//

function getOccurrence(array, value) {
  // console.log(array);
  return array.filter((v) => (v != "undefined" ? Number(v) === value : 0))
    .length;
}
exports.getHistoryMechanic = async (req, res) => {
  const id_user_mechanic = req.body.id_user_mechanic;
  const factory = req.body.factory;
  const userInfo = {
    id_user_mechanic: id_user_mechanic,
    factory: factory,
  };
  const task = await taskModel.getTaskhistory(userInfo);
  // console.log(task)
  let name_userrq = ``;
  let lean_req = ``;
  let a = [];
  for (i = 0; i < task.length; i++) {
    if (task.length > 0) {
      const getuser = {
        username: task[i].id_user_request,
        factory: task[i].factory,
      };

      const userreq = await userModel.getUser(getuser);
      if(userreq){

        name_userrq = userreq.name;
        lean_req = userreq.lean;
        line_req = userreq.line;
      }
    } else {
      name_userrq = ``;
      lean_req = ``;
      line_req = ``;
    }
    a.push({
      ...task[i],
      name_userrq: name_userrq,
      lean_req: lean_req,
      line_req: line_req,
    });
  }
  if (task) {
    res
      .status(200)
      .send(createResponse(0, "Thành công", task.length > 0 ? a : task));
  } else {
    res.send(createResponse(1004, "Không tìm thấy dữ liệu yêu cầu!"));
  }
};

exports.getMehalistinfo = async (req, res) => {
  const floor = req.body.floor;
  const factory = req.body.factory;
  const position = req.body.position;

  // const mechanic = await userModel.getUser(task.id_user_request);
  const getListmechanic = {
    floor: floor,
    factory: factory,
  };
  const list = await taskModel.getListmechanic(getListmechanic);
  if (list) {
    res.status(200).send(createResponse(0, "Thành công", list));
  } else {
    res.send(
      createResponse(1004, "Không tìm thấy dữ liệu yêu cầu!", {
        list,
      })
    );
  }
};
exports.getInforSkill = async (req, res) => {
  const list = await taskModel.getSkillInfo();
  if (list) {
    res.status(200).send(createResponse(0, "Thành công", list));
  } else {
    res.send(
      createResponse(1004, "Không tìm thấy dữ liệu yêu cầu!", {
        list,
      })
    );
  }
};
exports.getSkillMeachnic = async (req, res) => {
  const id_user_mechanic = req.body.id_user_mechanic;
  const factory = req.body.factory;
  const userInfo = {
    id_user_mechanic: id_user_mechanic,
    factory: factory,
  };
  const task = await taskModel.getTaskhistoryForDasboard(userInfo);

  const list = await taskModel.getSkillInfo();
  let a = "";
  let arrResult = [];
  for (i = 0; i < task.length; i++) {
    let arr = [];
    let arr1 = [];
    const value = task[i].skill_cfm;
    const value1 = value.split(",");
    let count = "";
    if (task[i] != count) {
      for (ii = 0; ii < value1.length; ii++) {
        result1 = list.find((a) =>
          a.id == value1[ii] ? arr.push(a.info_skill_en) : ""
        );
        count = task[i].id;
      }
      arr1 = arr;
    }
    a = {
      ...task[i],
      skill_cfm: arr,
    };
    arrResult.push(a);
  }
  res.status(200).send(createResponse(0, "Thành công", arrResult));
};

exports.getMehaListStaff = async (req, res) => {
  const factory = req.body.factory;
  const id_user_request = req.body.id_user_request;
  const userInfo = {
    username: id_user_request,
    factory: factory,
  };
  const mechanic = await userModel.getUser(userInfo);
  // console.log("getMehaListStaff", mechanic);
  const getListmechanic = {
    factory: factory,
    position: mechanic.position,
    lean: mechanic.lean,
    floor: mechanic.floor,
    floors: mechanic.floors,
  };
  const list = await taskModel.getInfoStaff(getListmechanic);
  if (list) {
    res.status(200).send(createResponse(0, "Thành công", list));
  } else {
    res.send(
      createResponse(1004, "Không tìm thấy dữ liệu yêu cầu!", {
        list,
      })
    );
  }
};

exports.ownerAsignTask = async (req, res) => {
  const usermechanic = req.body.user_name;
  const idmachine = req.body.id_machine;
  const id_user_owner = req.body.id_owner_mechanic;
  const factory = req.body.factory;
  const lean = req.body.lean;
  // const fixer = req.body.floor;
  const lang = req.body.language;
  // console.log("info", req.body);
  const updateTask = {
    usermechanic: usermechanic,
    id_user_owner: id_user_owner,
    idmachine: idmachine,
    factory: factory,
    fixer: lean,
  };
  const userInfo = {
    username: usermechanic,
    factory: factory,
  };

  // const user = await userModel.getUser(userInfo);
  const infoTask = {
    usermechanic: usermechanic,
    idmachine: idmachine,
    factory: factory,
    fixer: lean,
  };

  const asignTask = await taskModel.ownerAssignTaskManual(updateTask);
  const getUserreq = await taskModel.getTaskinfo(infoTask);
  // console.log({ getUserreq });
  const userInfo2 = {
    factory: factory,
    floor: getUserreq.floor,
    floors: getUserreq.floors,
    fixer: lean,
  };
  // console.log({userInfo2});
  const mechanic = await userModel.getUser(userInfo);
  const mechanicOff = await userModel.UserSameFloor(userInfo2);
  // console.log({ mechanicOff });
  let a = mechanic;
  let bs = getUserreq.id_user_request;
  let id = getUserreq.id;

  // if (mechanic.token_devices == null) {
  //   return res.status(404).send(
  //     createResponse(
  //       1004,
  //       "Không tìm thấy mã thông báo người nhận vui lòng kiểm tra lại."
  //       // { id_machine: id_machine }
  //     )
  //   );
  // }
  // console.log("hahah", asignTask);
  if (asignTask.rowsAffected > 0) {
    // const updateTask = {
    //   usermechanic: usermechanic,
    //   cfm_status: 2,
    //   idmachine: idmachine,
    //   factory: factory,
    // };
    // const asignTask = await taskModel.assignTask(updateTask);
    // console.log("update", updateTask);

    // if (asignTask.rowsAffected > 0) {
    //   let content =
    //     lang == "EN"
    //       ? "Request accepted! Please wait, the repairman is on his way!"
    //       : "Đã chấp nhận yêu cầu! Vui lòng chờ, thợ sửa đang trên đường đến!";
    //   // var io = req.app.get("socketio");
    //   // io.emit(`${usermechanic}`, "accept");
    //   // io.emit(`${task.id_user_owner}`, "accept");
    //   // // console.log(task.id_user_request);
    //   // io.emit(`${task.id_user_request}`, "accept");
    //   if (mechanic.token_devices) {
    //     sendMessing(lang, usermechanic, content, mechanic.token_devices);
    //   }
    //   return res.send(
    //     createResponse(
    //       0,
    //       lang == "EN" ? "Requested success!" : "Gửi yêu cầu thành công!."
    //     )
    //   );
    // }

    var io = req.app.get("socketio");
    if (factory === "LVL" || factory === "LHG" || factory === "LYV") {
      let condition = ` 1=1 AND permission =1`;
      if (lean) {
        condition += ` and lean = '${lean}' `;
      }
      if (factory) {
        condition += ` and factory ='${factory}'`;
      }
      // if (mechanic.floor && mechanic.floor.length >= 2 && fixer == "TD") {
      //   condition += ` and floor like '%${mechanic.floor}%'`;
      // } else {
      //   condition += ` and floor like '%${mechanic.floor}%'`;
      // }
      condition += ` and ','+floor+',' like ',%${mechanic.floor.trim()},%'`;

      const owners = await taskModel.getOwners(condition);

      const promises = owners.map((item) => {
        return new Promise((resolve) => {
          io.emit(`${item.user_name}`, "owner asignTask");
          // let content =lang == "EN" ? "The repairman did not respond!" : "Thợ sửa không phản hồi!";
          let content = ChangeLng(
            lang,
            "Thợ sửa không phản hồi!",
            "The repairman did not respond!",
            "ပြုပြင်ရေးသမားက အကြောင်းမပြန်ဘူး"
          );

          if (item.token_devices) {
            sendMessing2(
              lang,
              factory,
              item.user_name,
              content,
              item.token_devices
            );
          }
          resolve();
        });
      });

      Promise.all(promises)
        .then(() => {
          console.log("All events have been emitted");
        })
        .catch((error) => {
          console.error("Error emitting events:", error);
        });
    } else {
      io.emit(`${id_user_owner}`, "owner asignTask");
    }

    io.emit(`${usermechanic}`, "owner asignTask");
    // console.log(usermechanic);
    io.emit(`${getUserreq.id_user_request}`, "owner asignTask");

    let content = ChangeLng(
      lang,
      "Chủ quản giao phó cho bạn sửa chữa một thiết bị! Vui lòng xác nhận!",
      "The owner entrusts you to repair a device! Please confirm!",
      "ပိုင်ရှင်သည် သင့်အား စက်ကိုပြုပြင်ရန် အပ်နှင်းပါသည်/အတည်ပြုပါ"
    );
    // lang == "EN"
    //   ? "The owner entrusts you to repair a device! Please confirm!"
    //   : "Chủ quản giao phó cho bạn sửa chữa một thiết bị! Vui lòng xác nhận!";
    if (mechanic.token_devices) {
      // console.log(
      //   lang,
      //   factory,
      //   mechanic.user_name,
      //   content,
      //   mechanic.token_devices
      // );

      sendMessing2(
        lang,
        factory,
        mechanic.user_name,
        content,
        mechanic.token_devices
      );
    }
    // const maxposition = await damageModel.getMaxposition(lean);
    // console.log(maxposition);
    var current = new Date().getTime();
    var convert1 = new Date(current);
    var two_minutes_from_now = new Date().getTime() + 360000;


    var convert = new Date(two_minutes_from_now);
    // var ten_minutes_from_now = new Date().getTime() + 360000;
    // var convert = new Date(ten_minutes_from_now);
    // console.log(convert.getMinutes() + " " + convert.getSeconds());
    let i = 0;
    const job = schedule.scheduleJob(
      // `${convert.getSeconds()} ${convert.getMinutes()} * * * *`,
      `${convert}`,
      async function () {
        console.log(
          `Thử nghiệm gửi đến chủ quản trong 2 phút! Thợ ${usermechanic} của ${factory}`
        );

        await checkMechanicok_Huii(
          lang,
          a,
          factory,
          idmachine,
          bs,
          lean,
          io,
          usermechanic
        );
        // oldversion await checkMechanicok(a,factory, idmachine, bs,lean, id, maxposition, io );
      }
    );

    //  sendMessing(usermechanic, content, mechanic.token_devices);
    return res.send(
      createResponse(
        0,
        ChangeLng(
          lang,
          "Giao task thành công!.",
          "Asign task success",
          "တာဝန်ကိုအောင်မြင်ပါစေ"
        )
        // lang == "EN" ? "Asign task success" : "Giao task thành công!."
      )
    );
  } else {
    return res.status(404).send(
      createResponse(
        1004,
        "Không tim thấy dữ liệu phù hợp để cập nhật.",
        asignTask
        // { id_machine: id_machine }
      )
    );
  }
};

exports.mechanicAccept = async (req, res) => {
  const usermechanic = req.body.id_user_mechanic;
  const idmachine = req.body.id_machine;
  const factory = req.body.factory;
  const fixer = req.body.lean;
  const lang = req.body.language;
  const updateTask = {
    usermechanic: usermechanic,
    cfm_status: req.body.status,
    idmachine: idmachine,
    factory: factory,
    fixer:fixer
  };
  const infoTask = {
    usermechanic: usermechanic,
    idmachine: idmachine,
    factory: factory,
    fixer: fixer,
  };

  const task = await taskModel.getTaskinf(infoTask);

  if (task == null) {
    return res.status(404).send(
      createResponse(
        1004,
        ChangeLng(
          lang,
          "Không thể tìm thấy dữ liệu phù hợp để cập nhật.",
          "Could not find suitable data to update.",
          "အပ်ဒိတ်လုပ်ရန် သင့်လျော်သော ဒေတာကိုရှာမတွေ့ပါ"
        )
        // lang == "EN"
        //   ? "Could not find suitable data to update."
        //   : "Không thể tìm thấy dữ liệu phù hợp để cập nhật."
        // { id_machine: id_machine }
      )
    );
  }
  const userInfo = {
    username: task.id_user_request,
    factory: factory,
  };
  const mechanic = await userModel.getUser(userInfo);

  if (mechanic.user_name == null) {
    return res.status(404).send(
      createResponse(
        1004,
        ChangeLng(
          lang,
          "Không tìm thấy mã thông báo người nhận vui lòng kiểm tra lại.",
          "Recipient token not found please check again.",
          "လက်ခံသူတိုကင်ကို ရှာမတွေ့ပါက ထပ်မံစစ်ဆေးပါ"
        )
        // lang == "EN"
        //   ? "Recipient token not found please check again."
        //   : "Không tìm thấy mã thông báo người nhận vui lòng kiểm tra lại."
      )
    );
  }
  if (req.body.status == 2) {
    // console.log('vô')
    const asignTask = await taskModel.assignTask(updateTask);

    if (asignTask.rowsAffected > 0) {
      // console.log('vô')
      const TurnOff = await taskModel.TurnOnOffAlarm({
        line: mechanic.line,
        factory: mechanic.factory,
        status: "off",
        seg: 0,
      });

      let content = ChangeLng(
        lang,
        "Đã chấp nhận yêu cầu! Vui lòng chờ, thợ sửa đang trên đường đến!",
        "Request accepted! Please wait, the repairman is on his way!",
        "‌တောင်းဆိုမှုကို လက်ခံပါသည်၊ ကျေးဇူးပြု၍ စောင့်ပါ ပြုပြင်သူသည် သူ့နည်းလမါးမရှိပါ"
      );
      // let content =
      //   lang == "EN"
      //     ? "Request accepted! Please wait, the repairman is on his way!"
      //     : "Đã chấp nhận yêu cầu! Vui lòng chờ, thợ sửa đang trên đường đến!";
      var io = req.app.get("socketio");

      if (factory === "LYV" || factory === "LVL" || factory === "LHG") {
        const listMechanicLyv = await taskModel.getListMechanicLYV({
          id_request: task.id_user_request,
          lean: fixer,
          factory: factory,
        });

        const promises = listMechanicLyv.map((item) => {
          return new Promise((resolve) => {
            io.emit(`${item.user_name}`, "accept");
            resolve();
          });
        });

        Promise.all(promises)
          .then(() => {
            // console.log("All events have been emitted");
          })
          .catch((error) => {
            // console.error("Error emitting events:", error);
          });
      } else {
        io.emit(`${usermechanic}`, "accept");
        if (task.id_user_owner) {
          io.emit(`${task.id_user_owner}`, "accept");
        }
      }

      io.emit(`${task.id_user_request}`, "accept");
      if (mechanic.token_devices) {
        sendMessing2(
          lang,
          factory,
          mechanic.user_name,
          content,
          mechanic.token_devices
        );
      }
      return res.send(
        createResponse(
          0,
          ChangeLng(
            lang,
            "Gửi yêu cầu thành công!.",
            "Requested success!",
            "‌တောင်းဆိုမှု အောင်မြင်သည်"
          )
          // lang == "EN" ? "Requested success!" : "Gửi yêu cầu thành công!."
        )
      );
    }
  } else if (req.body.status == 3) {
    const asignTask = await taskModel.assignTask(updateTask);

    if (asignTask.rowsAffected > 0) {
      let content = ChangeLng(
        lang,
        "Thợ đã bắt đầu sửa! Vui lòng chờ!",
        "The repairman has started repairing! Please wait!",
        "ပြုပြင်သူသည် စတင်ပြုပြင်နေပြီဖြစ်သည်၊ ခဏစောင့်ပါ"
      );
      // lang == "EN"
      //   ? "The repairman has started repairing! Please wait!"
      //   : "Thợ đã bắt đầu sửa! Vui lòng chờ!";

      var io = req.app.get("socketio");
      io.emit(`${usermechanic}`, "onsite");
      io.emit(`${task.id_user_owner}`, "onsite");

      io.emit(`${task.id_user_request}`, "onsite");
      if (mechanic.token_devices) {
        sendMessing2(
          lang,
          factory,
          mechanic.user_name,
          content,
          mechanic.token_devices
        );
      }
      res.send(
        createResponse(
          0,
          ChangeLng(
            lang,
            "Gửi yêu cầu thành công!.",
            "Requested success!",
            "‌တောင်းဆိုမှု အောင်မြင်သည်"
          )
          // lang == "EN" ? "Requested success!" : "Gửi yêu cầu thành công!."
        )
      );
    }
  } else if (req.body.status == 5) {
    const checkreject = await taskModel.getCheckReject(task.id, usermechanic);

    if (checkreject.total == 0) {
      const infoReject = {
        id_task_detail: task.id,
        id_machine: idmachine,
        id_user_mechanic: usermechanic,
      };

      const createreject = await taskModel.getCreateReject(infoReject);
    } else {
      const updateinf = {
        id_task_detail: task.id,
        number_reject: 2,
        id_user_mechanic: usermechanic,

      };
      console.log(updateinf)
      const update = await taskModel.getUpdateReject(updateinf);
    }
    const userInfo = {
      username: usermechanic,
      factory: factory,
    };
    const mechanicss = await userModel.getUser(userInfo);
    let condition = `1=1`;
    if (fixer) {
      condition += ` and lean = '${fixer}' `;
    }
    if (factory) {
      condition += ` and factory ='${factory}'`;
    }
    if (mechanicss.permission) {
      condition += ` and permission =1 `;
    }
    // if (mechanicss.position) {
    //   condition += ` and position = ${mechanicss.position - 1} `;
    // }
    if (mechanic.floor) {
      condition += `and ','+floor+',' like '%,${mechanicss.floor.trim()},%'`;
    }
    console.log(condition);
    const owner = await taskModel.getOwners(condition);

    const updateTask = {
      usermechanic: usermechanic,
      cfm_status: 1,
      idmachine: idmachine,
      factory: factory,
      fixer: fixer,
      owner: owner[0].user_name,
    };
    const declineTask = await taskModel.cfmDeclineTask(updateTask);
    var io = req.app.get("socketio");

    let content = ChangeLng(
      lang,
      "Thợ sửa đã từ chối sửa máy!",
      "The repairman refused to fix the machine!",
      "ပြုပြင်သူသည် စက်ကို ပြုပြင်ရန် ငြင်းဆိုခဲ့သည်"
    );
    // lang == "EN"
    //   ? "The repairman refused to fix the machine!"
    //   : "Thợ sửa đã từ chối sửa máy!";

    if (factory === "LYV" || factory === "LVL" || factory === "LHG") {
      const listMechanicLyvs = await taskModel.getListMechanicLYV({
        id_request: task.id_user_request,
        lean: fixer,
        factory: factory,
      });

      if (owner[0].token_devices) {
        sendMessing2(
          lang,
          factory,
          owner[0].user_name,
          content,
          owner[0].token_devices
        );
      }

      const promises = listMechanicLyvs.map((item) => {
        return new Promise((resolve) => {
          io.emit(`${item.user_name}`, "continues");

          resolve();
        });
      });

      Promise.all(promises)
        .then(() => {
          // console.log("All events have been emitted");
        })
        .catch((error) => {
          // console.error("Error emitting events:", error);
        });
    } else if (factory === "LVL" || factory === "LHG") {
      io.emit(`${usermechanic}`, "continues");

      const promises = owner.map((item) => {
        return new Promise((resolve) => {
          io.emit(`${item.user_name}`, "continues");
          if (item.token_devices) {
            sendMessing2(
              lang,
              factory,
              item.user_name,
              content,
              item.token_devices
            );
          }
          resolve();
        });
      });

      Promise.all(promises)
        .then(() => {
          // console.log("All events have been emitted");
        })
        .catch((error) => {
          // console.error("Error emitting events:", error);
        });
    } else {
      io.emit(`${usermechanic}`, "continues");
      io.emit(`${owner[0].user_name}`, "continues");

      if (owner[0].token_devices) {
        sendMessing2(
          lang,
          factory,
          owner[0].user_name,
          content,
          owner[0].token_devices
        );
      }
    }
    io.emit(`${task.id_user_request}`, "continues");

    res.status(200).send(
      createResponse(
        0,
        ChangeLng(
          lang,
          "Hủy phiếu thành công!.",
          "Cancel task success!",
          "အလုပ်အောင်မြင်မှု ကို ပယ်ဖျက်ပါ"
        )
        // lang == "EN" ? "Cancel success!" : "Hủy phiếu thành công!."
      )
    );
    if (declineTask.rowsAffected > 0) {
      const userInfo = {
        username: usermechanic,
        factory: factory,
      };
      const mechanics = await userModel.getUser(userInfo);
      // console.log("decline", mechanics);
      let condition = `1=1 and permission = 1 `;
      if (fixer) {
        condition += ` and lean = '${fixer}' `;
      }
      if (factory) {
        condition += ` and factory ='${factory}'`;
      }
      // if (mechanics.position) {
      //   condition += ` and position = ${mechanics.position - 1}`;
      // }
      if (mechanics.floor) {
        condition += ` and ','+floor+',' like '%,${mechanics.floor},%'`;
      }
      const owner = await taskModel.getOwner(condition);
      const ownerAsignTask = {
        usermechanic: owner.user_name,
        id_user_owner: owner.user_name,
        idmachine: idmachine,
        factory: factory,
      };
      const assignTask = await taskModel.ownerAssignTask(ownerAsignTask);
      if (assignTask.rowsAffected > 0) {
        var io = req.app.get("socketio");
        io.emit(`${usermechanic}`, "continue");
        io.emit(`${owner.user_name}`, "continue");
        io.emit(`${task.id_user_request}`, "continue");
        res.status(200).send(
          createResponse(
            0,
            ChangeLng(
              lang,
              "Hủy phiếu thành công!.",
              "Cancel task success!",
              "အလုပ်အောင်မြင်မှု ကို ပယ်ဖျက်ပါ"
            )
            // lang == "EN" ? "Cancel success!" : "Hủy phiếu thành công!."
          )
        );
      }
    }
  }
  // return res.send(
  //   createResponse(
  //     0,
  //     lang == "EN" ? "Requested success!" : "Gửi yêu cầu thành công!."
  //   )
  // );
};

exports.userCfmfinish = async (req, res) => {
  const usermechanic = req.body.id_user_req;
  // const cfm_status = req.body.cfm_status;
  const idmachine = req.body.id_machine;
  const factory = req.body.factory;

  const updateTask = {
    usermechanic: usermechanic,
    // cfm_status: cfm_status,
    idmachine: idmachine,
    factory: factory,
  };
  const infoTask = {
    usermechanic: usermechanic,
    idmachine: idmachine,
    factory: factory,
  };
  const task = await taskModel.getTaskinfuser(infoTask);
  if (req.body.cfm_status == 3) {
    const asignTask = await taskModel.cfmFinishTask(updateTask);
    // console.log(asignTask);
    if (asignTask.rowsAffected > 0) {
      var io = req.app.get("socketio");
      io.emit(`${usermechanic}`, "finall cfm");
      io.emit(`${task.id_user_owner}`, "finall cfm");
      io.emit(`${task.id_user_mechanic}`, "finall cfm");
      return res.send(createResponse(0, "Gửi yêu cầu thành công!."));
    }
  }
};
exports.machineCfmfinish = async (req, res) => {
  const usermechanic = req.body.id_user_mechanic;
  const otherIssue = req.body.otherIssue;
  const idmachine = req.body.id_machine;
  const remark = req.body.remark_mechanic;
  const fixer = req.body.lean;
  const factory = req.body.factory;
  const skill = req.body.skill;
  const lang = req.body.language;
  const updateTask = {
    usermechanic: usermechanic,
    otherIssue: otherIssue,
    idmachine: idmachine,
    factory: factory,
    remark: remark,
    fixer: fixer,
    skill: skill,
  };
  const infoTask = {
    usermechanic: usermechanic,
    idmachine: idmachine,
    factory: factory,
    fixer: fixer,
  };
  //console.log("update", updateTask);
  const task = await taskModel.getTaskinfss(infoTask);
  // if (req.body.cfm_status == 4) {
  const asignTask = await taskModel.cfmFinishTask(updateTask);
  // console.log("asisign finish", asignTask);
  const userInfo = {
    username: task.id_owner_mechanic,
    factory: task.factory,
  };
  const mechanics = await userModel.getUser(userInfo);
  // console.log("hehe", mechanics);

  if (asignTask.rowsAffected > 0) {
    var io = req.app.get("socketio");
    io.emit(`${usermechanic}`, "finish");
    io.emit(`${task.id_user_owner}`, "finish");
    io.emit(`${task.id_user_request}`, "finish");
    // console.log(usermechanic, content, mechanics.token_devices);
    let content = ChangeLng(
      lang,
      "Thợ máy đã hoàn thành công việc!",
      "The mechanic completed the job!",
      "စက်ပြင်အလုပ်က ပြီးသွားသည်"
    );
    // lang == "EN"
    //   ? "The mechanic completed the job!"
    //   : "Thợ máy đã hoàn thành công việc!";
    if (mechanics.token_devices) {
      // console.log("object", content);
      sendMessing2(
        lang,
        factory,
        task.id_user_owner,
        content,
        mechanics.token_devices
      );
      //H thêm mới
      // sendMessing(lang, task.id_user_request, content, mechanics.token_devices);
    }
    return res.send(
      createResponse(
        0,
        ChangeLng(
          lang,
          "Gửi yêu cầu thành công!",
          "Requested success!",
          "‌တောင်းဆိုမှု အောင်မြင်သည်"
        )
        // lang == "EN" ? "Requested success!" : "Gửi yêu cầu thành công!."
      )
    );
  } else {
    return res.send(
      createResponse(
        1004,
        ChangeLng(
          lang,
          "Không tìm thấy dữ liệu!",
          "Data not found!",
          "‌ဒေတာရှာမတွေ့ပါ"
        )
        // lang == "EN" ? "Data not found!" : "Không tìm thấy dữ liệu!."
      )
    );
  }
  // }
};

exports.machineCfmfinishEP2 = async (req, res) => {
  const usermechanic = req.body.id_user_mechanic;
  const new_mechanic = req.body.new_mechanic;
  const other_skill = req.body.otherIssue;

  const idmachine = req.body.id_machine;
  const remark = req.body.remark_mechanic;
  const fixer = req.body.lean;
  const factory = req.body.factory;
  const skill = req.body.skill;
  const lang = req.body.language;
  // console.log("update2", req.body);
  if (skill.includes("4") && new_mechanic === "") {
    return res.send(
      createResponse(
        1004,
        ChangeLng(
          lang,
          "Vui lòng nhập mã máy thay thế.",
          "Please enter the machine code instead!",
          "အစားထိုးရန် စက်ကုဒ်ကို ထည့်ပါ"
        )
        // lang == "EN"
        //   ? "Please enter the machine code instead!"
        //   : "Vui lòng nhập mã máy thay thế."
      )
    );
  } else {
    const updateTask = {
      usermechanic: usermechanic,
      new_mechanic: new_mechanic,
      idmachine: idmachine,
      factory: factory,
      remark: remark,
      fixer: fixer,
      skill: skill,
      other_skill: other_skill,
    };
    const infoTask = {
      usermechanic: usermechanic,
      idmachine: idmachine,
      factory: factory,
      fixer: fixer,
    };
    // console.log("update", updateTask);
    const task = await taskModel.getTaskinfss(infoTask);
    // if (req.body.cfm_status == 4) {
    const asignTask = await taskModel.cfmFinishTaskEP2(updateTask);
    // console.log("asisign finish", asignTask);
    const userInfo = {
      username: task.id_owner_mechanic,
      factory: task.factory,
    };
    // const mechanics = await userModel.getUser(userInfo);
    // console.log("hehe", mechanics);

    if (asignTask.rowsAffected > 0) {
      var io = req.app.get("socketio");
      io.emit(`${usermechanic}`, "finish");
      io.emit(`${task.id_user_owner}`, "finish");
      io.emit(`${task.id_user_request}`, "finish");
      // console.log(usermechanic, content, mechanics.token_devices);
      // let content =
      //   lang == "EN"
      //     ? "The mechanic completed the job!"
      //     : "Thợ máy đã hoàn thành công việc!";
      // if (
      //   mechanics.token_devices
      // ) {
      //   // console.log("object", content);
      //   sendMessing(lang, mechanics.id_user_owner, content, mechanics.token_devices);
      //   //H thêm mới
      //   // sendMessing(lang, task.id_user_request, content, mechanics.token_devices);
      // }
      return res.send(
        createResponse(
          0,
          ChangeLng(
            lang,
            "Gửi yêu cầu thành công!",
            "Requested success!",
            "‌တောင်းဆိုမှု အောင်မြင်သည်"
          )
          // lang == "EN" ? "Requested success!" : "Gửi yêu cầu thành công!."
        )
      );
    } else {
      return res.send(
        createResponse(
          1004,
          ChangeLng(
            lang,
            "Không tìm thấy dữ liệu!",
            "Data not found!",
            "‌‌ဒေတာရှာမတွေ့ပါ"
          )
          // lang == "EN" ? "Data not found!" : "Không tìm thấy dữ liệu!."
        )
      );
    }
  }

  // }
};

checkMechanicok = async (
  lean_req,
  factory,
  idmachine,
  id_user_request,
  fixer,
  id,
  count,
  io
) => {
  // console.log("lean", count);

  let count1 = count.maxposition - 1;
  // // let count1 = count.maxposition;

  await task();
  // let c = count.maxposition - 1;
  let c = 2;
  var interval = setInterval(function () {
    task();
    // console.log(task());
    c++;
    if (c >= count.maxposition) clearInterval(interval);
  }, 360000);
  async function task() {
    // console.log("ok task", count.maxposition);
    const getOwner = {
      fixer: fixer,
      factory: factory,
      position: count1,
      lean_req: lean_req.floor,
    };
    let condition = `1=1`;
    if (fixer) {
      condition += ` and lean = '${fixer}' `;
    }
    if (factory) {
      condition += ` and factory ='${factory}'`;
    }
    if (count1) {
      condition += ` and position = ${count1}`;
    }
    if (lean_req.floor && lean_req.floor.length >= 2 && fixer == "TD") {
      condition += ` and ','+floor+',' like '%,${lean_req.floor},%'`;
    } else {
      condition += ` and ','+floor+',' like '%,${lean_req.floor},%'`;
    }
    const owner = await taskModel.getOwner(condition);
    await owner;
    const getask0 = {
      id_machine: idmachine,
      id_user_request: id_user_request,
      factory: factory,
      lean: fixer,
    };
    // console.log("task đã vào ok nè", getask0);

    const task = await damageModel.getTask(getask0);
    // console.log("okok", task);
    if (task != null) {
      if (owner != null) {
        const ownerAsignTask = {
          usermechanic: owner.user_name,
          id_user_owner: owner.user_name,
          idmachine: idmachine,
          factory: factory,
          fixer: fixer,
        };
        const updateinf = {
          id_task_detail: id,
          number_reject: 2,
        };
        const assignTask = await taskModel.ownerAssignTask(ownerAsignTask);
        // console.log("ownerener", assignTask);
        // console.log("assignagain" + Math.random(), lean_req.user_name);
        io.emit(`${lean_req.user_name}`, "assignagain" + Math.random());
        io.emit(`${owner.user_name}`, "assignagain" + Math.random());
        io.emit(`${task.id_user_request}`, "assignagain" + Math.random());
        const update = await taskModel.getUpdateReject(updateinf);
      }
    } else {
      return clearInterval(interval);
    }
    count1--;
  }
};

checkMechanicok_Huii = async (
  lang,
  lean_req,
  factory,
  idmachine,
  id_user_request,
  fixer,
  io,
  usermechanic
) => {
  await task();
  async function task() {
    let condition = ` permission =1 `;
    if (fixer) {
      condition += ` and lean = '${fixer}' `;
    }
    if (factory) {
      condition += ` and factory ='${factory}'`;
    }
    if (lean_req.floor && lean_req.floor.length >= 2 && fixer == "TD") {
      condition += ` and ','+floor+',' like '%,${lean_req.floor},%'`;
    } else {
      condition += ` and ','+floor+',' like '%,${lean_req.floor},%'`;
    }
    const owner = await taskModel.getOwners(condition);
    await owner;
    const getask0 = {
      id_machine: idmachine,
      id_user_request: id_user_request,
      factory: factory,
      lean: fixer,
    };
    const task = await damageModel.getTask(getask0);
    // console.log(usermechanic , task.id_user_mechanic, task.status)
    if (
      task != null &&
      usermechanic === task.id_user_mechanic &&
      task.status == 1
    ) {
      const no_response = {
        id_task: task.id,
        id_user_onwer: task.id_owner_mechanic,
        id_user_machine: usermechanic,
        factory: factory,
        id_machine: idmachine,
        receive_date:new Date(task.date_asign_task)
      };
      console.log(no_response)
      const log_noresponse= await taskModel.createDT_NoResponse(no_response);
      if (owner != null) {
        const updateTask = {
          usermechanic: lean_req.user_name,
          cfm_status: 1,
          idmachine: idmachine,
          factory: factory,
          fixer: fixer,
          owner: task.id_owner_mechanic
        };
        // || owner[0].user_name

        const declineTask = await taskModel.cfmDeclineTask(updateTask);
        io.emit(`${lean_req.user_name}`, "assignagain" + Math.random());
        if (factory === "LVL" || factory === "LHG" || factory === "LYV") {
          const promises = owner.map((item) => {
            return new Promise((resolve) => {
              io.emit(`${item.user_name}`, "req" + Math.random());
              let content = ChangeLng(
                lang,
                "Thợ sửa không phản hồi!",
                "The repairman did not respond!",
                "ပြုပြင်ရေးသမားက အကြောင်းမပြန်ဘူး"
              );
              // lang == "EN"
              //   ? "The repairman did not respond!"
              //   : "Thợ sửa không phản hồi!";
              if (item.token_devices) {
                sendMessing2(
                  lang,
                  factory,
                  item.user_name,
                  content,
                  item.token_devices
                );
              }
              resolve();
            });
          });

          Promise.all(promises)
            .then(() => {
              console.log("All events have been emitted");
            })
            .catch((error) => {
              console.error("Error emitting events:", error);
            });
        } else {
          io.emit(`${owner[0].user_name}`, "req" + Math.random());
          // let content =
          //   lang == "EN"
          //     ? "The repairman did not respond!"
          //     : "Thợ sửa không phản hồi!";
          let content = ChangeLng(
            lang,
            "Thợ sửa không phản hồi!",
            "The repairman did not respond!",
            "ပြုပြင်ရေးသမားက အကြောင်းမပြန်ဘူး"
          );
          if (owner[0].token_devices) {
            // console.log("object", content);
            sendMessing2(
              lang,
              factory,
              owner[0].user_name,
              content,
              owner[0].token_devices
            );
          }
        }
      }
    }
  }
};

exports.getListStatusTaskDetail = async (req, res) => {
  const floor = req.body.floor;
  const factory = req.body.factory;
  const fromDate = req.body.fromdate;
  const toDate = req.body.todate;
  const lean = req.body.lean;

  const updateTask = {
    floor: floor,
    factory: factory,
    lean: lean,
    fromDate: fromDate,
    toDate: toDate,
  };
  const listTask = await taskModel.getListStatusTask(updateTask);
  if (listTask) {
    res.status(200).send(createResponse(0, "Thành công", listTask));
  } else {
    res.send(
      createResponse(1004, "Không tìm thấy dữ liệu yêu cầu!", {
        listTask,
      })
    );
  }
};
exports.getCountStatusTask = async (req, res) => {
  const floor = req.body.floor;
  const factory = req.body.factory;
  const fromDate = req.body.fromdate;
  const toDate = req.body.todate;
  const lean = req.body.lean;
  const updateTask = {
    floor: floor,
    factory: factory,
    lean: lean,
    fromDate: fromDate,
    toDate: toDate,
  };
  // console.log('test',updateTask)
  const listTask = await taskModel.getCountTask(updateTask);
  if (listTask) {
    res.status(200).send(createResponse(0, "Thành công", listTask));
  } else {
    res.send(
      createResponse(1004, "Không tìm thấy dữ liệu yêu cầu!", {
        listTask,
      })
    );
  }
};
exports.getListRepairedMechanic = async (req, res) => {
  const floor = req.body.floor;
  const factory = req.body.factory;
  const time = req.body.time;

  const lean = req.body.lean;
  const updateTask = {
    floor: floor,
    factory: factory,
    lean: lean,
    time: time,
  };
  // console.log('test',updateTask)
  const listTask = await taskModel.getRepairedMechanic(updateTask);
  const updatedTasks = await Promise.all(
    listTask.map(async (item) => {
      const reasonInfo = await taskModel.getReasonInfo({
        reasonString: item.reason,
      });

      // Add the info_reason_en and info_reason_vn fields to the item
      return {
        ...item,
        info_reason_en: reasonInfo.info_reason_en,
        info_reason_vn: reasonInfo.info_reason_vn,
        info_reason_mm: reasonInfo.info_reason_mm,
      };
    })
  );

  if (updatedTasks) {
    res.status(200).send(createResponse(0, "Thành công", updatedTasks));
  } else {
    res.send(
      createResponse(1004, "Không tìm thấy dữ liệu yêu cầu!", {
        listTask,
      })
    );
  }
};

exports.getTop5LongestRepairTime = async (req, res) => {
  const floor = req.body.floor;
  const factory = req.body.factory;
  const time = req.body.time;

  const lean = req.body.lean;
  const updateTask = {
    floor: floor,
    factory: factory,
    lean: lean,
    time: time,
  };
  // console.log('test',updateTask)
  const listTask = await taskModel.getRepairedMechanicLineChart(updateTask);

  if (listTask) {
    res.status(200).send(createResponse(0, "Thành công", listTask));
  } else {
    res.send(
      createResponse(1004, "Không tìm thấy dữ liệu yêu cầu!", {
        listTask,
      })
    );
  }
};
exports.getTop3BrokenMachines = async (req, res) => {
  const floor = req.body.floor;
  const factory = req.body.factory;
  const time = req.body.time;

  const lean = req.body.lean;
  const updateTask = {
    floor: floor,
    factory: factory,
    lean: lean,
    time: time,
  };
  // console.log('test',updateTask)
  const listTask = await taskModel.getRepairedMechanicPieChart(updateTask);

  if (listTask) {
    res.status(200).send(createResponse(0, "Thành công", listTask));
  } else {
    res.send(
      createResponse(1004, "Không tìm thấy dữ liệu yêu cầu!", {
        listTask,
      })
    );
  }
};

exports.getOwnerMechalist = async (req, res) => {
  const floor = req.body.floor;
  const factory = req.body.factory;
  const lean = req.body.lean;
  const fromDate = req.body.fromdate;
  const toDate = req.body.todate;
  let condition = ` and  ',${floor},' like '%,'+DT_user_manager.floor+',%'  AND DT_user_manager.factory = '${factory}' `;
  if (floor && lean == "TD") {
    condition += ` and DT_task_detail.fixer = 'TD' `;
  }
  if (floor && lean == "TM") {
    condition += ` and DT_task_detail.fixer = 'TM' `;
  }
  if (fromDate && toDate) {
    condition += ` AND CONVERT(DATE,DT_task_detail.date_asign_task) BETWEEN CONVERT(DATE,'${fromDate}') AND CONVERT(DATE,'${toDate}')  `;
  }
  const list = await taskModel.getListOnwermehcanic(condition);
  if (factory) {
    if (list != null) {
      res.status(200).send(createResponse(0, "Thành công", list));
    } else {
      res.send(createResponse(1004, "Không tìm thấy dữ liệu yêu cầu!", []));
    }
  } else {
    res.send(createResponse(1004, "Không tìm thấy dữ liệu yêu cầu!", []));
  }
};

exports.callSupport = async (req, res) => {
  const floor = req.body.floor;
  const factory = req.body.factory;
  const line = req.body.line;
  const id_task = req.body.id_task;
  const name_machine = req.body.name_machine;
  const status = req.body.status;
  const user_machine = req.body.user_machine;
  const user_owner = req.body.user_owner;
  const lang = req.body.lang;
  const remark = req.body.remark;
  const support_detail = req.body.support_detail;


  // return ;
  const getask0 = {
    user_machine: user_machine,
    factory: factory,
    line: line,
  };

  const task = await taskModel.getDTsupport(getask0);
  if (task != null) {
    res.status(409).send(
      createResponse(
        1001,
        // lang == "EN" ? "The application form already exists." : "Phiếu đề nghị đã tồn tại.",
        ChangeLng(
          lang,
          "Đề nghị hỗ trợ đã tồn tại.",
          "The application form already exists.",
          "‌လျှောက်လွှာပုံစံက ရှိပြီးသားပါ"
        ),
        {
          line: line,
          user_machine: user_machine,
        }
      )
    );
  } else {
    const infoTask = {
      floor: floor,
      factory: factory,
      line: line,
      status: status,
      user_machine: user_machine,
      user_owner: user_owner,
      remark: remark,
      id_task:id_task,
      name_machine:name_machine,
      support_detail: support_detail,
    };

    const userInfo = {
      username: user_machine,
      factory: factory,
    };
    const checkMechanic = await userModel.getUser(userInfo);

    const createTask = await taskModel.createDTSupport(infoTask);
    if (!createTask) {
      let content = ChangeLng(
        lang,
        "Có lỗi trong quá trình tạo task, vui lòng thử lại.",
        "There was an error while creating the task, please try again.",
        "လုပ်ဆောင်စရာကို ဖန်တီးနေစ၌ အမှားအယွင်းတစ်ခုရှိခဲ့သည် ၊ကျေးဇူးပြု၍ ထပ်စမ်းကြည့်ပါ."
      );
      console.log("hi", checkMechanic.token_devices);
      if (checkMechanic.token_devices) {
        sendMessing2(
          lang,
          factory,
          user_machine,
          content,
          checkMechanic.token_devices
        );
      }

      return res.status(400).send(content);
    }

    if (factory) {
      var io = req.app.get("socketio");
      io.emit(`${user_machine}`, "req" + Math.random());

      // console.log('hehe')
      let content2 = ChangeLng(
        lang,
        "Cán bộ gửi yêu cầu cho bạn hỗ trợ!",
        "The owner sent you a request for support.",
        "‌ပိုင်ရှင်က သင့်ထံ အကူအညီတောင်းခံမှုတစ်ခု ပေးပို့ခဲ့သည်။"
      );
      // console.log("hi2", checkMechanic.token_devices);
      if (checkMechanic.token_devices) {
        sendMessing2(
          lang,
          factory,
          user_machine,
          content2,
          checkMechanic.token_devices
        );
      }
      return res.send(
        createResponse(
          0,
          ChangeLng(
            lang,
            "Gửi yêu cầu thành công!",
            "Requested success!",
            "‌တောင်းဆိုမှု အောင်မြင်သည်"
          ),
          []
        )
      );
    } else {
      return res.send(
        createResponse(1004, "Không tìm thấy dữ liệu yêu cầu!", [])
      );
    }
  }
};

exports.acceptSupport = async (req, res) => {
  const floor = req.body.floor;
  const factory = req.body.factory;
  const line = req.body.line;
  const status = req.body.status;
  const user_machine = req.body.user_machine;
  const user_owner = req.body.user_owner;
  const remark = req.body.remark;
  const support_detail = req.body.support_detail;
  const lang = req.body.language;

  const getask0 = {
    user_machine: user_machine,
    factory: factory,
    line: line,
  };

  const task = await taskModel.getDTsupport(getask0);
  if (task == null) {
    res.status(409).send(
      createResponse(
        1001,
        // lang == "EN" ? "The application form already exists." : "Phiếu đề nghị đã tồn tại.",
        ChangeLng(
          lang,
          "Không tìm thấy đề nghị hỗ trợ",
          "No support request found",
          "‌ပံ့ပိုးမှုကမ်းလှမ်းချက်များမတွေ့ပါ။"
        ),
        {
          line: line,
          user_machine: user_machine,
        }
      )
    );
  } else {
    const infoTask = {
      id: task.id,
      factory: factory,
      line: line,
      status: status,
      user_machine: user_machine,
      support_detail: support_detail,
    };
    let content = "";
    if (status === 2) {
      content = ChangeLng(
        lang,
        "Đã chấp nhận yêu cầu! Vui lòng chờ, thợ sửa đang trên đường đến!",
        "Request accepted! Please wait, the repairman is on his way!",
        "‌တောင်းဆိုမှုကို လက်ခံပါသည်၊ ကျေးဇူးပြု၍ စောင့်ပါ ပြုပြင်သူသည် သူ့နည်းလမါးမရှိပါ"
      );
    } else if (status === 3) {
      content = ChangeLng(
        lang,
        "Đã chấp nhận yêu cầu! Vui lòng chờ, thợ sửa đang trên đường đến!",
        "Request accepted! Please wait, the repairman is on his way!",
        "‌တောင်းဆိုမှုကို လက်ခံပါသည်၊ ကျေးဇူးပြု၍ စောင့်ပါ ပြုပြင်သူသည် သူ့နည်းလမါးမရှိပါ"
      );
    } else {
      content = ChangeLng(
        lang,
        "Thợ sửa đã từ chối! Vui lòng tìm thợ khác",
        "The repairman refused! Please find another repairman.",
        "ပြုပြင်ရေးသမားက ငြင်းတယ်။ ကျေးဇူးပြု၍ အခြားအလုပ်သမားကိုရှာပါ။"
      );
    }

    const list = await taskModel.UpdateDTSupport(infoTask);

    var io = req.app.get("socketio");
    io.emit(`${user_machine}`, "req" + Math.random());

    if (factory) {
      if (list != null) {
        res.status(200).send(createResponse(0, content, list));
      } else {
        res.send(createResponse(1004, "Không tìm thấy dữ liệu yêu cầu!", []));
      }
    } else {
      res.send(createResponse(1004, "Không tìm thấy dữ liệu yêu cầu!", []));
    }
  }
};

exports.getTaskSupport = async (req, res) => {
  //   console.log(req);
  const user_machine = req.body.user_machine;
  const factory = req.body.factory;

  const userInfo = {
    user_machine: user_machine,
    factory: factory,
  };
  // console.log(userInfo);
  const task = await taskModel.getTaskInfoSupport(userInfo);

  if (task) {
    return res.status(200).send(createResponse(0, "Thành công", task));
  } else {
    return res.send(createResponse(1004, "Không tim thấy dữ liệu yêu cầu!"));
  }
};
exports.getHistoryTaskSupport = async (req, res) => {
  //   console.log(req);
  const user_machine = req.body.user_machine;
  const factory = req.body.factory;

  const userInfo = {
    user_machine: user_machine,
    factory: factory,
  };
  // console.log(userInfo);
  const task = await taskModel.getHistoryInfoSupport(userInfo);

  if (task) {
    return res.status(200).send(createResponse(0, "Thành công", task));
  } else {
    return res.send(createResponse(1004, "Không tim thấy dữ liệu yêu cầu!"));
  }
};

exports.changeFloor = async (req, res) => {
  const arrfloor = req.body.floor;
  const floor = arrfloor.join(",").trim();
  const factory = req.body.factory;
  const user_name = req.body.user_name;
  const lang = req.body.language;

  const info = {
    factory: factory,
    user_name: user_name,
    floor: floor,
  };

  const changefloor = await taskModel.updateFloor(info);
  // var io = req.app.get("socketio");
  // io.emit(`${user_machine}`, "req" + Math.random());

  if (!changefloor) {
    let content = ChangeLng(
      lang,
      "có lỗi trong quá trình thay đổi mặt lầu, vui lòng thử lại",
      "There was an error changing the floor plan, please try again.",
      "ကြမ်းပြင်ကိုပြောင်းစဉ် အမှားအယွင်းတစ်ခုရှိခဲ့သည်၊ ကျေးဇူးပြု၍ ထပ်စမ်းကြည့်ပါ။"
    );

    return res.status(400).send(content);
  }
  let content2 = ChangeLng(lang, "Thành công!", "Success!", "အောင်မြင်မှု");
  return res.status(200).send(createResponse(0, content2, []));
};


exports.getMachineRepairLine = async (req, res) => {
  //   console.log(req);
  const line = req.body.line;
  const factory = req.body.factory;

  const lineInfo = {
    line: line,
    factory: factory,
  };
  // console.log(userInfo);
  const machine = await taskModel.getCurrentMachineByLine(lineInfo);

  if (machine) {
    return res.status(200).send(createResponse(0, "Thành công", machine));
  } else {
    return res.send(createResponse(1004, "Không tim thấy dữ liệu yêu cầu!"));
  }
};
exports.getTaskRecordHistory = async (req, res) => {
  const id_task = req.body.id_task;
  // console.log(id_task)

  const history = await taskModel.getDetailProcessTask(id_task);

  if (history) {
    return res.status(200).send(createResponse(0, "Thành công", history));
  } else {
    return res.send(createResponse(1004, "Không tim thấy dữ liệu yêu cầu!"));
  }
};

exports.getAllTask = async (req, res) => {
  try {
    // Lấy factory từ query, body hoặc params (tùy thuộc vào cách bạn truyền dữ liệu)
    const factory = req.query.factory || req.body.factory || req.params.factory;
    const fromdate = req.query.fromdate || req.body.fromdate || req.params.fromdate ;
    const todate = req.query.todate || req.body.todate || req.params.todate;

    if (!factory) {
      return res
        .status(400)
        .send(createResponse(1001, "Thiếu thông tin 'factory' trong yêu cầu!"));
    }

    // Gọi model để lấy thông tin task
    const task = await taskModel.getAllTaskInfo({ factory,fromdate,todate });

    if (task) {
      res
        .status(200)
        .send(createResponse(0, "Thành công",  task));
    } else {
      res.send(createResponse(1004, "Không tìm thấy dữ liệu yêu cầu!"));
    }
  } catch (error) {
    // Xử lý lỗi
    console.error(error);
    return res.status(500).send(createResponse(1000, "Lỗi hệ thống!"));
  }
};