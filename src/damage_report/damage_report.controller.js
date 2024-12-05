// const taskModel = require("../task/task.models");
const schedule = require("node-schedule");
const taskModel = require("./damage_report.models");
const userModel = require("../users/users.models");
const taskModelss = require("../task/task.models");
// const logoLY=require('../../img_sound/logo.png');
const axios = require("axios");
const { createResponse } = require("../../variables/createResponse");
// const socketIo = app.get("socketio");
var admin = require("firebase-admin");
var FCM = require("fcm-node");
// var serverkey =
//   "AAAAHlvA-68:APA91bHkIlBmlzMSVsftMqw6f_4TwgkTwOVNS8HYCNoyJCm4rrvb9YvIaDYGZd2-m1OCsQe3WAqz88NHBdDUzDsdgtFUhRM0IzZtqzg7xjBlW24QhtU9bomg_qYMJXcOi5IDI-4eeSTe";
// var fcm = new FCM(serverkey);

const serviceAccount = require("./downtime-1a6e1-firebase-adminsdk-wgypp-d970c360f7.json");
const { ChangeLng } = require("../../variables/langTransform");
const { Logo } = require("../../variables/changeLogo");
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   // databaseURL: "https://your-project-id.firebaseio.com", // Thay thế bằng URL của dự án Firebase của bạn
// });

