const { createResponse } = require("../../variables/createResponse");
const userModel = require("../users/users.models");
// const bcrypt = require("bcrypt")
const jwtVariable = require("jsonwebtoken");
const authMethod = require("./auth.methods");
const randToken = require("rand-token");
const { ChangeLng } = require("../../variables/langTransform");

// 0     thành công
// 1001  đã tồn tại
// 1002  có lỗi không xác định
// 1003  có lỗi sai dữ liệu
// 1004  lỗi không tìm thấy

exports.register = async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const factory = req.body.factory;
  const permission = req.body.permission;
  const phonenumber = req.body.phone_number;
  const lean = req.body.lean;
  const floor = req.body.floor;
  const floors = req.body.floors;
  const name = req.body.name;
  const position = req.body.position;
  const userInfo = {
    username: username,
    factory: factory,
  };
  // console.log("TEST", userInfo);

  const user = await userModel.getUser(userInfo);
  console.log(user);

  if (user !== null || user?.length > 0)
    res.status(409).send(
      createResponse(1001, "Tên tài khoản đã tồn tại.", {
        username: username,
      })
    );
  else {
    // const hashPassword = bcrypt.hashSync(req.body.password, 10);
    const newUser = {
      username: username,
      password: password,
      factory: factory,
      permission: permission,
      phonenumber: phonenumber,
      lean: lean,
      floor: floor,
      floors: floors,
      name: name,
      position: position,
    };
    const createUser = await userModel.createUser(newUser);
    console.log(createUser);
    if (!createUser) {
      return res.status(400).send(
        createResponse(
          1002,
          "Có lỗi trong quá trình tạo tài khoản, vui lòng thử lại.",
          {
            username: username,
          }
        )
      );
    }
    return res.send(
      createResponse(0, "Đăng ký thành công!", {
        username: username,
      })
    );
  }
};
// {
//   recordsets: [],
//   recordset: undefined,
//   output: {},
//   rowsAffected: [ 1 ]
// }

exports.login = async (req, res) => {
  const username = req.body.username.trim().toUpperCase();
  const password = req.body.password.trim().toUpperCase();
  const token_devices = req.body.token;
  const factory = req.body.factory;
  const lang = req.body.language;
  // console.log(username,password)
  const updateTokendevices = {
    username: username,
    token_devices: token_devices,
    factory: factory,
  };
  // console.log("check token", token_devices);
  const userInfo = {
    username: username,
    factory: factory,
  };
  const user = await userModel.getUser(userInfo);
  const upTokendevices = await userModel.updateTokendevices(updateTokendevices);

  if (
    user === null ||
    user?.user_name.toUpperCase() !== username.toUpperCase() ||
    user?.password.toUpperCase() !== password.toUpperCase()
  ) {
    return res.status(401).send(
      createResponse(
        1003,
        ChangeLng(
          lang,
          "Tên đăng nhập hoặc mật khẩu không chính xác!",
          "Username or password incorrect!",
          "အသုံးပြုသူအမည် သို့မဟုတ် စကားဝှက် မမှန်ပါ"
        ),
        // lang == "EN"
        //   ? "Username or password incorrect!"
        //   : "Tên đăng nhập hoặc mật khẩu không chính xác!",
        {
          username: username,
          password: password.toUpperCase(),
        }
      )
    );
  }
  if (upTokendevices == 0) {
    return res.status(401).send(
      createResponse(
        1003,
        ChangeLng(
          lang,
          "Vui lòng kiểm tra lại quyền cho phép truy cập thông báo của thiết bị!",
          "Please check your device's notification permissions!",
          "‌ကျေးဇူးပြု၍ သင့်စက်၏ အသိပေးချက်ခွင့်ပြုချက်များကို စစ်ဆေးပါ"
        ),

        // lang == "EN"
        //   ? "Please check your device's notification permissions!"
        //   : "Vui lòng kiểm tra lại quyền cho phép truy cập thông báo của thiết bị!",
        {
          username: username,
          password: password.toUpperCase(),
        }
      )
    );
  }
  const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

  const dataForAccessToken = {
    username: user.user_name,
  };
  const accessToken = await authMethod.generateToken(
    dataForAccessToken,
    accessTokenSecret,
    accessTokenLife
  );
  if (!accessToken) {
    return res.status(401).send(
      createResponse(
        1002,
        ChangeLng(
          lang,
          "Có lỗi trong quá trình tạo tài khoản, hãy thử lại!.",
          "There was an error creating the account, please try again!",
          "အကောင်ကို ဖန်တီးရာတွင် အမှားအယွင်းရှိ၍၊ ထပ်စမ်းကြည့်ပါ"
        ),
        // lang == "EN"
        //   ? "There was an error creating the account, please try again!"
        //   : "Có lỗi trong quá trình tạo tài khoản, hãy thử lại!.",
        {}
      )
    );
  }

  let refreshToken = randToken.generate(64); // tạo 1 refresh token ngẫu nhiên
  if (user.refreshToken == null) {
    // Nếu user này chưa có refresh token thì lưu refresh token đó vào database
    await userModel.updateRefreshToken(user.user_name, refreshToken);
  } else {
    // Nếu user này đã có refresh token thì lấy refresh token đó từ database
    refreshToken = user.refreshToken;
  }

  return res.cookie("token", accessToken).send(
    createResponse(
      0,
      ChangeLng(
        lang,
        "Đăng nhập thành công!",
        "Login success!",
        "အကောင့််ဝင်ခြင်း အောင်မြင်သည်"
      ),
      // lang == "EN" ? "Login success!" : "Đăng nhập thành công!",
      {
        // msg: "Đăng nhập thành công.",
        accessToken,
        // refreshToken,
        user,
      }
    )
  );
};

