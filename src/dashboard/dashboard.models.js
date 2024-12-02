const { compare } = require("bcrypt");
const db = require("../../connection");
const { search } = require("../task/task.route");
// const db = require("msdb");
exports.getAnalyz = async ({ condition, datestart, dateend }) => {
  try {
    // console.log(new Date("2023-11-06"));
    let date_start = datestart.split("-");
    let date_end = dateend.split("-");
    if (
      Number(date_start[0]) !== Number(date_end[0]) ||
      Number(date_start[1]) !== Number(date_end[1]) ||
      Number(date_start[2]) !== Number(date_end[2])
    ) {
      const rs = await db.Execute(
        `
      select convert(decimal(4,2),avg(ROUND(datediff(second,date_mechanic_cfm_onsite,date_mechanic_cfm_finished)/60.0,2))) as minuteavg,floor,date_user_request from (
      select convert(date,date_user_request)date_user_request,date_mechanic_cfm_onsite,date_mechanic_cfm_finished,floor from DT_task_detail t
      left join DT_user_manager u on u.user_name = t.id_user_mechanic
      WHERE ${condition}
      )temp
       group by floor,date_user_request`
      );
      console.log(`
select convert(decimal(4,2),avg(ROUND(datediff(second,date_mechanic_cfm_onsite,date_mechanic_cfm_finished)/60.0,2))) as minuteavg,floor,date_user_request from (
select convert(date,date_user_request)date_user_request,date_mechanic_cfm_onsite,date_mechanic_cfm_finished,floor from DT_task_detail t
left join DT_user_manager u on u.user_name = t.id_user_mechanic
WHERE ${condition}
)temp
 group by floor,date_user_request`);
      return rs.recordset || null;
    }
    if (
      Number(date_start[0]) === Number(date_end[0]) &&
      Number(date_start[1]) === Number(date_end[1]) &&
      Number(date_start[2]) === Number(date_end[2])
    ) {
      console.log(`select   convert(decimal(4,2),avg(ROUND(datediff(second,date_mechanic_cfm_onsite,date_mechanic_cfm_finished)/60.0,2))) as minuteavg,floor,date_user_request from (
        select date_user_request,date_mechanic_cfm_onsite,date_mechanic_cfm_finished,floor from DT_task_detail t
        left join DT_user_manager u on u.user_name = t.id_user_mechanic
        WHERE ${condition}
        )temp
         group by floor,date_user_request`);
      const rs = await db.Execute(
        `select   convert(decimal(4,2),avg(ROUND(datediff(second,date_mechanic_cfm_onsite,date_mechanic_cfm_finished)/60.0,2))) as minuteavg,floor,date_user_request from (
      select DATEPART(HOUR, date_user_request)date_user_request,date_mechanic_cfm_onsite,date_mechanic_cfm_finished,floor from DT_task_detail t
      left join DT_user_manager u on u.user_name = t.id_user_mechanic
      WHERE ${condition}
      )temp
       group by floor,date_user_request`
      );

      return rs.recordset || null;
    }
  } catch (error) {
    return null;
  }
};
exports.getLean = async (condition) => {
  try {
    const rs = await db.Execute(
      `select distinct floor from DT_user_manager
      WHERE ${condition}`
    );

    return rs.recordset || null;
  } catch (error) {
    return null;
  }
};