function sendMessing(lang, user, content, token_devices) {
  let url = "https://test-83t2fumra-aliot89.vercel.app";
  let URL2 = "https://reactjs-jx9nxtfev-aliot89.vercel.app/";
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
  //     icon: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAkFBMVEX///8SxREAwgAAxAD0/fQAwADG78bB7MBu1W3G7cbg9d6T35KP3o43yzj9//3D7MMexh1T0FIzzDKn5ag9zD3V89VJzUms5azl+Oa76ru56riZ35j4/fiB2oFFzkV+2n7Q8dCH3Ifw++9i02Ja0Vpt1m1113SQ35Ci46N42Hhm1Gad4p3q+eij4qNY0lfh9eD6b0wDAAAJa0lEQVR4nO2dC5e5TByANaO/SEmi1YWKxeLd/f7f7p1JaqaUXKJxfs9eDk418zT3aUqnAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACt4jjtTVRfWY0tk2KNV4qvTnrT47sj9jje1AlXBiqC4/8yMlahM/XeHc07+bKXVmqDDW22VpZD1XVVd+gr65lm4NTUWtpf747ujXzZ38Yp/tjaq05w7OqFbfTuV+CoewufPA1FHMvplqQdJrGehc7geg70Bk44O50ObTh9QfweZOpL1E5euEEx2crxAnchU0kpbLXk0TVkooc3vULSdQdBz54c1O1WdSf2vD/oFvb2ehtMz47hRi+J7e38W9OsZvgB92l36gxJYZPTaiVBxubKt4OcaOAbVHLVf1206+LtTBI1vAnYD//sHyurMbFkatZisbBMKf6AbE7SzPyeTLn8HCjkU2Tu2tWGdEMaK81mUiSab5KGEFvK1ukPIi8V0b3oL3DczYzmSlr41hO2Hu3aGjkaDosZ+V1EfpyzguyT43+zU9yt0PmrqnG+esPxKZENrh4NVvSQfjsKZDekkVlmPbCubcmxnVqzOp3ufuMqBoeD7MPjMnZ8fzrqB1qcmAzV39MkwSvnpvPv9ZdxFaPtsiPFWR+7tzQ6DeCQeKEwlfEmJs1x62JrUYO4KSVNTZZbo5A2HvNnRPRO/sYIy0qaP6O4vjEPd5cevRcXv1kv/eSoyBiN/x6M590MiY+VnvHjhmRPma1v7iFy6Vky7PSDqUXeDx876J1MDVIAnfM74kerimdUfvMFOZSUOTo0q76hLxeS7LM5FzeP1qdYfVYjHYxpbk/Ln0fOnhw+6dh1+TPJeQ3O7ya0Pt0+s2IPfonjIk24gOQX86WlcULC/zlX4wHtgTy9AxLQvLo/53rvh2SSyZODKEffk8BH57Dpm3UTg9cebTzc87sRKY37F7WNfwap0M9FjlQD2GhqJOASK/OcVT3SETReMg0wImd2m7yOaPulNhdWRDNIeE65LZN1GsQlTudg5rR5bva0jiQmGWlOdSs3fwKk4jYTJ502gbumA6R1TKr1Rarwn2bD+0VolmQa2mBor6jB+zSnJFW1PkPot8GwPI208slr+3WtsEdL+7k2IxlHa2z4H5FUO1crGybQ5rGZvqlKyklDI+OItBJJo9udkR7HKwfgA3Jy10nSke6G0UjYRFBOusMD4rpsIoxyaE41k3GaIzei2CWCyUiCFH3Zrt66AVwZ4+D0kio+fXrDI8mWdPZJLjkH9VJoVyM5sXOSUZ9c3ehWenRVflHnqcBAwvLh9NJB2LqxkzoYqhW447SS8RFevGsCLCKtVdJCkYw0dquiPBzkdh7FE4ClYDlpJjYYjd83++XN0j6NiqriSyKc78H+I8mulWP6p82+SaX9Uqc8a4y+T698syK+FkL/cnv+Q3KN4+/T47+Nb4T2NTaT7zNUsk7b+9jUOsuXDNHVvZZtEKQdxhrjizLDrmmVoyH87ix6ggyLtap40qq+1BBV1qhNjltu4beqEsWo0hBjZTss5Q0ylymP41bBuNoQtfD68k300TXD3oW9RGIEhmDYesAQDNsPGIJh+wFDMHwTUeC44XKz2fjDw3xaOdXXuKHNTOgdyjY6ZNtsr06eR/Y3XX+LzyAkG5t5qWV9w152TIzyc4/l7JnBqFm2kclsdGVaKV54LOXAFcuI6xv2UXZEVP9CqJJFB2llG1nZsbFSdbSRVtQ774isi453GtZPw2caRutSv5Pj/kJeFcnQrvSLd8bF5W4CGSryFb84jMLiU2EMvfG1BEwCcXI7imLoWfUESSiBmIYLJNUEY/6CtyCGq7opSI8wFtDwUEhB2pU5dWiKFSxfFIUwHOQFMVqo/a+u3vGO092s6Cic4YJXwNjn1g38bXJngFtaK4KhzQug38IN0YHEnQOuAyyAoc6n4MXllpHJKwZCGfLVTKFFP9E1WEXMXLgVwJBPnbLV63xtZGTLQ9pv6LBRx+WXs4fsmWAi2H7DGRtzo3zpjs4cA8vZUuXWG0ZsEhZHDgwhjuWQjFfuKOu5td5wwiQhLp0GoQxkjPBaHeXaktYbsoOm0mrmxHZ+aQFh2w09rhG4Z5ls2w2nTKh4VjtUhrYb/scWw7tuHnmlIb7DUGGLYVA7VIZXGkpa9HWRo4bLDNlhhXzXQt2XGkqlK7OYrMgZ6szOEr5H8MWGNeANu2xFs/hEwz/WsM5CWeEMucbivntWWm74jzUs3jcW7CYl7NIYttxwzhoWF3uq8fNB6CMJ8v/kdKAstqFbevBsFCKSYTGXfoBhjzX0P9GQDfTCDEb7DEu6NOyFQd6QnV/Cq9YbYnNaQmm/9MgGWuy4t83wjtETPwD+RMOOyYQqF4b4n2C4rhwffoIhO8+LC89rOEgmgyGkIdfkX7nTMWBjKIwhW5lKuPpmZjENuarmyipCQQ19tiBWZ1NBDdloX1kxKKghd/mw+o5OUQ2XXMc2+EBDdqqGUFGdimrY4Va05RY8cahs/0ckwx6XiKV3pnv7y9dSBTDsaFzvE68vXul2cktqhDLs8yURZ89nzDbJr1182LD+01qeseortzIRoTW32NmzzcLStocNF7MqNOZS+jMMo3z8sayp/aOn614UTFb08dh5HjWUmHsvLoCebMiNMM4RiK9YxRPCBb1nGFbzdMNOWD/w01Hwg7P6Lze8aZEwJyiMYWd1Qypi9tFxwhh28stky/34J0WLY9g5XL1l5uRn8ffNCGTYmRrXo8A+FVs8w/h6YVW4uOgnmmGnuyQtYEmgGI0vLV2sbziqbuVZZMbwm9mt4g7LrLdwZT2Cd9CKjTy978JUL3cl6xtWP4SPg32Wt7199l2yncFuLXF3ySJjPymdwRH0Tmf9q2+rP8q3oixdJ6hcsiio4Q2AIRi2HzAEw/YDhmDYfsAQDNtPHUOdw8vRLSe/aQn6jVxz4jfuXTOUjBzpqJP+YqlyKHza5LRd+ZSAQX7ov4aQqg0rHtArDlWG+sTO4WTMKb1e+se8zOHUJg4hHybHxJ7Q3woKe+gVhp/Dnc9kF4hLhjj9MoXkxXAYhqHPsqzCv0zo02OEPPwDqgkq/bn0tRMu/atBfj98KZdWfptCczQRLD1m3rBvmDni719OrvKOx2P6V4vSS8ULnvyz4jWL+/oJk/w+QmNfdwcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB8Mv8DC8wFVhMXZiEAAAAASUVORK5CYII=`,
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
      // lang == "EN" ? "Notifications" : "Thông báo",
      body: content,
      // image: `data:image/png;base64,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`,
    },
    webpush: {
      fcmOptions: {
        link: "https://lyv.lacty.com.vn",
      },
      notification: {
        icon: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAkFBMVEX///8SxREAwgAAxAD0/fQAwADG78bB7MBu1W3G7cbg9d6T35KP3o43yzj9//3D7MMexh1T0FIzzDKn5ag9zD3V89VJzUms5azl+Oa76ru56riZ35j4/fiB2oFFzkV+2n7Q8dCH3Ifw++9i02Ja0Vpt1m1113SQ35Ci46N42Hhm1Gad4p3q+eij4qNY0lfh9eD6b0wDAAAJa0lEQVR4nO2dC5e5TByANaO/SEmi1YWKxeLd/f7f7p1JaqaUXKJxfs9eDk418zT3aUqnAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACt4jjtTVRfWY0tk2KNV4qvTnrT47sj9jje1AlXBiqC4/8yMlahM/XeHc07+bKXVmqDDW22VpZD1XVVd+gr65lm4NTUWtpf747ujXzZ38Yp/tjaq05w7OqFbfTuV+CoewufPA1FHMvplqQdJrGehc7geg70Bk44O50ObTh9QfweZOpL1E5euEEx2crxAnchU0kpbLXk0TVkooc3vULSdQdBz54c1O1WdSf2vD/oFvb2ehtMz47hRi+J7e38W9OsZvgB92l36gxJYZPTaiVBxubKt4OcaOAbVHLVf1206+LtTBI1vAnYD//sHyurMbFkatZisbBMKf6AbE7SzPyeTLn8HCjkU2Tu2tWGdEMaK81mUiSab5KGEFvK1ukPIi8V0b3oL3DczYzmSlr41hO2Hu3aGjkaDosZ+V1EfpyzguyT43+zU9yt0PmrqnG+esPxKZENrh4NVvSQfjsKZDekkVlmPbCubcmxnVqzOp3ufuMqBoeD7MPjMnZ8fzrqB1qcmAzV39MkwSvnpvPv9ZdxFaPtsiPFWR+7tzQ6DeCQeKEwlfEmJs1x62JrUYO4KSVNTZZbo5A2HvNnRPRO/sYIy0qaP6O4vjEPd5cevRcXv1kv/eSoyBiN/x6M590MiY+VnvHjhmRPma1v7iFy6Vky7PSDqUXeDx876J1MDVIAnfM74kerimdUfvMFOZSUOTo0q76hLxeS7LM5FzeP1qdYfVYjHYxpbk/Ln0fOnhw+6dh1+TPJeQ3O7ya0Pt0+s2IPfonjIk24gOQX86WlcULC/zlX4wHtgTy9AxLQvLo/53rvh2SSyZODKEffk8BH57Dpm3UTg9cebTzc87sRKY37F7WNfwap0M9FjlQD2GhqJOASK/OcVT3SETReMg0wImd2m7yOaPulNhdWRDNIeE65LZN1GsQlTudg5rR5bva0jiQmGWlOdSs3fwKk4jYTJ502gbumA6R1TKr1Rarwn2bD+0VolmQa2mBor6jB+zSnJFW1PkPot8GwPI208slr+3WtsEdL+7k2IxlHa2z4H5FUO1crGybQ5rGZvqlKyklDI+OItBJJo9udkR7HKwfgA3Jy10nSke6G0UjYRFBOusMD4rpsIoxyaE41k3GaIzei2CWCyUiCFH3Zrt66AVwZ4+D0kio+fXrDI8mWdPZJLjkH9VJoVyM5sXOSUZ9c3ehWenRVflHnqcBAwvLh9NJB2LqxkzoYqhW447SS8RFevGsCLCKtVdJCkYw0dquiPBzkdh7FE4ClYDlpJjYYjd83++XN0j6NiqriSyKc78H+I8mulWP6p82+SaX9Uqc8a4y+T698syK+FkL/cnv+Q3KN4+/T47+Nb4T2NTaT7zNUsk7b+9jUOsuXDNHVvZZtEKQdxhrjizLDrmmVoyH87ix6ggyLtap40qq+1BBV1qhNjltu4beqEsWo0hBjZTss5Q0ylymP41bBuNoQtfD68k300TXD3oW9RGIEhmDYesAQDNsPGIJh+wFDMHwTUeC44XKz2fjDw3xaOdXXuKHNTOgdyjY6ZNtsr06eR/Y3XX+LzyAkG5t5qWV9w152TIzyc4/l7JnBqFm2kclsdGVaKV54LOXAFcuI6xv2UXZEVP9CqJJFB2llG1nZsbFSdbSRVtQ774isi453GtZPw2caRutSv5Pj/kJeFcnQrvSLd8bF5W4CGSryFb84jMLiU2EMvfG1BEwCcXI7imLoWfUESSiBmIYLJNUEY/6CtyCGq7opSI8wFtDwUEhB2pU5dWiKFSxfFIUwHOQFMVqo/a+u3vGO092s6Cic4YJXwNjn1g38bXJngFtaK4KhzQug38IN0YHEnQOuAyyAoc6n4MXllpHJKwZCGfLVTKFFP9E1WEXMXLgVwJBPnbLV63xtZGTLQ9pv6LBRx+WXs4fsmWAi2H7DGRtzo3zpjs4cA8vZUuXWG0ZsEhZHDgwhjuWQjFfuKOu5td5wwiQhLp0GoQxkjPBaHeXaktYbsoOm0mrmxHZ+aQFh2w09rhG4Z5ls2w2nTKh4VjtUhrYb/scWw7tuHnmlIb7DUGGLYVA7VIZXGkpa9HWRo4bLDNlhhXzXQt2XGkqlK7OYrMgZ6szOEr5H8MWGNeANu2xFs/hEwz/WsM5CWeEMucbivntWWm74jzUs3jcW7CYl7NIYttxwzhoWF3uq8fNB6CMJ8v/kdKAstqFbevBsFCKSYTGXfoBhjzX0P9GQDfTCDEb7DEu6NOyFQd6QnV/Cq9YbYnNaQmm/9MgGWuy4t83wjtETPwD+RMOOyYQqF4b4n2C4rhwffoIhO8+LC89rOEgmgyGkIdfkX7nTMWBjKIwhW5lKuPpmZjENuarmyipCQQ19tiBWZ1NBDdloX1kxKKghd/mw+o5OUQ2XXMc2+EBDdqqGUFGdimrY4Va05RY8cahs/0ckwx6XiKV3pnv7y9dSBTDsaFzvE68vXul2cktqhDLs8yURZ89nzDbJr1182LD+01qeseortzIRoTW32NmzzcLStocNF7MqNOZS+jMMo3z8sayp/aOn614UTFb08dh5HjWUmHsvLoCebMiNMM4RiK9YxRPCBb1nGFbzdMNOWD/w01Hwg7P6Lze8aZEwJyiMYWd1Qypi9tFxwhh28stky/34J0WLY9g5XL1l5uRn8ffNCGTYmRrXo8A+FVs8w/h6YVW4uOgnmmGnuyQtYEmgGI0vLV2sbziqbuVZZMbwm9mt4g7LrLdwZT2Cd9CKjTy978JUL3cl6xtWP4SPg32Wt7199l2yncFuLXF3ySJjPymdwRH0Tmf9q2+rP8q3oixdJ6hcsiio4Q2AIRi2HzAEw/YDhmDYfsAQDNtPHUOdw8vRLSe/aQn6jVxz4jfuXTOUjBzpqJP+YqlyKHza5LRd+ZSAQX7ov4aQqg0rHtArDlWG+sTO4WTMKb1e+se8zOHUJg4hHybHxJ7Q3woKe+gVhp/Dnc9kF4hLhjj9MoXkxXAYhqHPsqzCv0zo02OEPPwDqgkq/bn0tRMu/atBfj98KZdWfptCczQRLD1m3rBvmDni719OrvKOx2P6V4vSS8ULnvyz4jWL+/oJk/w+QmNfdwcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB8Mv8DC8wFVhMXZiEAAAAASUVORK5CYII=`,
        click_action: "https://lyv.lacty.com.vn",
      },
    },
    token: token_devices,
  };

  admin
    .messaging()
    .send(message)
    .then((response) => {
      // console.log("Successfully sent notification:", response);
      // res.send("Notification sent successfully.");
    })
    .catch((error) => {
      console.error("Error sending notification:", error);
      // res.status(500).send("Error sending notification.");
    });
}

