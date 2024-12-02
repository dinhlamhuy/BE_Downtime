const { query } = require("express");
const db = require("../../connection");
// const db = require("msdb");

exports.getTask = async ({ id_machine, id_user_request, factory, lean }) => {
  try {
    const rs = await db.Execute(
      `SELECT * FROM DT_task_detail WHERE id_machine  = '${id_machine}'  and factory='${factory}' AND fixer ='${lean}' and (date_mechanic_cfm_finished is null OR date_cfm_mechanic is null) `
    );

    return rs.recordset[0] || null;
  } catch (error) {
    return null;
  }
};
exports.getTaskdeletes = async (condition) => {
  try {
    const rs = await db.Execute(
      ` SELECT * FROM DT_task_detail WHERE ${condition}  `
    );
    // console.log(` SELECT * FROM DT_task_detail WHERE ${condition}  `);
    return rs.recordset[0] || null;
  } catch (error) {
    return null;
  }
};
exports.getMachi = async (condition) => {
  try {
    const rs = await db.Execute(`select Asset_No ID_Code, Custom_machine_Name Name_vn, Custom_machine_Name Name_en,Custom_machine_Name Name_mm from [Machine].[Machine].dbo.LYG_Machine_Data where ${condition}`);

    return rs.recordset[0] || null;
    // return `select * from dt_machine where ${condition}`
  } catch (error) {
    return null;
  }
};
exports.getAllMachi = async (condition) => {
  try {
    const rs = await db.Execute(
      `select  Factory, Asset_No ID_Code, Custom_machine_Name Name_vn, Custom_machine_Name Name_en from [Machine].[Machine].dbo.LYG_Machine_Data where ${condition}`
    );
    // const rs = await db.Execute(
    //   `select ID, Factory, ID_Code, Lean, Name_vn, Name_en from dt_machine where ${condition}`
    // );

    return rs.recordset || null;
    // return `select * from dt_machine where ${condition}`
  } catch (error) {
    return null;
  }
};
exports.getTaskdelete = async ({
  id_machine,
  id_user_request,
  factory,
  lean,
}) => {
  try {
    const rs = await db.Execute(
      `SELECT * FROM DT_task_detail WHERE id_machine  = '${id_machine}'  and factory='${factory}'  and (date_mechanic_cfm_finished is null OR date_cfm_mechanic is null) `
    );

    return rs.recordset[0] || null;
  } catch (error) {
    return null;
  }
};

exports.getReasonInfo = async () => {
  try {
    const rs = await db.Execute(`SELECT * FROM DT_info_reason`);
    return rs.recordset || null;
  } catch (error) {
    return null;
  }
};

