const userModel = require("./users.models");
const { createResponse } = require("../../variables/createResponse");
// const gTTS = require('gtts');
// const path = require("path");
// const fs = require('fs');
exports.profile = async (req, res) => {
  res.send(req.user);
};
exports.getFac = async (req, res) => {
  const factory_name = await userModel.getFactory();
  // console.log(factory_name);
  if (factory_name) {
    return res.status(200).send(createResponse(0, "Thành công", factory_name));
  } else {
    res.send(
      createResponse(1004, "Không tim thấy dữ liệu yêu cầu!", {
        list,
      })
    );
  }
};
exports.getAllLean = async (req, res) => {
  const floor = req.body.floor;
  const factory = req.body.factory;
  const lean = await userModel.AllLean({ factory: factory, floor: floor });
  // console.log(factory_name);
  if (lean) {
    return res.status(200).send(createResponse(0, "Thành công", lean));
  } else {
    res.send(
      createResponse(1004, "Không tim thấy dữ liệu yêu cầu!", {
        lean,
      })
    );
  }
};
exports.getAllFloor = async (req, res) => {
  const factory = req.body.factory;
  const floor = await userModel.AllFloor({ factory: factory });
  // console.log(factory_name);
  if (floor) {
    return res.status(200).send(createResponse(0, "Thành công", floor));
  } else {
    res.send(
      createResponse(1004, "Không tim thấy dữ liệu yêu cầu!", {
        floor,
      })
    );
  }
};
// exports.sendNofity = async (req, res) => {
//   const text = req.query.text;
//     if (!text) {
//       return res.status(400).send('Text parameter is required');
//     }

//     const gtts = new gTTS(text, 'vi'); // 'vi' là mã ngôn ngữ cho tiếng Việt
//     const filePath = path.join(__dirname, 'output.mp3');

//     gtts.save(filePath, (err, result) => {
//       if (err) {
//         return res.status(500).send('Error generating speech');
//       }
//       res.sendFile(filePath, (err) => {
//         if (err) {
//           res.status(500).send('Error sending file');
//         }

//       });
//     });
// };

exports.updateUser = async (req, res) => {
  const username = req.body.username;
  const factory = req.body.factory;
  const floor = await userModel.getUser({
    username: username,
    factory: factory,
  });
  if (floor) {
    return res.status(200).send(createResponse(0, "Thành công", floor));
  } else {
    res.send(
      createResponse(1004, "Không tim thấy dữ liệu yêu cầu!", {
        floor,
      })
    );
  }
};