function sendMessing2(lang, Factory, user, content, token_devices) {
  // console.log({Factory})
  // console.log({user})
  const logo = Logo(Factory);
  const message = {
    notification: {
      title: ChangeLng(lang, "Thông báo", "Notifications", "သတိပေးစာ"),
      body: content,
      // image: `data:image/png;base64,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`,
    },
    webpush: {
      fcmOptions: {
        link: "https://lyv.lacty.com.vn",
      },
      notification: {
        icon: logo,

        // icon: `data:image/png;base64,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`,
        click_action: "https://lyv.lacty.com.vn",
      },
    },
    token: token_devices,
  };

  admin
    .messaging()
    .send(message)
    .then((response) => {
      // console.log("Successfully sent notification:", response);
      // res.send("Notification sent successfully.");
    })
    .catch((error) => {
      console.error("Error sending notification:", error);
      // res.status(500).send("Error sending notification.");
    });
}

exports.getTaskInfo = async (req, res) => {
  const id_user_request = req.body.id_user_request;
  const factory = req.body.factory;
  const userInfo = {
    id_user_request: id_user_request,
    factory: factory,
  };
  const task = await taskModel.getTaskinfouser(userInfo);
  // task.map((item, index)=>{

  // })
  if (task) {
    res.status(200).send(createResponse(0, "Thành công", task));
  } else {
    res.send(
      createResponse(1004, "Không tìm thấy dữ liệu yêu cầu!", {
        task,
      })
    );
  }
};
exports.getHistoryTaskProduct = async (req, res) => {
  const id_user_request = req.body.id_user_request;
  const factory = req.body.factory;

  const userInfo = {
    id_user_request: id_user_request,
    factory: factory,
  };
  const task = await taskModel.getHistoryTaskinfouser(userInfo);
  if (task) {
    res.status(200).send(createResponse(0, "Thành công", task));
  } else {
    res.send(
      createResponse(1004, "Không tìm thấy dữ liệu yêu cầu!", {
        task,
      })
    );
  }
};
exports.deleteTask = async (req, res) => {
  const id_user_request = req.body.user_name;
  const id_machine = req.body.id_machine;
  const factory = req.body.factory;
  const lang = req.body.language;

  const getask0 = {
    id_machine: id_machine,
    id_user_request: id_user_request,
    factory: factory,
  };
  let condition = `1=1 `;
  if (id_user_request) {
    condition += `and id_user_request ='${id_user_request}'`;
  }
  if (id_machine) {
    condition += `and id_machine='${id_machine}'`;
  }
  if (factory) {
    condition += `and factory='${factory}'`;
  }
  if (1 == 1) {
    condition += `and (date_mechanic_cfm_finished is null OR date_cfm_mechanic is null)`;
  }
  const task = await taskModel.getTaskdeletes(condition);
  const userInfo = {
    id_user_request: id_user_request,
    id_machine: id_machine,
    factory: factory,
  };

  if (task) {
    const deletetask = await taskModel.deleteTask(userInfo);
    // console.log(deletetask);
    if (deletetask.rowsAffected > 0) {
      const userreq = {
        username: id_user_request,
        factory: factory,
      };
      const lean_req = await userModel.getUser(userreq);
      if (lean_req) {
        const TurnOff = await taskModelss.TurnOnOffAlarm({
          line: lean_req.line,
          factory: lean_req.factory,
          status: "off",
          seg: 0,
        });
      }
      var io = req.app.get("socketio");
      io.emit(`${id_user_request}`, id_user_request + Math.random());

      if (factory === "LYV" || factory === "LVL" || factory === "LHG") {
        const allMechanic = await taskModel.getAllMechanic({
          id_user_request: id_user_request,
          factory: factory,
          fixer: task.fixer,
        });
        console.log({ allMechanic });

        const promises = allMechanic.map((item) => {
          return new Promise((resolve) => {
            io.emit(`${item.user_name}`, item.user_name + Math.random());
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
        io.emit(
          `${task.id_owner_mechanic}`,
          task.id_owner_mechanic + Math.random()
        );
        io.emit(
          `${task.id_user_mechanic}`,
          task.id_user_mechanic + Math.random()
        );
      }

      // if (task.id_owner_mechanic) {
      //   // io.emit(
      //   //   `${
      //   //     task.id_owner_mechanic
      //   //       ? task.id_owner_mechanic
      //   //       : task.id_user_mechanic
      //   //   }`,
      //   //   task.id_owner_mechanic + Math.random()
      //   // );
      //   io.emit(
      //     `${task.id_owner_mechanic}`,
      //     task.id_owner_mechanic + Math.random()
      //   );
      // }

      res.status(200).send(
        createResponse(
          0,
          ChangeLng(
            lang,
            "Hủy phiếu thành công",
            "Cancel task success",
            "အလုပ်အောင်မြင်မှု ကို ပယ်ဖျက်ပါ"
          )
          // lang == "EN" ? "Cancel task success" : "Hủy phiếu thành công"
        )
      );
    } else {
      res.send(
        createResponse(
          1004,
          ChangeLng(
            lang,
            "Không tìm thấy dữ liệu yêu cầu!",
            "Requested data not found!",
            "တောင်းဆိုထားသောဒေတာကို ရှာမတွေ့ပါ"
          )
          // lang == "EN"? "Requested data not found!": "Không tìm thấy dữ liệu yêu cầu!"
        )
      );
    }
  }
};
exports.getMachine = async (req, res) => {
  const idmachine = req.body.id_machine;
  const factory = req.body.factory;
  let condition = "1=1";
  if (idmachine) {
    condition += `and Asset_No= '${idmachine}'`;
  }
  if (factory) {
    condition += `and Factory ='${factory}'`;
  }
  const machine = await taskModel.getMachi(condition);
  if (machine) {
    res.status(200).send(createResponse(0, "Success!", machine));
  } else {
    res.status(409).send(createResponse(1001, "Data not found", machine));
  }
  // const idmachine = req.body.id_machine;
  // const factory = req.body.factory;
  // let condition = "1=1";
  // if (idmachine) {
  //   condition += `and ID_Code= '${idmachine}'`;
  // }
  // if (factory) {
  //   condition += `and factory ='${factory}'`;
  // }
  // const machine = await taskModel.getMachi(condition);
  // if (machine) {
  //   res.status(200).send(createResponse(0, "Success!", machine));
  // } else {
  //   res.status(409).send(createResponse(1001, "Data not found", machine));
  // }
};
exports.getallMachi = async (req, res) => {
  const factory = req.body.factory;
  let condition = "1=1";

  if (factory) {
    condition += `and factory ='${factory}'`;
  }
  const machine = await taskModel.getAllMachi(condition);
  if (machine) {
    return res.status(200).send(createResponse(0, "Success!", machine));
  } else {
    return res
      .status(409)
      .send(createResponse(1001, "Data not found", machine));
  }
};
exports.callMechanic = async (req, res) => {
  const id_machine = req.body.id_machine;
  const id_user_request = req.body.id_user_request;
  const remark = req.body.remark;
  const factory = req.body.factory;
  const otherReason = req.body.otherIssue;
  const fixer = req.body.fixer;
  const lang = req.body.language;

  const getask0 = {
    id_machine: id_machine,
    id_user_request: id_user_request,
    factory: factory,
    lean: fixer,
  };

  const userInfo = {
    username: id_user_request,
    // floor: floor,
    factory: factory,
  };
  // console.log("body", userInfo);
  const task = await taskModel.getTask(getask0);
  const lean_req = await userModel.getUser(userInfo);
  if (id_machine == "" || id_user_request == "") {
    res.status(409).send(
      createResponse(
        409,
        // lang == "EN" ? "Please do not leave it blank": "Vui lòng không bỏ trống",
        ChangeLng(
          lang,
          "Vui lòng không bỏ trống",
          "Please do not leave it blank",
          "‌ကျေးဇူးပြု၍ ကွက်လပ်မထားပါနှင့်"
        ),
        {
          id_machine: id_machine,
        }
      )
    );
  }
  // 0     thành công
  // 1001  đã tồn tại
  // 1002  có lỗi không xác định
  // 1003  có lỗi sai dữ liệu
  // 1004  lỗi không tìm thấy
  // 1005  lỗi xác thực
  if (task != null) {
    res.status(409).send(
      createResponse(
        1001,
        // lang == "EN" ? "The application form already exists." : "Phiếu đề nghị đã tồn tại.",
        ChangeLng(
          lang,
          "Phiếu đề nghị đã tồn tại.",
          "The application form already exists.",
          "‌လျှောက်လွှာပုံစံက ရှိပြီးသားပါ"
        ),
        {
          id_machine: id_machine,
        }
      )
    );
  } else {
    //Khi không thấy thợ sửa
    const getMechanic = {
      lean_req: lean_req.floor,
      factory: factory,
      fixer: fixer,
      floors: lean_req.floors,
    };
    const checkMechanic = await taskModel.getMechanic(getMechanic);
    // console.log(checkMechanic)
    if (checkMechanic == "") {
      let condition = `1=1 and permission=1 `;
      if (fixer) {
        condition += ` and lean = '${fixer}' `;
      }
      if (factory) {
        condition += ` and factory ='${factory}'`;
      }
      if (lean_req.floor) {
        condition += ` and ','+floor+',' like '%,${lean_req.floor},%'`;
      }
      const owner = await taskModelss.getOwners(condition);
      // console.log(owner)
      await owner;
      if (owner.length > 0) {
        const newTask = {
          id_machine: id_machine,
          id_user_request: id_user_request,
          factory: factory,
          remark: remark,
          otherReason: otherReason,
          id_owner_mechanic: owner[0].user_name,
          fixer: fixer,
        };

        // console.log(newTask)
        const createTaskOwer = await taskModel.createTaskOwner(newTask);
        if (!createTaskOwer) {
          return res.status(400).send(
            ChangeLng(
              lang,
              "Có lỗi trong quá trình tạo task, vui lòng thử lại.",
              "There was an error while creating the task, please try again.",
              "လုပ်ဆောင်စရာကို ဖန်တီးနေစ၌ အမှားအယွင်းတစ်ခုရှိခဲ့သည် ၊ကျေးဇူးပြု၍ ထပ်စမ်းကြည့်ပါ."
            )
            // lang == "EN" ? "There was an error while creating the task, please try again." : "Có lỗi trong quá trình tạo task, vui lòng thử lại."
          );
        } else {
          var io = req.app.get("socketio");
          io.emit(`${id_user_request}`, "req" + Math.random());
          if (factory === "LVL" || factory === "LHG" || factory==="LYV") {
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

            let content = ChangeLng(
              lang,
              "Thợ sửa không phản hồi!",
              "The repairman did not respond!",
              "ပြုပြင်ရေးသမားက အကြောင်းမပြန်ဘူး"
            );
            // let content = lang == "EN"
            //   ? "The repairman did not respond!"
            //   : "Thợ sửa không phản hồi!";
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
          const getask0 = {
            id_machine: id_machine,
            id_user_request: id_user_request,
            factory: factory,
            lean: fixer,
          };
          let content = ChangeLng(
            lang,
            "Bạn đã hoàn tất đơn đề nghị thông báo máy hư! Task đã được gửi đến cán bộ thợ sửa",
            "You have completed the request for notification of machine failure! The task has been sent to the repairman",
            "စက်ချို့ယွင်းမှု အကြောင်းကြားရန် တောင်းဆိုချက်ကို သင် ပြီးမြောက်ပြီးပါပြီ/တာဝန်ကို တုံ့ပြန်ရေးမှူးထံ ပေးပို့ပြိးဖြစ်သည်"
          );

          return res.send(createResponse(0, content, getask0));
        }
      } else {
        let content = ChangeLng(
          lang,
          `Không tìm thấy ${
            fixer == "TM" ? "Thợ máy" : "Thợ điện"
          } ở đơn vị của bạn!`,
          `Requested ${fixer == "TM" ? "Mechanic" : "Electric"} not found!`,
          '${fixer == "TM" ? "စက်ပြင်" : "လျှပ်စစ်ပညာရှင်"} ရှာမတွေ့ပါ!'
        );
        res.send(
          createResponse(
            1004,
            // lang == "EN"
            //   ? `Requested ${
            //       fixer == "TM" ? "Mechanic" : "Electric"
            //     } not found!`
            //   : `Không tìm thấy ${
            //       fixer == "TM" ? "Thợ máy" : "Thợ điện"
            //     } ở đơn vị của bạn!`,
            content,
            {
              task,
            }
          )
        );
      }
    } else {
      const newTask = {
        id_machine: id_machine,
        id_user_request: id_user_request,
        factory: factory,
        remark: remark,
        otherReason:otherReason,
        id_mechanic: checkMechanic[0].user_name,
        fixer: fixer,
      };
      console.log(newTask)
      const createTask = await taskModel.createTask(newTask);
      // id_user_request ==='CBSX' && TurnOnOffAlarm('http://192.168.132.241','on');

      if (!createTask) {
        let content = ChangeLng(
          lang,
          "Có lỗi trong quá trình tạo task, vui lòng thử lại.",
          "There was an error while creating the task, please try again.",
          "လုပ်ဆောင်စရာကို ဖန်တီးနေစ၌ အမှားအယွင်းတစ်ခုရှိခဲ့သည် ၊ကျေးဇူးပြု၍ ထပ်စမ်းကြည့်ပါ."
        );
        return res.status(400).send(
          content
          // lang == "EN"
          //   ? "There was an error while creating the task, please try again."
          //   : "Có lỗi trong quá trình tạo task, vui lòng thử lại."
        );
      }
      const TurnOn = await taskModelss.TurnOnOffAlarm({
        line: lean_req.line,
        factory: lean_req.factory,
        status: "on",
        seg: 0,
      });
      if (checkMechanic[0].user_name) {
        let content = ChangeLng(
          lang,
          "Gửi yêu cầu sửa máy! bấm vào để xem chi tiết!",
          "Submit a repair request! Click to see details!",
          "ပြုပြင်ရန် တောင်းဆိုချက်ကို တင်သွင်းပါ အသေးစိတ်ကြည့်ရန် နှိပ်ပါ!"
        );
        // lang == "EN"
        //   ? "Submit a repair request! Click to see details!"
        //   : "Gửi yêu cầu sửa máy! bấm vào để xem chi tiết!";

        var io = req.app.get("socketio");
        if (factory === "LYV" || factory === "LVL" || factory === "LHG") {
          //  console.log('test nè')

          // let condition = `1=1`;
          // if (fixer) {
          //   condition += ` and lean = '${fixer}' `;
          // }
          // if (factory) {
          //   condition += ` and factory ='${factory}'`;
          // }
        
          // condition += ` and permission = 1 `;
          // if (checkMechanic[0].floor) {
          //   condition += `and ','+floor+',' like '%,${checkMechanic[0].floor.trim()},%'`;
          // }
          // if (factory === "LYM") {
          //   const owner = await taskModelss.getOwner(condition);
          //   io.emit(`${owner.user_name}`, owner.user_name + Math.random());
          //   if (owner.token_devices) {
          //     sendMessing2(lang,factory,owner.user_name,content,owner.token_devices);
          //   }
          // }
          const promises = checkMechanic.map((item) => {
            return new Promise((resolve) => {
              io.emit(`${item.user_name}`, item.user_name + Math.random());
              if (item.token_devices) {
                sendMessing2(lang,factory,item.user_name,content,item.token_devices);
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
          io.emit(`${checkMechanic[0].user_name}`,checkMechanic[0].user_name + Math.random());
          if (checkMechanic[0].token_devices) {
            sendMessing2(lang,factory,lean_req.user_name,content,checkMechanic[0].token_devices);
          }
        }
        io.emit(`${id_user_request}`, id_user_request + Math.random());
        const getask0 = {
          id_machine: id_machine,
          id_user_request: id_user_request,
          factory: factory,
          lean: fixer,
        };
        // if (factory === "LYM" || factory === "LHG") {
          const task = await taskModel.getTask(getask0);

          const lean_reqs = lean_req.floor;
          const maxposition = await taskModel.getMaxposition(fixer);
          // console.log(maxposition);
          var current = new Date().getTime();
          var convert1 = new Date(current);
          var ten_minutes_from_now = new Date().getTime() + 360000;
          var convert = new Date(ten_minutes_from_now);
          // console.log(convert.getMinutes() + " " + convert.getSeconds());
          let i = 0;
          const job = schedule.scheduleJob(`${convert}`, async function () {
            console.log(
              `Đây là thông báo thợ máy không phản hồi user ${id_user_request} ! ${id_machine}`
            );

            if (factory !== "LYM") {
              const promises = checkMechanic.map((item) => {
                return checkMechaniHuii(
                  lean_req,
                  factory,
                  id_machine,
                  id_user_request,
                  remark,
                  fixer,
                  item.user_name,
                  maxposition,
                  io,
                  lang
                );
              });

              Promise.all(promises)
                .then(() => {
                  console.log("All events have been emitted");
                })
                .catch((error) => {
                  console.error("Error emitting events:", error);
                });
            } else {
              await checkMechaniHuii(
                lean_req,
                factory,
                id_machine,
                id_user_request,
                remark,
                fixer,
                checkMechanic[0].user_name,
                maxposition,
                io,
                lang
              );
            }
            // await checkMechani(lean_req,factory,id_machine,id_user_request,remark,fixer,checkMechanic[0].user_name, maxposition,io);
          });
        // }

        return res.send(
          createResponse(
            0,
            // lang == "EN"
            //   ? "You have completed the request for notification of machine failure!"
            //   : "Bạn đã hoàn tất đơn đề nghị thông báo máy hư!",
            ChangeLng(
              lang,
              "Bạn đã hoàn tất đơn đề nghị thông báo máy hư!",
              "You have completed the request for notification of machine failure!",
              "စက်ချို့ယွင်းမှု အကြောင်းကြားချက်အတွက် တောင်းဆိုချက်ကို သင်ပြီးမြောက်ခဲ့ပြီ!"
            ),
            getask0
          )
        );
      }
    }
  }
};

checkMechani = async (
  lean_req,
  factory,
  idmachine,
  id_user_request,
  remark,
  fixer,
  id_user_mechanic,
  count,
  io
) => {
  // console.log("lean", lean_req);

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
    // if (count1) {
    //   condition += ` and position = ${count1}`;
    //   }
    condition += ` and permission = 1`;
    if (lean_req.floor && lean_req.floor.length >= 2 && fixer == "TD") {
      condition += ` and ','+floor+',' like '%,${lean_req.floor},%'`;
    } else {
      condition += ` and ','+floor+',' like '%,${lean_req.floor},%'`;
    }
    // console.log(condition);
    const owner = await taskModelss.getOwner(condition);
    await owner;
    const getask0 = {
      id_machine: idmachine,
      id_user_request: id_user_request,
      factory: factory,
      lean: fixer,
    };
    const task = await taskModel.getTask(getask0);
    if (task != null) {
      if (owner != null) {
        const ownerAsignTask = {
          usermechanic: owner.user_name,
          id_user_owner: owner.user_name,
          idmachine: idmachine,
          factory: factory,
          fixer: fixer,
        };
        const assignTask = await taskModelss.ownerAssignTask(ownerAsignTask);
        // console.log("assign", assignTask);

        const checkreject = await taskModelss.getCheckReject(task.id);
        if (checkreject.total == 0) {
          const infoReject = {
            id_task_detail: task.id,
            id_machine: idmachine,
            id_user_mechanic: id_user_mechanic,
          };

          io.emit(`${id_user_mechanic}`, "req" + Math.random());
          io.emit(`${owner.user_name}`, "req" + Math.random());
          // create reject 1
          const createreject = await taskModelss.getCreateReject(infoReject);
          // console.log("create", createreject);
        }
      }
    } else {
      return clearInterval(interval);
    }
    count1--;
  }
};
checkMechaniHuii = async (
  lean_req,
  factory,
  idmachine,
  id_user_request,
  remark,
  fixer,
  id_user_mechanic,
  count,
  io,
  lang
) => {
  await task();

  async function task() {
    let condition = `1=1 and permission=1 `;
    if (fixer) {
      condition += ` and lean = '${fixer}' `;
    }
    if (factory) {
      condition += ` and factory ='${factory}'`;
    }
    if (lean_req.floor && lean_req.floor.length >= 2 && fixer == "TD") {
      condition += ` and ','+floor+',' like '%,${lean_req.floor},%'`;
    } else {
      condition += ` and ','+floor+',' like '%,${lean_req.floor},%' `;
    }
    const owner = await taskModelss.getOwners(condition);
    await owner;
    const getask0 = {
      id_machine: idmachine,
      id_user_request: id_user_request,
      factory: factory,
      lean: fixer,
    };
    const updateTask = {
      usermechanic: id_user_mechanic,
      cfm_status: 1,
      idmachine: idmachine,
      factory: factory,
      fixer: fixer,
      owner: owner[0].user_name,
    };
    const declineTask = await taskModelss.cfmDeclineTask(updateTask);
    const task = await taskModel.getTask(getask0);
    //  console.log('check', id_user_mechanic , task.id_user_mechanic )
    if (task != null && task.status == 1) {
      if (owner != null) {
        io.emit(`${id_user_mechanic}`, "req" + Math.random());

        if (factory === "LVL" || factory === "LHG" || factory === "LYV") {
          const promises = owner.map((item) => {
            return new Promise((resolve) => {
              io.emit(`${item.user_name}`, "req" + Math.random());
              let content = ChangeLng(
                lang,
                "The repairman did not respond!",
                "Thợ sửa không phản hồi!",
                "ပြုပြင်ရေးသမားက အကြောင်းမပြန်ဘူး"
              );
              // lang == "EN"
              //   ? "The repairman did not respond!"
              //   : "Thợ sửa không phản hồi!";
              if (item.token_devices) {
                sendMessing(
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
          let content = ChangeLng(
            lang,
            "The repairman did not respond!",
            "Thợ sửa không phản hồi!",
            "ပြုပြင်ရေးသမားက အကြောင်းမပြန်ဘူး"
          );
          // let content =
          //   lang == "EN"
          //     ? "The repairman did not respond!"
          //     : "Thợ sửa không phản hồi!";
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

exports.getInforReason = async (req, res) => {
  const list = await taskModel.getReasonInfo();
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

// const OnOffNotify = (link, status) => {
//   link &&
//     status &&
//     axios
//       .get(link + "/action/" + status)
//       .then((response) => {
//         console.log(link + "/action/" + status);
//       })
//       .catch((error) => {
//         console.error(error);
//       });
// };