exports.getMaxposition = async (lean) => {
  try {
    const rs = await db.Execute(
      `select max(position) as maxposition from DT_user_manager where lean like '%${lean}%'`
    );

    return rs.recordset[0] || null;
  } catch (error) {
    return null;
  }
};
exports.getTaskinfouser = async ({ id_user_request, factory }) => {
  try {
    const rs = await db.Execute(
      `SELECT a.id id_task,a.id_machine, a.id_user_request, a.date_user_request, a.id_user_mechanic,
      a.date_cfm_mechanic, a.date_mechanic_cfm_onsite, a.date_mechanic_cfm_finished,
      a.[status], a.remark, a.other_reason, STRING_AGG([info_reason_en], ', ') AS [info_reason_en],STRING_AGG([info_reason_mm], ', ') AS [info_reason_mm],
     STRING_AGG([info_reason_vn], ', ') AS [info_reason_vn], 
      a.id_owner_mechanic,a.date_asign_task,a.factory,a.fixer,a.remark_mechanic,a.skill_cfm,
    b.name, b.lean, b.permission,b.[floor],b.floors,b.token_devices,c.name AS name_mechanic
  FROM  DT_task_detail AS a
  LEFT JOIN  DT_user_manager b ON a.id_user_request = b.user_name 
  LEFT JOIN DT_user_manager c ON a.id_user_mechanic = c.user_name
  LEFT JOIN DT_info_reason ir1 ON ','+a.remark+',' LIKE '%,' + CAST(ir1.id AS VARCHAR) + ',%'
  WHERE   a.id_user_request ='${id_user_request}'  AND b.factory='${factory}' AND status < 4
    GROUP BY  a.id_machine, a.id_user_request, a.date_user_request, a.id_user_mechanic,  a.date_cfm_mechanic,
      a.date_mechanic_cfm_onsite, a.date_mechanic_cfm_finished, a.[status],
      remark, a.other_reason,  a.id_owner_mechanic,  a.date_asign_task,
      a.factory,a.fixer,a.remark_mechanic,a.skill_cfm,b.name,b.lean,
      b.permission,b.[floor],b.floors,b.token_devices,c.name,  a.id
      order by a.date_user_request DESC`
    );

    return rs.recordset || null;
  } catch (error) {
    return null;
  }
};
//----------------Laay lean------------------------------------//
// exports.getHistoryTaskinfouser = async ({ id_user_request, factory }) => {};
exports.getHistoryTaskinfouser = async ({ id_user_request, factory }) => {
  try {
    //  ` SELECT a.id id_task, a.id_machine, a.id_user_request, a.date_user_request, a.id_user_mechanic, MAX(newmachine) newmachine,
    //     b.name AS name_mechanic, a.date_cfm_mechanic, a.date_mechanic_cfm_onsite,
    //     a.date_mechanic_cfm_finished, a.status, b.floor, a.remark, a.other_reason,
    //    (SELECT STRING_AGG( ir1.info_reason_mm, ', ')  FROM DT_info_reason ir1 
    //         WHERE ',' + a.remark + ',' LIKE '%,' + CAST(ir1.id AS VARCHAR) + ',%') AS info_reason_mm, 
    //     (SELECT STRING_AGG( ir1.info_reason_en, ', ')  FROM DT_info_reason ir1 
    //         WHERE ',' + a.remark + ',' LIKE '%,' + CAST(ir1.id AS VARCHAR) + ',%') AS info_reason_en, 
    //     (SELECT STRING_AGG( ir1.info_reason_vn, ', ')  FROM DT_info_reason ir1 
    //         WHERE ',' + a.remark + ',' LIKE '%,' + CAST(ir1.id AS VARCHAR) + ',%') AS info_reason_vn,
    // 	(SELECT STRING_AGG( is1.info_skill_mm, ', ') FROM DT_info_skill is1 
    //         WHERE ',' + a.skill_cfm + ',' LIKE '%,' + CAST(is1.id AS VARCHAR) + ',%') AS info_skill_mm, 
    //     (SELECT STRING_AGG( is1.info_skill_en, ', ') FROM DT_info_skill is1 
    //         WHERE ',' + a.skill_cfm + ',' LIKE '%,' + CAST(is1.id AS VARCHAR) + ',%') AS info_skill_en, 
    //     (SELECT STRING_AGG( is1.info_skill_vn, ', ')  FROM DT_info_skill is1 
    //         WHERE ',' + a.skill_cfm + ',' LIKE '%,' + CAST(is1.id AS VARCHAR) + ',%') AS info_skill_vn,
    //     a.id_owner_mechanic, a.date_asign_task, a.factory, a.fixer, a.remark_mechanic, a.skill_cfm,a.other_skill
    // FROM  DT_task_detail AS a  LEFT JOIN DT_user_manager AS b ON b.user_name = a.id_user_mechanic
    // WHERE  a.id_user_request = '${id_user_request}'
    //                AND b.factory = '${factory}'   AND (a.status = 4 OR a.status = 6)
    // GROUP BY  a.id, a.id_machine, a.id_user_request, a.date_user_request,
    //     a.id_user_mechanic, a.date_cfm_mechanic, a.date_mechanic_cfm_onsite,
    //     a.date_mechanic_cfm_finished, a.status, b.floor,
    //     a.remark, a.other_reason, a.id_owner_mechanic, a.date_asign_task, a.factory,
    //     a.fixer,a.remark_mechanic, a.skill_cfm, a.other_skill,b.name
    // order by a.date_user_request DESC
    
    //       `
    const rs = await db.Execute(` 
       ;WITH ReasonData AS (
    SELECT TD.id, STRING_AGG(info_reason_vn, ', ') AS info_reason_vn, STRING_AGG(info_reason_en, ', ') AS info_reason_en, STRING_AGG(info_reason_mm, ', ') AS info_reason_mm
    FROM DT_task_detail TD LEFT JOIN DT_info_reason ir ON ',' + TD.remark + ',' LIKE '%,' + CAST(ir.id AS VARCHAR) + ',%'
    WHERE TD.id_user_request = '${id_user_request}' GROUP BY TD.id),
SkillData AS (SELECT TD.id, STRING_AGG(info_skill_vn, ', ') AS info_skill_vn, STRING_AGG(info_skill_en, ', ') AS info_skill_en, STRING_AGG(info_skill_mm, ', ') AS info_skill_mm
    FROM DT_task_detail TD LEFT JOIN DT_info_skill is1 ON ',' + TD.skill_cfm + ',' LIKE '%,' + CAST(is1.id AS VARCHAR) + ',%'
    WHERE TD.id_user_request = '${id_user_request}' GROUP BY TD.id)
 
 SELECT a.id id_task, a.id_machine, a.id_user_request, a.date_user_request, a.id_user_mechanic, MAX(newmachine) newmachine,
    b.name AS name_mechanic, a.date_cfm_mechanic, a.date_mechanic_cfm_onsite,
    a.date_mechanic_cfm_finished, a.status, b.floor, a.remark, a.other_reason,
 MAX(info_reason_vn)     info_reason_vn,
        MAX(info_reason_en) info_reason_en,
        MAX(info_reason_mm) info_reason_mm,

		  MAX(info_skill_mm) info_skill_mm,
   MAX(info_skill_en) info_skill_en,
   MAX(info_skill_vn) info_skill_vn,
    a.id_owner_mechanic, a.date_asign_task, a.factory, a.fixer, a.remark_mechanic, a.skill_cfm,a.other_skill
FROM  DT_task_detail AS a  LEFT JOIN DT_user_manager AS b ON b.user_name = a.id_user_mechanic
LEFT JOIN SkillData SD ON SD.id = a.id
LEFT JOIN ReasonData RD ON RD.id = a.id
WHERE  a.id_user_request = '${id_user_request}'
               AND b.factory = '${factory}'   AND (a.status = 4 OR a.status = 6)
GROUP BY  a.id, a.id_machine, a.id_user_request, a.date_user_request,
    a.id_user_mechanic, a.date_cfm_mechanic, a.date_mechanic_cfm_onsite,
    a.date_mechanic_cfm_finished, a.status, b.floor,
    a.remark, a.other_reason, a.id_owner_mechanic, a.date_asign_task, a.factory,
    a.fixer,a.remark_mechanic, a.skill_cfm, a.other_skill,b.name
order by a.date_user_request DESC`

    );

    return rs.recordset || null;
  } catch (error) {
    return null;
  }
};