exports.refreshToken = async (req, res) => {
  // Lấy access token từ header
  const accessTokenFromHeader = req.headers.authorization;
  if (!accessTokenFromHeader) {
    return res.status(400).send(
      createResponse(
        1004,
        ChangeLng(
          lang,
          "Không tìm thấy access token!",
          "Access token not found!",
          "အသုံးပြုခွင့် တိုကင်ကို ရှာမတွေ့ပါ"
        ),
        // lang == "EN"
        //   ? "Access token not found!"
        //   : "Không tìm thấy access token!",
        {}
      )
    );
  }

  // Lấy refresh token từ body
  const refreshTokenFromBody = req.body.refreshToken;
  if (!refreshTokenFromBody) {
    return res.status(400).send(
      createResponse(
        1004,
        ChangeLng(
          lang,
          "Không tìm thấy refresh token!",
          "Refresh token not found!",
          "တိုကင် ကအသစ်ရှာ မတွေ့ပါ"
        ),
        // lang == "EN"
        //   ? "Refresh token not found!"
        //   : "Không tìm thấy refresh token!",
        {}
      )
    );
  }

  const accessTokenSecret =
    process.env.ACCESS_TOKEN_SECRET || jwtVariable.accessTokenSecret;
  const accessTokenLife =
    process.env.ACCESS_TOKEN_LIFE || jwtVariable.accessTokenLife;

  // Decode access token đó
  const decoded = await authMethod.decodeToken(
    accessTokenFromHeader,
    accessTokenSecret
  );

  if (!decoded) {
    return res.status(400).send(
      createResponse(
        1003,
        ChangeLng(
          lang,
          "Access token không hợp lệ",
          "Access token is invalid.!",
          "အသုံးပြုခွင့် တိုကင်သည် မမှန်ကန်ပါ"
        ),
        // lang == "EN"
        // ? "Access token is invalid.!"
        // : "Access token không hợp lệ.",
        {}
      )
    );
  }

  const username = decoded.payload.username; // Lấy username từ payload
  const user = await userModel.getUser(username);
  // console.log(user);
  if (!user) {
    return res
      .status(401)
      .send(
        createResponse(
          1003,
          ChangeLng(
            lang,
            "User không tồn tại",
            "User does not exist",
            "အသုံးပြုသူမရှိပါ"
          ),
          // lang == "EN" ? "User does not exist." : "User không tồn tại.",
          {}
        )
      );
  }

  if (refreshTokenFromBody !== user.refresh_token) {
    return res
      .status(400)
      .send(
        createResponse(
          1003,
          ChangeLng(
            lang,
            "Refresh token không hợp lệ",
            "Refresh token is invalid",
            "တိုကင်အသစ်  မမှန်ကန်ပါ"
          ),
          // lang == "EN"
          //   ? "Refresh token is invalid.!"
          //   : "Refresh token không hợp lệ.",
          {}
        )
      );
  }

  // Tạo access token mới
  const dataForAccessToken = {
    username,
  };

  const accessToken = await authMethod.generateToken(
    dataForAccessToken,
    accessTokenSecret,
    accessTokenLife
  );
  if (!accessToken) {
    return res
      .status(400)
      .send(
        createResponse(
          1002,
          ChangeLng(
            lang,
            "Tạo access token không thành công, vui lòng thử lại.",
            "Creating access token failed, please try again.",
            "အသုံးပြုခွင့် တိုကင်ဖန်တီးခြင်း မအောင်မြင်ပါ၊ ကျေးဇူးပြု၍ ထပ်စမ်းကြည့်ပါ"
          ),
          // lang == "EN"
          //   ? "Creating access token failed, please try again."
          //   : "Tạo access token không thành công, vui lòng thử lại.",
          {}
        )
      );
  }
  return res.json({
    accessToken,
  });
};
