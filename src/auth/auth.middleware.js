const { createResponse } = require("../../variables/createResponse");
const userModel = require("../users/users.models");
const authMethod = require("./auth.methods");

// 0     thành công
// 1001  đã tồn tại
// 1002  có lỗi không xác định
// 1003  có lỗi sai dữ liệu
// 1004  lỗi không tìm thấy
// 1005  lỗi xác thực

exports.isAuth = async (req, res, next) => {
  // Lấy access token từ header
  //   console.log(req.headers);
  const accessTokenFromHeader = req.headers.authorization;
  if (!accessTokenFromHeader) {
    return res.status(401).send(
      createResponse(1005, "Vui lòng đăng nhập để sử dụng chức năng này!", {
        error: "Không tìm thấy authorization",
      })
    );
  }

  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

  const verified = await authMethod.verifyToken(
    accessTokenFromHeader,
    accessTokenSecret
  );
  if (!verified) {
    return res
      .status(401)
      .send(
        createResponse(1005, "Bạn không có quyền truy cập vào tính năng này!")
      );
  }

  const user = await userModel.getUser(verified.payload.username);
  // console.log("payload", verified.payload);
  req.user = user;

  return next();
};