exports.createTask = async ({
  id_machine,
  id_user_request,
  factory,
  remark,
  otherReason,
  id_mechanic,
  fixer,
}) => {
  try {
    // return await db.Execute(
    //   `INSERT INTO DT_task_detail (id_machine ,id_user_request,date_user_request,id_user_mechanic,status,remark,factory,fixer) VALUES ('${id_machine}','${id_user_request}',GETDATE(),'${id_mechanic}',1,N'${remark}','${factory}','${fixer}')`
    // );
    if (factory != "LYM" ) {
      return await db.Execute(
        `INSERT INTO DT_task_detail (id_machine ,id_user_request,date_user_request,status,remark,factory,fixer, id_user_mechanic, date_asign_task,other_reason)
         VALUES ('${id_machine}','${id_user_request}',GETDATE(),1,N'${remark}','${factory}','${fixer}',NULL, GETDATE(), N'${otherReason}')`
      );
    }
    return await db.Execute(
      `INSERT INTO DT_task_detail (id_machine ,id_user_request,date_user_request,status,remark,factory,fixer, id_user_mechanic, date_asign_task,other_reason)
       VALUES ('${id_machine}','${id_user_request}',GETDATE(),1,N'${remark}','${factory}','${fixer}','${id_mechanic}', GETDATE(), N'${otherReason}')`
    );
  } catch (error) {
    return null;
  }
};
exports.createTaskOwner = async ({
  id_machine,
  id_user_request,
  factory,
  remark,
  otherReason,
  id_owner_mechanic,
  fixer,
}) => {
  try {
    if (factory != "LYM") {
      return await db.Execute(
        `INSERT INTO DT_task_detail (id_machine ,id_user_request,date_user_request,status,remark,factory,fixer, id_owner_mechanic, date_asign_task, other_reason)
         VALUES ('${id_machine}','${id_user_request}',GETDATE(),1,N'${remark}','${factory}','${fixer}','${id_owner_mechanic}', GETDATE(), N'${otherReason}')`
      );
    }
    return await db.Execute(
      `INSERT INTO DT_task_detail (id_machine ,id_user_request,date_user_request,status,remark,factory,fixer, id_owner_mechanic, date_asign_task, other_reason)
       VALUES ('${id_machine}','${id_user_request}',GETDATE(),1,N'${remark}','${factory}','${fixer}','${id_owner_mechanic}', GETDATE(), N'${otherReason}')`
    );
  } catch (error) {
    return null;
  }
};
exports.getAllMechanic = async ({ id_user_request, factory, fixer }) => {
  try {
    let query = "";
    if (fixer === "TM" && factory === "LYM" ) {
      query = ` DECLARE  @floor NVARCHAR(30), @floors NVARCHAR(30);
SELECT @floor=floor, @floors=floors FROM DT_user_manager where user_name='${id_user_request}' and factory='${factory}'
SELECT id, user_name,name, factory, lean, permission, floor, floors, position, line
FROM DT_user_manager WHERE permission BETWEEN 1 AND 2 AND ','+floor+',' LIKE '%,'+@floor+',%' AND ','+floors+',' LIKE '%,'+@floors+',%'
AND lean='${fixer}' AND factory='${factory}'`;
    } else {
      query = ` DECLARE  @floor NVARCHAR(30), @floors NVARCHAR(30);
      SELECT @floor=floor, @floors=floors FROM DT_user_manager where user_name='${id_user_request}' and factory='${factory}'
      SELECT id, user_name,name, factory, lean, permission, floor, floors, position, line
      FROM DT_user_manager WHERE permission BETWEEN 1 AND 2 AND ','+floor+',' LIKE '%,'+@floor+',%' 
      AND lean='${fixer}' AND factory='${factory}'`;
    }
    const rs = await db.Execute(query);
    // console.log(query);
    return rs.recordset;
  } catch (error) {
    return null;
  }
};
exports.getMechanic = async ({ lean_req, factory, fixer, floors }) => {
  try {
    if (fixer === "TM") {
      let query = "";

      if (factory === "LYM") {
        query = `
        SELECT  *, CASE WHEN 
          user_name NOT IN (SELECT id_user_mechanic FROM dt_task_detail WHERE fixer='${fixer}' and factory = '${factory}' and date_mechanic_cfm_finished is null  and id_user_mechanic is not null) 
          then 0 else 1 end hastask
          from dt_user_manager where permission=2 and lean='${fixer}' and factory = '${factory}' and ','+floor+',' like '%,${lean_req},%'  and ','+floors+',' like '%,${floors},%' 
          order by hastask--, NEWID()  
        `;
      } else if (factory === "LHG" || factory === "LVL") {
        // -- SELECT  *, CASE WHEN
        //   -- user_name NOT IN (SELECT id_user_mechanic FROM dt_task_detail WHERE fixer='${fixer}' and factory = '${factory}' and date_mechanic_cfm_finished is null  and id_user_mechanic is not null)
        //    --then 0 else 1 end hastask
        //    --from dt_user_manager where permission BETWEEN 1 and 2  and lean='${fixer}' and factory = '${factory}' and ','+floor+',' like '%,${lean_req},%'
        //    -- --and ','+floors+',' like '%,${floors},%'  order by hastask, NEWID()
        query = `

         SELECT  *
          from dt_user_manager where permission BETWEEN 1 and 2  and lean='${fixer}' and factory = '${factory}' and ','+floor+',' like '%,${lean_req},%' 
          and user_name NOT in (SELECT id_user_mechanic FROM dt_task_detail WHERE fixer='${fixer}' and factory = '${factory}' and date_mechanic_cfm_finished is null  and id_user_mechanic is not null) 
      `;
      } else {
        // SELECT  *, CASE WHEN
        //   user_name NOT IN (SELECT id_user_mechanic FROM dt_task_detail WHERE fixer='${fixer}' and factory = '${factory}' and date_mechanic_cfm_finished is null  and id_user_mechanic is not null)
        //   then 0 else 1 end hastask
        //   from dt_user_manager where permission BETWEEN 1 and 2  and lean='${fixer}' and factory = '${factory}' and ','+floor+',' like '%,${lean_req},%'  and ','+floors+',' like '%,${floors},%'
        //   order by hastask, NEWID()
        query = `
          SELECT  * from dt_user_manager where permission BETWEEN 1 and 2  and lean='${fixer}' and factory = '${factory}' and ','+floor+',' like '%,${lean_req},%'  and ','+floors+',' like '%,${floors},%' 
        and  user_name NOT IN (SELECT id_user_mechanic FROM dt_task_detail WHERE fixer='${fixer}' and factory = '${factory}' and date_mechanic_cfm_finished is null  and id_user_mechanic is not null) 
        `;
      }
      const rs = await db.Execute(query);

      return rs.recordset;
    }
    if (fixer === "TD") {
      let query = "";
      if (factory === "LHG" && lean_req !== "C-F3") {
        // SELECT UM.*, CASE WHEN
        //   user_name NOT IN (SELECT id_user_mechanic FROM dt_task_detail WHERE fixer='${fixer}' and factory = '${factory}' and date_mechanic_cfm_finished is null  and id_user_mechanic is not null)
        //   then 0 else 1 end hastask
        //   from dt_user_manager UM
        //     LEFT JOIN [DT_CheckInOut] CIO ON CIO.Person_ID  LIKE '%'+UM.user_name
        //   where permission=2 and lean='${fixer}' and UM.factory = '${factory}' and ','+floor+',' like '%,${lean_req},%'
        //     AND CONVERT(DATETIME,CIO.Check_IN) <> CONVERT(DATE, '1900-01-01 00:00:00.000')
        //     and CONVERT(DATETIME,CIO.Check_IN) <  CONVERT(DATETIME, GETDATE())
        //     and (
        //       CONVERT(DATE,CIO.Check_OUT) = CONVERT(DATE, '1900-01-01 00:00:00.000') AND
        //       (
        //         CONVERT(DATE, CIO.Check_Date) = CONVERT(DATE, GETDATE())
        //       ) OR (
        //         CONVERT(DATE, CIO.Check_Date) = CONVERT(DATE, GETDATE()-1) AND Shift='CA3')
        //     )
        //   order by hastask, NEWID()
        query = `
        SELECT UM.* from dt_user_manager UM
            LEFT JOIN [DT_CheckInOut] CIO ON CIO.Person_ID  LIKE '%'+UM.user_name 		  
          where permission=2 and lean='${fixer}' and UM.factory = '${factory}' and ','+floor+',' like '%,${lean_req},%'  
            AND CONVERT(DATETIME,CIO.Check_IN) <> CONVERT(DATE, '1900-01-01 00:00:00.000')
            and CONVERT(DATETIME,CIO.Check_IN) <  CONVERT(DATETIME, GETDATE())
            and user_name NOT IN (SELECT id_user_mechanic FROM dt_task_detail WHERE fixer='${fixer}' and factory = '${factory}' and date_mechanic_cfm_finished is null  and id_user_mechanic is not null) 
            and (
              CONVERT(DATE,CIO.Check_OUT) = CONVERT(DATE, '1900-01-01 00:00:00.000') AND 
              (
                CONVERT(DATE, CIO.Check_Date) = CONVERT(DATE, GETDATE())
              ) OR (
                CONVERT(DATE, CIO.Check_Date) = CONVERT(DATE, GETDATE()-1) AND Shift='CA3')
            )
         
            `;
      } else if (factory === "LYM") {
        // SELECT *, CASE WHEN 
        // user_name NOT IN (SELECT id_user_mechanic FROM dt_task_detail WHERE fixer='${fixer}' and factory = '${factory}' and date_mechanic_cfm_finished is null  and id_user_mechanic is not null) 
        // then 0 else 1 end hastask
        // from dt_user_manager where permission=2 and lean='${fixer}' and factory = '${factory}' and ','+floor+',' like '%,${lean_req},%'  and ','+floors+',' like '%,${floors},%'  
        // order by hastask, NEWID() 
        query = ` SELECT * from dt_user_manager where permission=2 and lean='${fixer}' and factory = '${factory}' and ','+floor+',' like '%,${lean_req},%'  and ','+floors+',' like '%,${floors},%'   
        AND user_name NOT IN (SELECT id_user_mechanic FROM dt_task_detail WHERE fixer='${fixer}' and factory = '${factory}' and date_mechanic_cfm_finished is null  and id_user_mechanic is not null) 
               `;
      } else {
        query = ` SELECT *
        from dt_user_manager where permission BETWEEN 1 and 2 and lean='${fixer}' and factory = '${factory}' and ','+floor+',' like '%,${lean_req},%'  
       AND user_name NOT IN (SELECT id_user_mechanic FROM dt_task_detail WHERE fixer='${fixer}' and factory = '${factory}' and date_mechanic_cfm_finished is null  and id_user_mechanic is not null) 
             
            `;
      }
      // console.log(query)
      const rs = await db.Execute(query);
      return rs.recordset;
    }
    // } else if (factory == 'LYV') {
    //   if (fixer === "TM") {
    //     // console.log(
    //     //   `SELECT * FROM DT_user_manager WHERE position = 2 AND floor like '%${lean_req}%'  AND factory='${factory}' and lean ='${fixer}'`
    //     // );
    //     const rs = await db.Execute(
    //       `SELECT * FROM DT_user_manager WHERE position = 2 AND floor like '%${lean_req}%'  AND factory='${factory}' and lean ='${fixer}'`
    //     );
    //     return rs.recordset;
    //   }
    //   if (fixer === "TD") {
    //     // const floors1 = lean_req.split();
    //     // console.log(floors1);
    //     // var patt1 = /[0-9]/g;
    //     // var patt2 = /[a-zA-Z]/g;
    //     // var letters = str.match(patt2);
    //     // var digits = lean_req.match(patt2);
    //     // const floors1 = digits;
    //     // console.log("digi", digits);
    //     const rs = await db.Execute(
    //       `SELECT * FROM DT_user_manager
    //     LEFT JOIN DT_task_detail ON DT_task_detail.id_user_mechanic = DT_user_manager.user_name
    //     WHERE position = 2 AND floor like '%${lean_req}%'   AND DT_user_manager.factory='${factory}' and lean ='${fixer}'
    //     `
    //     );
    //     console.log(
    //       `SELECT * FROM DT_user_manager
    //     LEFT JOIN DT_task_detail ON DT_task_detail.id_user_mechanic = DT_user_manager.user_name
    //     WHERE position = 2 AND floor like '%${lean_req}%'   AND DT_user_manager.factory='${factory}' and lean ='${fixer}'
    //     AND ( id_user_mechanic IS NULL  AND date_cfm_mechanic IS NULL)
    //     `
    //     );
    //     return rs.recordset;

    //     // return [rs.recordset[Math.floor(Math.random() * rs.recordset.length)]];
    //   }
    // } else if (factory == 'LVL') {
    //   if (fixer === "TM") {
    //     // console.log(
    //     //   `SELECT * FROM DT_user_manager WHERE position = 2 AND floor like '%${lean_req}%'  AND factory='${factory}' and lean ='${fixer}'`
    //     // );
    //     const rs = await db.Execute(
    //       `SELECT * FROM DT_user_manager WHERE position = 2 AND floor like '%${lean_req}%'  AND factory='${factory}' and lean ='${fixer}'`
    //     );
    //     return rs.recordset;
    //   }
    //   if (fixer === "TD") {
    //     // const floors1 = lean_req.split();
    //     // console.log(floors1);
    //     // var patt1 = /[0-9]/g;
    //     // var patt2 = /[a-zA-Z]/g;
    //     // // var letters = str.match(patt2);
    //     // var digits = lean_req.match(patt2);
    //     // const floors1 = digits;
    //     // console.log("digi", digits);
    //     const rs = await db.Execute(
    //       `SELECT * FROM DT_user_manager
    //     LEFT JOIN DT_task_detail ON DT_task_detail.id_user_mechanic = DT_user_manager.user_name
    //     WHERE position = 2 AND floor like '%${lean_req}%'   AND DT_user_manager.factory='${factory}' and lean ='${fixer}'
    //     `
    //     );
    //     // console.log(
    //     //   `SELECT * FROM DT_user_manager
    //     // LEFT JOIN DT_task_detail ON DT_task_detail.id_user_mechanic = DT_user_manager.user_name
    //     // WHERE position = 2 AND floor like '%${lean_req}%'   AND DT_user_manager.factory='${factory}' and lean ='${fixer}'
    //     // AND ( id_user_mechanic IS NULL  AND date_cfm_mechanic IS NULL)
    //     // `
    //     // );
    //     return rs.recordset;

    //     // return [rs.recordset[Math.floor(Math.random() * rs.recordset.length)]];
    //   }
    // } else if (factory == 'LYM') {
    //   if (fixer === "TM") {
    //     // console.log(
    //     //   `SELECT * FROM DT_user_manager WHERE position = 6 AND floor like '%${lean_req}%'  AND factory='${factory}' and lean ='${fixer}'`
    //     // );
    //     const rs = await db.Execute(
    //       `SELECT * FROM DT_user_manager WHERE position = 5 AND floor like '%${lean_req}%'  AND factory='${factory}' and lean ='${fixer}'`
    //     );
    //     return rs.recordset;
    //   }
    //   if (fixer === "TD") {
    //     // const floors1 = lean_req.split();
    //     // console.log(floors1);
    //     // var patt1 = /[0-9]/g;
    //     // var patt2 = /[a-zA-Z]/g;
    //     // // var letters = str.match(patt2);
    //     // var digits = lean_req.match(patt2);
    //     // const floors1 = digits;
    //     // console.log("digi", digits);
    //     const rs = await db.Execute(
    //       `SELECT * FROM DT_user_manager
    //     LEFT JOIN DT_task_detail ON DT_task_detail.id_user_mechanic = DT_user_manager.user_name
    //     WHERE position = 5 AND floor like '%${lean_req}%'   AND DT_user_manager.factory='${factory}' and lean ='${fixer}'`
    //     );
    //     // console.log(
    //     //   `SELECT * FROM DT_user_manager
    //     // LEFT JOIN DT_task_detail ON DT_task_detail.id_user_mechanic = DT_user_manager.user_name
    //     // WHERE position = 6 AND floor like '%${lean_req}%'   AND DT_user_manager.factory='${factory}' and lean ='${fixer}'
    //     // AND ( id_user_mechanic IS NULL  AND date_cfm_mechanic IS NULL)
    //     // `
    //     // );
    //     return rs.recordset;

    //     // return [rs.recordset[Math.floor(Math.random() * rs.recordset.length)]];
    //   }
    // }
  } catch (error) {
    return null;
  }
};
exports.deleteTask = async ({ id_machine, id_user_request, factory }) => {
  try {
    // console.log(
    //   `      delete DT_task_detail where id_machine = '${id_machine}' and id_user_request = '${id_user_request}' and factory = '${factory}'  and date_cfm_mechanic is null`
    // );
    const rs = await db.Execute(
      `      delete DT_task_detail where id_machine = '${id_machine}' and id_user_request = '${id_user_request}' 
      and factory = '${factory}'  and date_cfm_mechanic is null`
    );

    return rs;
  } catch (error) {
    return null;
  }
};
