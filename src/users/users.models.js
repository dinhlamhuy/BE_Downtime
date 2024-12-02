const db = require("../../connection");
exports.getUser = async ({ username, factory }) => {
  try {
    // console.log("name", username);
    // console.log(
    //   `SELECT * FROM DT_user_manager WHERE RTRIM(user_name) = '${username}' and factory = '${factory}'`
    // );
    if (
      username != "undefined" &&
      factory != "undefined" &&
      username &&
      factory
    ) {
      const rs = await db.Execute(
        `SELECT * FROM DT_user_manager WHERE RTRIM(user_name) = '${username}' and factory = '${factory}'`
      );
      return rs.recordset[0] || null;
    }
  } catch (error) {
    return null;
  }
};
// {
//   recordsets: [],
//   recordset: undefined,
//   output: {},
//   rowsAffected: [ 1 ]
// }
exports.getFactory = async () => {
  try {
    const rs = await db.Execute(`SELECT * from DT_info_factory`);

    return rs.recordset;
  } catch (e) {
    return null;
  }
};
exports.updateTokendevices = async ({ username, token_devices, factory }) => {
  try {
    const rs = await db.Execute(
      `UPDATE DT_user_manager SET token_devices = '${token_devices}' WHERE user_name = '${username}' and factory='${factory}'`
    );
    return rs.rowsAffected;
  } catch (e) {
    return null;
  }
};
exports.createUser = async ({
  username,
  password,
  factory,
  permission,
  phonenumber,
  lean,
  floor,
  floors,
  name,
  position,
}) => {
  try {
    return await db.Execute(
      `INSERT INTO DT_user_manager (user_name,password,factory,permission,create_at,floor,floors,phone_number,name,lean,position)  VALUES('${username}','${password}' ,'${factory}',${permission},GETDATE(),'${floor}','${floors}','${phonenumber}',N'${name}','${lean}','${position}')`
    );
  } catch (error) {
    return null;
  }
};

exports.updateRefreshToken = async (username, refreshToken) => {
  try {
    const rs = await db.Execute(
      `UPDATE DT_user_manager SET refresh_token='${refreshToken}' WHERE user_name = '${username}'`
    );
    console.log(username);
    return rs;
  } catch (error) {
    return null;
  }
};

exports.UserSameFloor = async ({ factory, floor, floors, fixer }) => {
  try {
    // if (
    //   floor != "undefined" &&
    //   floors != "undefined" &&
    //   floor &&
    //   floors
    // ) {
    const rs = await db.Execute(
      `SELECT * FROM DT_user_manager WHERE RTRIM(user_name) = '${username}' and factory = '${factory}'
        AND  ',${floor},'  LIKE '%,'+floor +',%' AND  ',${floors},'  LIKE '%,'+floors +',%'  and lean = '${fixer}'
        `
    );

    return rs.recordset || null;
    // }
  } catch (error) {
    return null;
  }
};

exports.AllLean = async ({ factory, floor }) => {
  try {
    const rs = await db.Execute(
      `SELECT * FROM [DT_floor_lean] WHERE factory = '${factory}' AND  ',${floor},'  LIKE '%,'+floor +',%' 
        `
    );

    return rs.recordset || null;
  } catch (error) {
    return null;
  }
};
exports.AllFloor = async ({ factory }) => {
  try {
    const rs = await db.Execute(
      `SELECT * FROM [DT_floor] WHERE factory = '${factory}'
        `
    );

    return rs.recordset || null;
  } catch (error) {
    return null;
  }
};

exports.updateUser = async ({ user_name, factory }) => {
  try {
    if (user_name && factory) {
      const rs = await db.Execute(
        `SELECT [id],[user_name],[name],[phone_number],[floor],[floors],[position],[line]  FROM DT_user_manager WHERE user_name = '${user_name}' and factory='${factory}'`
      );

      return rs.recordset[0] || null;
    }
    return null;
  } catch (e) {
    return null;
  }
};
