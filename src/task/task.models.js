const db = require("../../connection");

exports.getTask = async ({ id_machine, id_user_request, factory, lean }) => {
  try {
    const rs = await db.Execute(
      `SELECT * FROM DT_task_detail WHERE id_machine  = '${id_machine}' and id_user_request ='${id_user_request}' and factory = '${factory}'  and date_cfm_mechanic is null`
    );

    return rs.recordset[0] || null;
  } catch (error) {
    return null;
  }
};
exports.getOwner = async (condition) => {
  try {
    const rs = await db.Execute(
      `SELECT * FROM DT_user_manager WHERE ${condition}`
    );
    //console.log(`SELECT * FROM DT_user_manager WHERE ${condition}`);
    return rs.recordset[0] || null;
  } catch (e) {
    return null;
  }
};
exports.getOwners = async (condition) => {
  try {
    const rs = await db.Execute(
      `SELECT * FROM DT_user_manager WHERE ${condition}`
    );
    //console.log(`SELECT * FROM DT_user_manager WHERE ${condition}`);
    return rs.recordset || null;
  } catch (e) {
    return null;
  }
};
exports.getListStatus = async ({ condition, permission }) => {
  try {
    let query = `SELECT A.id,A.user_name,A.refresh_token,A.create_at,A.name,A.date_of_birdth,A.phone_number,A.factory,A.lean,A.permission,A.token_devices,A.floor,A.floors,A.position,
      MAX(CASE
      when date_cfm_mechanic is not null and date_mechanic_cfm_onsite is not null and date_mechanic_cfm_finished is not null then 1
      WHEN A.user_name = DT_task_detail.id_user_mechanic and date_mechanic_cfm_onsite is  null and date_mechanic_cfm_finished is null then 2
       WHEN A.user_name = DT_task_detail.id_user_mechanic AND DT_task_detail.date_cfm_mechanic is not null  then 3
       ELSE 1 END) STS`;
    if (permission == 0) {
      query += `,TaskName=(SELECT Top(1) id_user_request FROM DT_task_detail where A.user_name=DT_task_detail.id_user_mechanic and DT_task_detail.date_cfm_mechanic IS NOT NULL AND DT_task_detail.date_mechanic_cfm_finished IS NULL  order by date_user_request DESC),
	    CountTime=ISNULL((SELECT COUNT(1) FROM DT_task_detail where A.user_name=DT_task_detail.id_user_mechanic and DT_task_detail.date_cfm_mechanic IS NOT NULL),0)`;
    } else {
      query += `,'' TaskName,0 CountTime `;
    }

    query += `     
    FROM DT_user_manager A
      LEFT JOIN DT_task_detail ON DT_task_detail.id_user_mechanic =A.user_name
      where ${condition}
      GROUP BY  A.id,A.user_name,A.refresh_token,A.create_at,A.name,A.date_of_birdth,A.phone_number,A.factory,A.lean,A.permission,A.token_devices,A.floor,A.position,A.floors`;

    // console.log(query);

    const rs = await db.Execute(query);

    return rs.recordset || null;
  } catch (e) {
    return null;
  }
};
exports.getCheckReject = async (id_task_detail, id_user_mechanic) => {
  try {
    const rs = await db.Execute(
      `SELECT COUNT(*) as total from DT_reject_task where id_task_detail ='${id_task_detail}' and [id_user_mechanic] ='${id_user_mechanic}'`
    );

    return rs.recordset[0] || null;
  } catch (e) {
    return null;
  }
};
exports.getCreateReject = async ({
  id_task_detail,
  id_machine,
  id_user_mechanic,
}) => {
  try {
    //console.log(`insert into DT_reject_task (id_task_detail, id_machine, id_user_mechanic, number_reject,
      //date_recive, create_date) VALUES ('${id_task_detail}','${id_machine}','${id_user_mechanic}','1',GETDATE(), GETDATE())`);
    const rs = await db.Execute(
      `insert into DT_reject_task (id_task_detail, id_machine, id_user_mechanic, number_reject,
        date_recive, create_date) VALUES ('${id_task_detail}','${id_machine}','${id_user_mechanic}','1',GETDATE(), GETDATE())`
    );

    return rs || null;
  } catch (e) {
    return null;
  }
};
exports.getUpdateReject = async ({
  id_task_detail,
  number_reject,
  id_user_mechanic,
}) => {
  try {
    //console.log(`update DT_reject_task set number_reject='${number_reject}', date_recive=GETDATE() where  id_task_detail ='${id_task_detail}' and  [id_user_mechanic] ='${id_user_mechanic}'`);
    const rs = await db.Execute(
      `update DT_reject_task set number_reject='${number_reject}', date_recive=GETDATE() where  id_task_detail ='${id_task_detail}' and  [id_user_mechanic] ='${id_user_mechanic}'`
    );

    return rs || null;
  } catch (e) {
    return null;
  }
};

exports.getListStatusMechanic = async ({
  condition,
  idmachine,
  factory,
  lean,
}) => {
  try {
    // and (number_reject <2 or number_reject is null)
    const rs0 = await db.Execute(`select id_user_mechanic from DT_reject_task 
    where number_reject =2 and id_machine ='${idmachine}'
    and ( convert(date,dt_reject_task.date_recive) = convert(date,getdate()))
    `);

    // return `select id_user_mechanic from DT_reject_task
    // where number_reject =2 and id_machine ='${idmachine}'
    // and ( convert(date,dt_reject_task.date_recive) = convert(date,getdate()))`;
    let A = ``;
    if (rs0.recordset.length > 0) {
      // A += ` and (a.user_name NOT IN ('${rs0.recordset[0].id_user_mechanic}')) `;
      const idUserMechanics = rs0.recordset
        .map((record) => record.id_user_mechanic)
        .join("','");

      A += ` and (a.user_name NOT IN ('${idUserMechanics}')) `;

      console.log(`select id,user_name,refresh_token,create_at,name,date_of_birdth,phone_number,factory,lean,permission,token_devices,floor,floors,position,MAX(number_reject) number_reject, skill, ISNULL(totalFix,0)totalFix
        from
        (
            select A.id,A.user_name,A.refresh_token,A.create_at,A.name,A.date_of_birdth,A.phone_number,A.factory,A.lean,A.permission,A.token_devices
            ,A.floor,A.floors,A.position,number_reject, skill,totalFix from DT_user_manager A
            left join dt_reject_task on dt_reject_task.id_user_mechanic = a.user_name AND dt_reject_task.id_machine='${idmachine}'
        LEFT JOIN (SELECT id_user_mechanic, COUNT(1)totalFix FROM DT_task_detail   where factory='${factory}' and status=4 GROUP BY id_user_mechanic)  TVB2 ON TVB2.id_user_mechanic = A.user_name 
            
            --left join DT_task_detail on DT_task_detail.id_user_mechanic = a.user_name 
        where ${condition} ${A}  -- and (a.user_name <> '${rs0.recordset[0].id_user_mechanic}')
      AND user_name NOT IN (SELECT id_user_mechanic FROM dt_task_detail WHERE fixer='${lean}' and factory = '${factory}' and date_mechanic_cfm_finished is null  and id_user_mechanic is not null) 

            group by A.user_name, A.id,A.refresh_token,A.create_at,A.name,A.date_of_birdth,A.phone_number,A.factory,A.lean,A.permission,A.token_devices,A.floor,
            A.floors,A.position,number_reject,DT_reject_task.id_task_detail, skill,totalFix
            ) as temp
        group by user_name ,number_reject, id,refresh_token,create_at,name,date_of_birdth,phone_number,factory,lean,permission,token_devices,floor,floors,position,  skill,totalFix order by totalFix`);

      const rs = await db.Execute(
        `select id,user_name,refresh_token,create_at,name,date_of_birdth,phone_number,factory,lean,permission,token_devices,floor,floors,position,MAX(number_reject) number_reject, skill, ISNULL(totalFix,0)totalFix
        from
        (
            select A.id,A.user_name,A.refresh_token,A.create_at,A.name,A.date_of_birdth,A.phone_number,A.factory,A.lean,A.permission,A.token_devices
            ,A.floor,A.floors,A.position,number_reject, skill,totalFix from DT_user_manager A
            left join dt_reject_task on dt_reject_task.id_user_mechanic = a.user_name AND dt_reject_task.id_machine='${idmachine}'
        LEFT JOIN (SELECT id_user_mechanic, COUNT(1)totalFix FROM DT_task_detail   where factory='${factory}' and status=4 GROUP BY id_user_mechanic)  TVB2 ON TVB2.id_user_mechanic = A.user_name 
            
            --left join DT_task_detail on DT_task_detail.id_user_mechanic = a.user_name 
        where ${condition} ${A}  -- and (a.user_name <> '${rs0.recordset[0].id_user_mechanic}')
      AND user_name NOT IN (SELECT id_user_mechanic FROM dt_task_detail WHERE fixer='${lean}' and factory = '${factory}' and date_mechanic_cfm_finished is null  and id_user_mechanic is not null) 

            group by A.user_name, A.id,A.refresh_token,A.create_at,A.name,A.date_of_birdth,A.phone_number,A.factory,A.lean,A.permission,A.token_devices,A.floor,
            A.floors,A.position,number_reject,DT_reject_task.id_task_detail, skill,totalFix
            ) as temp
        group by user_name ,number_reject, id,refresh_token,create_at,name,date_of_birdth,phone_number,factory,lean,permission,token_devices,floor,floors,position,  skill,totalFix order by totalFix`
      );

      return rs.recordset || null;
    } else {
      console.log(`select A.id,A.user_name,A.refresh_token,A.create_at,A.name,A.date_of_birdth,A.phone_number,A.factory,A.lean,A.permission,A.token_devices,A.floor,A.floors,A.position, skill, ISNULL(totalFix,0)totalFix
      from DT_user_manager A  
      
        LEFT JOIN (SELECT id_user_mechanic, COUNT(1) totalFix FROM DT_task_detail   where factory='${factory}' and status=4 GROUP BY id_user_mechanic)  TVB2 ON TVB2.id_user_mechanic = A.user_name 
      where  ${condition} ${A}  
      AND user_name NOT IN (SELECT id_user_mechanic FROM dt_task_detail WHERE fixer='${lean}' and factory = '${factory}' and date_mechanic_cfm_finished is null  and id_user_mechanic is not null) 
      group by A.user_name, A.id,A.refresh_token,A.create_at,A.name,A.date_of_birdth,A.phone_number,A.factory,A.lean,A.permission,A.token_devices
      ,A.floor,A.floors,A.position,skill, totalFix order by totalFix`);
      const rs =
        await db.Execute(`select A.id,A.user_name,A.refresh_token,A.create_at,A.name,A.date_of_birdth,A.phone_number,A.factory,A.lean,A.permission,A.token_devices,A.floor,A.floors,A.position, skill, ISNULL(totalFix,0)totalFix
      from DT_user_manager A  
      
        LEFT JOIN (SELECT id_user_mechanic, COUNT(1) totalFix FROM DT_task_detail   where factory='${factory}' and status=4 GROUP BY id_user_mechanic)  TVB2 ON TVB2.id_user_mechanic = A.user_name 
      where  ${condition} ${A}  
      AND user_name NOT IN (SELECT id_user_mechanic FROM dt_task_detail WHERE fixer='${lean}' and factory = '${factory}' and date_mechanic_cfm_finished is null  and id_user_mechanic is not null) 
      group by A.user_name, A.id,A.refresh_token,A.create_at,A.name,A.date_of_birdth,A.phone_number,A.factory,A.lean,A.permission,A.token_devices
      ,A.floor,A.floors,A.position,skill, totalFix order by totalFix`);

      return rs.recordset || null;
    }
  } catch (e) {
    return null;
  }
};
exports.getListmehcanic = async (condition) => {
  try {
    // console.log(` SELECT DT_task_detail.id,id_machine,id_user_request,date_user_request,id_user_mechanic,date_cfm_mechanic,date_mechanic_cfm_onsite,status,remark,other_reason,id_owner_mechanic,date_asign_task,DT_user_manager.name,DT_user_manager.floor,DT_user_manager.floors
    //   ,STRING_AGG([info_reason_mm], ', ') AS [info_reason_mm],
    //   STRING_AGG([info_reason_en], ', ') AS [info_reason_en], 
    //   STRING_AGG([info_reason_vn], ', ') AS [info_reason_vn]
    //   FROM DT_task_detail
    //   left join DT_user_manager on DT_user_manager.user_name = DT_task_detail.id_user_request
    //   LEFT JOIN DT_info_reason ir1 ON ','+DT_task_detail.remark+',' LIKE '%,' + CAST(ir1.id AS VARCHAR) + ',%'
    //   WHERE  DT_user_manager.permission = 3 and (DT_task_detail.status=1 or DT_task_detail.status= 3 or DT_task_detail.status= 2 or DT_task_detail.status= 5 ) and DT_task_detail.id_user_mechanic is  null ${condition} 
      	 
    //   GROUP BY DT_task_detail.id,id_machine,id_user_request,date_user_request,id_user_mechanic,date_cfm_mechanic,date_mechanic_cfm_onsite,status,remark,other_reason,id_owner_mechanic,date_asign_task,DT_user_manager.name,DT_user_manager.floor,DT_user_manager.floors
    //   `);
    console.log( ` SELECT DT_task_detail.id,id_machine,id_user_request,date_user_request,id_user_mechanic,date_cfm_mechanic,date_mechanic_cfm_onsite,status,remark,other_reason,id_owner_mechanic,date_asign_task,DT_user_manager.name,DT_user_manager.floor,DT_user_manager.floors
      ,STRING_AGG([info_reason_mm], ', ') AS [info_reason_mm], STRING_AGG([info_reason_en], ', ') AS [info_reason_en], STRING_AGG([info_reason_vn], ', ') AS [info_reason_vn]
      FROM DT_task_detail
      left join DT_user_manager on DT_user_manager.user_name = DT_task_detail.id_user_request
      LEFT JOIN DT_info_reason ir1 ON ','+DT_task_detail.remark+',' LIKE '%,' + CAST(ir1.id AS VARCHAR) + ',%'
      WHERE  DT_user_manager.permission = 3 and (DT_task_detail.status=1 or DT_task_detail.status= 3 or DT_task_detail.status= 2 or DT_task_detail.status= 5 ) and DT_task_detail.id_user_mechanic is  null ${condition} 
      GROUP BY DT_task_detail.id,id_machine,id_user_request,date_user_request,id_user_mechanic,date_cfm_mechanic,date_mechanic_cfm_onsite,status,remark,other_reason,id_owner_mechanic,date_asign_task,DT_user_manager.name,DT_user_manager.floor,DT_user_manager.floors
      `)
    const rs = await db.Execute(
      ` SELECT DT_task_detail.id,id_machine,id_user_request,date_user_request,id_user_mechanic,date_cfm_mechanic,date_mechanic_cfm_onsite,status,remark,other_reason,id_owner_mechanic,date_asign_task,DT_user_manager.name,DT_user_manager.floor,DT_user_manager.floors
      ,STRING_AGG([info_reason_mm], ', ') AS [info_reason_mm], STRING_AGG([info_reason_en], ', ') AS [info_reason_en], STRING_AGG([info_reason_vn], ', ') AS [info_reason_vn]
      FROM DT_task_detail
      left join DT_user_manager on DT_user_manager.user_name = DT_task_detail.id_user_request
      LEFT JOIN DT_info_reason ir1 ON ','+DT_task_detail.remark+',' LIKE '%,' + CAST(ir1.id AS VARCHAR) + ',%'
      WHERE  DT_user_manager.permission = 3 and (DT_task_detail.status=1 or DT_task_detail.status= 3 or DT_task_detail.status= 2 or DT_task_detail.status= 5 ) and DT_task_detail.id_user_mechanic is  null ${condition} 
      GROUP BY DT_task_detail.id,id_machine,id_user_request,date_user_request,id_user_mechanic,date_cfm_mechanic,date_mechanic_cfm_onsite,status,remark,other_reason,id_owner_mechanic,date_asign_task,DT_user_manager.name,DT_user_manager.floor,DT_user_manager.floors
      `);
     
    return rs.recordset || null;
  } catch (error) {
    return null;
  }
};
exports.getListOnwermehcanic = async (condition) => {
  try {
    const rs = await db.Execute(
      `
      SELECT DT_task_detail.id,id_machine,id_user_request,date_user_request,id_user_mechanic,date_cfm_mechanic,date_mechanic_cfm_onsite,status,remark,id_owner_mechanic,date_asign_task,DT_user_manager.name,DT_user_manager.floor,DT_user_manager.floors
      ,STRING_AGG([info_reason_mm], ', ') AS [info_reason_mm], STRING_AGG([info_reason_en], ', ') AS [info_reason_en], 
      STRING_AGG([info_reason_vn], ', ') AS [info_reason_vn], MAX(Onwer.phone_number) phone_number, MAX(Onwer.name) Onwername
      FROM DT_task_detail
      left join DT_user_manager on DT_user_manager.user_name = DT_task_detail.id_user_request
            left join DT_user_manager Onwer on Onwer.user_name = DT_task_detail.id_owner_mechanic
      LEFT JOIN DT_info_reason ir1 ON ','+DT_task_detail.remark+',' LIKE '%,' + CAST(ir1.id AS VARCHAR) + ',%'
      WHERE  DT_user_manager.permission = 3 and (DT_task_detail.status=1 or DT_task_detail.status= 3 or DT_task_detail.status= 2 or DT_task_detail.status= 5 ) and DT_task_detail.id_user_mechanic is  null ${condition} 
      GROUP BY DT_task_detail.id,id_machine,id_user_request,date_user_request,id_user_mechanic,date_cfm_mechanic,date_mechanic_cfm_onsite,status,remark,id_owner_mechanic,date_asign_task,DT_user_manager.name,DT_user_manager.floor,DT_user_manager.floors
      
      `
    );
    // console.log(  `
    //   SELECT DT_task_detail.id,id_machine,id_user_request,date_user_request,id_user_mechanic,date_cfm_mechanic,date_mechanic_cfm_onsite,status,remark,id_owner_mechanic,date_asign_task,DT_user_manager.name,DT_user_manager.floor,DT_user_manager.floors
    //   ,STRING_AGG([info_reason_en], ', ') AS [info_reason_en], STRING_AGG([info_reason_vn], ', ') AS [info_reason_vn], MAX(Onwer.phone_number) phone_number, MAX(Onwer.name) Onwername
    //   FROM DT_task_detail
    //   left join DT_user_manager on DT_user_manager.user_name = DT_task_detail.id_user_request
    //         left join DT_user_manager Onwer on Onwer.user_name = DT_task_detail.id_owner_mechanic
    //   LEFT JOIN DT_info_reason ir1 ON ','+DT_task_detail.remark+',' LIKE '%,' + CAST(ir1.id AS VARCHAR) + ',%'
    //   WHERE  DT_user_manager.permission = 3 and (DT_task_detail.status=1 or DT_task_detail.status= 3 or DT_task_detail.status= 2 or DT_task_detail.status= 5 ) and DT_task_detail.id_user_mechanic is  null ${condition}
    //   GROUP BY DT_task_detail.id,id_machine,id_user_request,date_user_request,id_user_mechanic,date_cfm_mechanic,date_mechanic_cfm_onsite,status,remark,id_owner_mechanic,date_asign_task,DT_user_manager.name,DT_user_manager.floor,DT_user_manager.floors

    //   `)

    return rs.recordset || null;
  } catch (error) {
    return null;
  }
};

exports.getTaskhistory = async ({ id_user_mechanic, factory }) => {
  try {


//     `SELECT a.id id_task, a.id_machine, a.id_user_request, a.date_user_request, a.id_user_mechanic,MAX(newmachine) newmachine,
//   b.name AS name_mechanic, a.date_cfm_mechanic, a.date_mechanic_cfm_onsite,
//   a.date_mechanic_cfm_finished, a.status, b.floor, a.remark,a.other_reason,
//    (SELECT STRING_AGG( ir1.info_reason_mm, ', ')  FROM DT_info_reason ir1 
//       WHERE ',' + a.remark + ',' LIKE '%,' + CAST(ir1.id AS VARCHAR) + ',%') AS info_reason_mm, 
//   (SELECT STRING_AGG( ir1.info_reason_en, ', ')  FROM DT_info_reason ir1 
//       WHERE ',' + a.remark + ',' LIKE '%,' + CAST(ir1.id AS VARCHAR) + ',%') AS info_reason_en, 
//   (SELECT STRING_AGG( ir1.info_reason_vn, ', ')  FROM DT_info_reason ir1 
//       WHERE ',' + a.remark + ',' LIKE '%,' + CAST(ir1.id AS VARCHAR) + ',%') AS info_reason_vn,
//   (SELECT STRING_AGG( is1.info_skill_mm, ', ') FROM DT_info_skill is1 
//       WHERE ',' + a.skill_cfm + ',' LIKE '%,' + CAST(is1.id AS VARCHAR) + ',%') AS info_skill_mm, 
//   (SELECT STRING_AGG( is1.info_skill_en, ', ') FROM DT_info_skill is1 
//       WHERE ',' + a.skill_cfm + ',' LIKE '%,' + CAST(is1.id AS VARCHAR) + ',%') AS info_skill_en, 
//   (SELECT STRING_AGG( is1.info_skill_vn, ', ')  FROM DT_info_skill is1 
//       WHERE ',' + a.skill_cfm + ',' LIKE '%,' + CAST(is1.id AS VARCHAR) + ',%') AS info_skill_vn,
//   a.id_owner_mechanic, a.date_asign_task, a.factory, a.fixer, a.remark_mechanic, a.skill_cfm, a.other_skill
// FROM  DT_task_detail AS a LEFT JOIN DT_user_manager AS b ON b.user_name = a.id_user_mechanic
// WHERE a.id_user_mechanic ='${id_user_mechanic}' AND b.factory='${factory}' and (status = 4 or  status = 6)
// GROUP BY a.id, a.id_machine, a.id_user_request, a.date_user_request,
//   a.id_user_mechanic, a.date_cfm_mechanic, a.date_mechanic_cfm_onsite,
//   a.date_mechanic_cfm_finished, a.status, b.floor,
//   a.remark,a.other_reason, a.id_owner_mechanic, a.date_asign_task, a.factory,
//   a.fixer,a.remark_mechanic, a.skill_cfm, a.other_skill,b.name
//  ORDER BY a.date_user_request DESC`
    const rs = await db.Execute(`
          ;WITH ReasonData AS (
    SELECT TD.id, STRING_AGG(info_reason_vn, ', ') AS info_reason_vn, STRING_AGG(info_reason_en, ', ') AS info_reason_en, STRING_AGG(info_reason_mm, ', ') AS info_reason_mm
    FROM DT_task_detail TD LEFT JOIN DT_info_reason ir ON ',' + TD.remark + ',' LIKE '%,' + CAST(ir.id AS VARCHAR) + ',%'
    WHERE TD.id_user_mechanic ='${id_user_mechanic}'  GROUP BY TD.id),
SkillData AS (SELECT TD.id, STRING_AGG(info_skill_vn, ', ') AS info_skill_vn, STRING_AGG(info_skill_en, ', ') AS info_skill_en, STRING_AGG(info_skill_mm, ', ') AS info_skill_mm
    FROM DT_task_detail TD LEFT JOIN DT_info_skill is1 ON ',' + TD.skill_cfm + ',' LIKE '%,' + CAST(is1.id AS VARCHAR) + ',%'
    WHERE TD.id_user_mechanic ='${id_user_mechanic}'  GROUP BY TD.id)
SELECT TOP(50) a.id id_task, a.id_machine, a.id_user_request, a.date_user_request, a.id_user_mechanic,MAX(newmachine) newmachine,
    b.name AS name_mechanic, a.date_cfm_mechanic, a.date_mechanic_cfm_onsite,
    a.date_mechanic_cfm_finished, a.status, b.floor, a.remark,a.other_reason,
info_reason_vn,info_reason_en,info_reason_mm,info_skill_mm,info_skill_en,info_skill_vn,
    a.id_owner_mechanic, a.date_asign_task, a.factory, a.fixer, a.remark_mechanic, a.skill_cfm, a.other_skill
FROM  DT_task_detail AS a LEFT JOIN DT_user_manager AS b ON b.user_name = a.id_user_mechanic
LEFT JOIN SkillData SD ON SD.id = a.id
LEFT JOIN ReasonData RD ON RD.id = a.id
 WHERE a.id_user_mechanic ='${id_user_mechanic}' AND b.factory='${factory}' and (status = 4 or  status = 6)
GROUP BY a.id, a.id_machine, a.id_user_request, a.date_user_request,
    a.id_user_mechanic, a.date_cfm_mechanic, a.date_mechanic_cfm_onsite,
    a.date_mechanic_cfm_finished, a.status, b.floor,
    a.remark,a.other_reason, a.id_owner_mechanic, a.date_asign_task, a.factory,
    a.fixer,a.remark_mechanic, a.skill_cfm, a.other_skill,b.name,info_reason_vn,info_reason_en,info_reason_mm,info_skill_mm,info_skill_en,info_skill_vn
   ORDER BY a.date_user_request DESC`
    );

    return rs.recordset || null;
  } catch (error) {
    return null;
  }
};
exports.getTaskhistoryForDasboard = async ({
  id_user_mechanic,
  factory,
  condition,
}) => {
  try {
    const rs = await db.Execute(
      `SELECT a.id_machine,a.id_user_mechanic,convert(date,a.date_user_request) as date_user_request, isnull( RIGHT('0' + CONVERT(VARCHAR(10), avg(datediff(SECOND,a.date_mechanic_cfm_onsite,a.date_mechanic_cfm_finished)) / 60), 2) + ':' + RIGHT('0' + CONVERT(VARCHAR(2), avg(datediff(SECOND,a.date_mechanic_cfm_onsite,a.date_mechanic_cfm_finished)) % 60), 2),0) as avgTime,ISNULL(a.skill_cfm,'23') skill_cfm, a.other_skill
      FROM DT_task_detail a 
      LEFT JOIN DT_user_manager ON DT_user_manager.user_name = a.id_user_mechanic
      WHERE  a.id_user_mechanic ='${id_user_mechanic}'  AND DT_user_manager.factory='${factory}' and (status = 4 or  status = 6) ${condition}
      group by a.id_machine,a.id_user_mechanic,a.date_mechanic_cfm_onsite,a.date_mechanic_cfm_finished,a.skill_cfm,a.date_user_request, a.other_skill
      order by a.date_mechanic_cfm_onsite
      `
    );
    // console.log( `SELECT a.id_machine,a.id_user_mechanic,convert(date,a.date_user_request) as date_user_request, isnull( RIGHT('0' + CONVERT(VARCHAR(10), avg(datediff(SECOND,a.date_mechanic_cfm_onsite,a.date_mechanic_cfm_finished)) / 60), 2) + ':' + RIGHT('0' + CONVERT(VARCHAR(2), avg(datediff(SECOND,a.date_mechanic_cfm_onsite,a.date_mechanic_cfm_finished)) % 60), 2),0) as avgTime,ISNULL(a.skill_cfm,'23') skill_cfm
    //   FROM DT_task_detail a
    //   LEFT JOIN DT_user_manager ON DT_user_manager.user_name = a.id_user_mechanic
    //   WHERE  a.id_user_mechanic ='${id_user_mechanic}'  AND DT_user_manager.factory='${factory}' and (status = 4 or  status = 6) ${condition}
    //   group by a.id_machine,a.id_user_mechanic,a.date_mechanic_cfm_onsite,a.date_mechanic_cfm_finished,a.skill_cfm,a.date_user_request
    //   order by a.date_mechanic_cfm_onsite
    //   `)

    return rs.recordset || null;
  } catch (error) {
    return null;
  }
};
exports.getListmechanic = async ({ floor, factory }) => {
  try {
    const rs = await db.Execute(
      `SELECT * FROM DT_user_manager  WHERE  DT_user_manager.permission = 1 and  DT_user_manager.floor= '${floor}' and factory = '${factory}'`
    );

    return rs.recordset || null;
  } catch (error) {
    return null;
  }
};
exports.getInfoCalcu = async ({ id_user_mechanic, factory, condition }) => {
  try {
    const rs = await db.Execute(
      `	 select  isnull( RIGHT('0' + CONVERT(VARCHAR(10), avg(datediff(SECOND,date_mechanic_cfm_onsite,date_mechanic_cfm_finished)) / 60), 2) + ':' + RIGHT('0' + CONVERT(VARCHAR(2), avg(datediff(SECOND,date_mechanic_cfm_onsite,date_mechanic_cfm_finished)) % 60), 2),0) as avgTime,
      (count(date_mechanic_cfm_finished) ) as totalFix from DT_task_detail
      where id_user_mechanic = '${id_user_mechanic}' and factory ='${factory}' ${condition}`
    );

    return rs.recordset[0] || null;
  } catch (error) {
    return null;
  }
};
exports.getInfoStaff = async ({
  id_user_mechanic,
  factory,
  position,
  lean,
  floor,
  floors,
}) => {
  try {
    // console.log(`select * from DT_user_manager
    // where  factory = '${factory}' and lean ='${lean}' AND floor like '${floor}%' and floors = '${floors}'   AND position >= ${position}`);
    const rs = await db.Execute(
      `select * from DT_user_manager
      where  factory = '${factory}' and lean ='${lean}' AND ','+floor+',' like '%,${floor},%'   AND position >= ${position}`
    );

    return rs.recordset || null;
  } catch (error) {
    return null;
  }
};
exports.getTaskinf = async ({ usermechanic, idmachine, factory, fixer }) => {
  try {
    console.log(
      `SELECT * FROM DT_task_detail WHERE id_user_mechanic ='${usermechanic}' and id_machine = '${idmachine}' and factory ='${factory}' and fixer like '%${fixer}%' `
    );
    let query = "";
    if (factory === "LYV" || factory === "LVL" || factory === "LHG") {
      query = `SELECT * FROM DT_task_detail WHERE --id_user_mechanic ='${usermechanic}' and 
      id_machine = '${idmachine}' and factory ='${factory}' and fixer like '%${fixer}%' and status < 4`;
    } else {
      query = `SELECT * FROM DT_task_detail WHERE id_user_mechanic ='${usermechanic}' and 
      id_machine = '${idmachine}' and factory ='${factory}' and fixer like '%${fixer}%' and status < 4`;
    }
    // console.log(query);
    // console.log(query);
    const rs = await db.Execute(query);
    return rs.recordset[0] || null;
  } catch (error) {
    return null;
  }
};
exports.getTaskinfss = async ({ usermechanic, idmachine, factory, fixer }) => {
  try {
    // console.log(
    //   `SELECT * FROM DT_task_detail WHERE id_user_mechanic ='${usermechanic}' and id_machine = '${idmachine}' and factory ='${factory}' and fixer like '%${fixer}%' `
    // );
    const rs = await db.Execute(
      `SELECT * FROM DT_task_detail WHERE id_user_mechanic ='${usermechanic}' and id_machine = '${idmachine}' and factory ='${factory}' and fixer like '%${fixer}%'  AND status = 3`
    );

    return rs.recordset[0] || null;
  } catch (error) {
    return null;
  }
};
exports.getTaskinfs = async ({ usermechanic, idmachine, factory, fixer }) => {
  try {
    // console.log(
    //   `SELECT * FROM DT_task_detail WHERE id_owner_mechanic ='${usermechanic}' and id_machine = '${idmachine}' and factory ='${factory}' and fixer like '%${fixer}%' `
    // );
    const rs = await db.Execute(
      `SELECT * FROM DT_task_detail WHERE id_owner_mechanic ='${usermechanic}' and id_machine = '${idmachine}' and factory ='${factory}' and fixer like '%${fixer}%' `
    );
    // console.log(
    //     `SELECT * FROM DT_task_detail WHERE id_owner_mechanic ='${usermechanic}' and id_machine = '${idmachine}' and factory ='${factory}' and fixer like '%${fixer}%' `
    // );

    return rs.recordset[0] || null;
  } catch (error) {
    return null;
  }
};
exports.getTaskinfo = async ({ usermechanic, idmachine, factory, fixer }) => {
  try {
    // console.log(
    //   `SELECT * FROM DT_task_detail WHERE id_owner_mechanic ='${usermechanic}' and id_machine = '${idmachine}' and factory ='${factory}' and fixer like '%${fixer}%' `
    // );
    const rs = await db.Execute(
      `SELECT * FROM DT_task_detail WHERE id_user_mechanic ='${usermechanic}' and id_machine = '${idmachine}' and factory ='${factory}' and fixer like '%${fixer}%' AND status=1 `
    );
    // console.log(
    //     `SELECT * FROM DT_task_detail WHERE id_owner_mechanic ='${usermechanic}' and id_machine = '${idmachine}' and factory ='${factory}' and fixer like '%${fixer}%' `
    // );

    return rs.recordset[0] || null;
  } catch (error) {
    return null;
  }
};
exports.getTaskinfuser = async (condition) => {
  try {
    const rs = await db.Execute(
      `SELECT * FROM DT_task_detail WHERE ${condition}`
    );

    return rs.recordset[0] || null;
  } catch (error) {
    return null;
  }
};
exports.getSkillInfo = async () => {
  try {
    const rs = await db.Execute(`SELECT * FROM DT_info_skill`);
    return rs.recordset || null;
  } catch (error) {
    return null;
  }
};

exports.ownerAssignTask = async ({
  usermechanic,
  id_user_owner,
  idmachine,
  factory,
  fixer,
}) => {
  try {
    // console.log(
    //   `UPDATE DT_task_detail SET id_user_mechanic = null, id_owner_mechanic ='${id_user_owner}',date_asign_task= GETDATE() WHERE  id_machine = '${idmachine}' and factory = '${factory}' and fixer ='${fixer}'  and  date_mechanic_cfm_finished is null and date_mechanic_cfm_onsite is null `
    // );
    return await db.Execute(
      `UPDATE DT_task_detail SET id_user_mechanic = null, id_owner_mechanic ='${id_user_owner}',date_asign_task= GETDATE() WHERE  id_machine = '${idmachine}' and 
      factory = '${factory}' and fixer ='${fixer}'  and  (date_mechanic_cfm_finished is null and date_mechanic_cfm_onsite is null and date_cfm_mechanic is null)`
    );
  } catch (error) {
    return null;
  }
};
// giao phó cho thợ
exports.ownerAssignTaskManual = async ({
  usermechanic,
  id_user_owner,
  idmachine,
  factory,
  fixer,
}) => {
  try {
    const rs = await db.Execute(
      `UPDATE DT_task_detail SET id_user_mechanic = '${usermechanic}', id_owner_mechanic ='${id_user_owner}',date_asign_task= GETDATE(),date_cfm_mechanic = null WHERE  id_machine = '${idmachine}' and factory = '${factory}' and fixer ='${fixer}' and  date_mechanic_cfm_finished is null and date_mechanic_cfm_onsite is null `
    );
    // oldversion
    // const rs = await db.Execute(
    //   `UPDATE DT_task_detail SET id_user_mechanic = '${usermechanic}', id_owner_mechanic ='${id_user_owner}',date_asign_task= GETDATE(),date_cfm_mechanic = GETDATE() WHERE  id_machine = '${idmachine}' and factory = '${factory}' and fixer ='${fixer}' and  date_mechanic_cfm_finished is null and date_mechanic_cfm_onsite is null `
    // );
    // console.log(`UPDATE DT_task_detail SET id_user_mechanic = '${usermechanic}', id_owner_mechanic ='${id_user_owner}',date_asign_task= GETDATE(),date_cfm_mechanic = null WHERE  id_machine = '${idmachine}' and factory = '${factory}' and fixer ='${fixer}' and  date_mechanic_cfm_finished is null and date_mechanic_cfm_onsite is null `)
    return rs || null;
  } catch (error) {
    return null;
  }
};

//xác nhận sửa chữa
exports.assignTask = async ({
  usermechanic,
  cfm_status,
  idmachine,
  factory,
  fixer,
}) => {
  try {
    if (cfm_status == 2) {
      if (factory === "LYV" || factory === "LVL" || factory === "LHG") {
        return await db.Execute(
          `UPDATE DT_task_detail SET date_cfm_mechanic = GETDATE(), status = 2, id_user_mechanic = '${usermechanic}' WHERE  id_machine = '${idmachine}' and factory = '${factory}' 
        and status = 1  and date_cfm_mechanic is null  and fixer = '${fixer}'`
        );
      } else {
        return await db.Execute(
          `UPDATE DT_task_detail SET date_cfm_mechanic = GETDATE(), status = 2, id_user_mechanic = '${usermechanic}' WHERE  id_machine = '${idmachine}' and factory = '${factory}' 
                and id_user_mechanic = '${usermechanic}'   and fixer = '${fixer}'
              and status = 1  and date_cfm_mechanic is null  `
        );
      }
    }
    if (cfm_status == 3) {
      return await db.Execute(
        `UPDATE DT_task_detail SET date_mechanic_cfm_onsite = GETDATE(), status =3 WHERE  id_machine = '${idmachine}' and fixer = '${fixer}'  and factory = '${factory}' and id_user_mechanic = '${usermechanic}' and date_mechanic_cfm_onsite is null and status=2`
      );
    }
  } catch (error) {
    return null;
  }
};
//thợ sửa từ chối sửa chữa
exports.cfmDeclineTask = async ({
  usermechanic,
  cfm_status,
  idmachine,
  factory,
  fixer,
  owner,
}) => {
  try {
    console.log(
      `UPDATE DT_task_detail SET id_owner_mechanic= '${owner}',date_asign_task = GETDATE(), status = ${cfm_status},id_user_mechanic = null WHERE  id_machine = '${idmachine}' and factory = '${factory}' and fixer = '${fixer}' and id_user_mechanic = '${usermechanic}' 
      and (date_mechanic_cfm_finished is null and date_mechanic_cfm_onsite is null and date_cfm_mechanic is null) `
    );
    return await db.Execute(
      `UPDATE DT_task_detail SET id_owner_mechanic= '${owner}',date_asign_task = GETDATE(), status = ${cfm_status},id_user_mechanic = null WHERE  id_machine = '${idmachine}' and factory = '${factory}' and fixer = '${fixer}' and status =1  --and id_user_mechanic = '${usermechanic}' 
      and  (date_mechanic_cfm_finished is null and date_mechanic_cfm_onsite is null and date_cfm_mechanic is null) `
    );
  } catch (error) {
    return null;
  }
};
//Xác nhận hoàn thành
exports.cfmFinishTask = async ({
  usermechanic,
  otherIssue,
  idmachine,
  factory,
  remark,
  fixer,
  skill,
}) => {
  try {
    // if (cfm_status == 4) {
    orther = "";
    if (otherIssue) {
      orther = ` , other_skill =N'${otherIssue}'`;
    }
    console.log(`UPDATE DT_task_detail SET date_mechanic_cfm_finished = GETDATE() ${orther}

      ,status =4,remark_mechanic = N'${remark}',skill_cfm ='${skill}' WHERE  id_machine = '${idmachine}' and factory = '${factory}' and fixer = '${fixer}' and id_user_mechanic = '${usermechanic}' and date_mechanic_cfm_finished is null `);
    return await db.Execute(
      `UPDATE DT_task_detail SET date_mechanic_cfm_finished = GETDATE() ${orther}

      ,status =4,remark_mechanic = N'${remark}',skill_cfm ='${skill}' WHERE  id_machine = '${idmachine}' and factory = '${factory}' and fixer = '${fixer}' and id_user_mechanic = '${usermechanic}' and date_mechanic_cfm_finished is null `
    );

    // } else if (cfm_status == 6) {
    //   return await db.Execute(
    //     `UPDATE DT_task_detail SET date_mechanic_cfm_finished = GETDATE(), status = ${cfm_status},remark_mechanic = N'${remark}' WHERE   id_machine = '${idmachine}' and factory = '${factory}' and fixer = '${fixer}' and id_user_mechanic = '${usermechanic}'`
    //   );
    // }
  } catch (error) {
    return null;
  }
};

exports.cfmFinishTaskEP2 = async ({
  usermechanic,
  // cfm_status,
  new_mechanic,
  idmachine,
  factory,
  remark,
  fixer,
  skill,
  other_skill,
}) => {
  try {
    let orther = "";
    if (other_skill) {
      orther = ` , other_skill =N'${other_skill}'`;
    }
    const newmachine = skill.includes("4") ? new_mechanic : "NULL";
    // console.log(`UPDATE DT_task_detail SET date_mechanic_cfm_finished = GETDATE(), status=4,remark_mechanic = N'${remark}',skill_cfm ='${skill}' ${orther}  , newmachine='${new_mechanic}'
    //   WHERE  id_machine = '${idmachine}' and factory = '${factory}' and fixer = '${fixer}' and id_user_mechanic = '${usermechanic}' and date_mechanic_cfm_finished is null `);
    // if (cfm_status == 4) {
    return await db.Execute(
      `UPDATE DT_task_detail SET date_mechanic_cfm_finished = GETDATE(), status=4,remark_mechanic = N'${remark}',skill_cfm ='${skill}' ${orther}  , newmachine='${new_mechanic}' 
      WHERE  id_machine = '${idmachine}' and factory = '${factory}' and fixer = '${fixer}' and id_user_mechanic = '${usermechanic}' and date_mechanic_cfm_finished is null `
    );
    // } else if (cfm_status == 6) {
    //   return await db.Execute(
    //     `UPDATE DT_task_detail SET date_mechanic_cfm_finished = GETDATE(), status = ${cfm_status},remark_mechanic = N'${remark}' WHERE   id_machine = '${idmachine}' and factory = '${factory}' and fixer = '${fixer}' and id_user_mechanic = '${usermechanic}'`
    //   );
    // }
  } catch (error) {
    return null;
  }
};

exports.getListMechanicLYV = async ({ id_request, lean, factory }) => {
  try {
    let query = ` DECLARE @floor Varchar(30);
    SELECT  @floor= floor FROM DT_user_manager where user_name='${id_request}'
     SELECT * FROM DT_user_manager WHERE ','+floor+',' LIKE '%,'+@floor+',%' and permission between 1 and 2 and lean='${lean}' and factory='${factory}'`;
    const rs = await db.Execute(query);

    return rs.recordset || null;
  } catch (error) {
    return null;
  }
};

exports.getListStatusTask = async ({
  floor,
  factory,
  lean,
  fromDate,
  toDate,
}) => {
  try {
    //     let query = `  SELECT a.id,c.line, c.floor, a.id_machine,M.Name_vn,M.Name_en,
    //  a.remark, a.status,
    //     (SELECT STRING_AGG( ir1.info_reason_vn, ', ')  FROM DT_info_reason ir1
    //         WHERE ',' + a.remark + ',' LIKE '%,' + CAST(ir1.id AS VARCHAR) + ',%') AS info_reason_vn,
    //     (SELECT STRING_AGG( ir1.info_reason_en, ', ')  FROM DT_info_reason ir1
    //         WHERE ',' + a.remark + ',' LIKE '%,' + CAST(ir1.id AS VARCHAR) + ',%') AS info_reason_en,
    //     (SELECT STRING_AGG( ir1.info_reason_mm, ', ')  FROM DT_info_reason ir1
    //         WHERE ',' + a.remark + ',' LIKE '%,' + CAST(ir1.id AS VARCHAR) + ',%') AS info_reason_mm,
    //  a.id_user_request, c.name as Req_name,
    //  a.id_user_mechanic, b.name AS name_mechanic,
    //  a.date_user_request, a.date_cfm_mechanic, a.date_mechanic_cfm_onsite, a.date_mechanic_cfm_finished,
    //    a.skill_cfm,
    //     (SELECT STRING_AGG( is1.info_skill_mm, ', ') FROM DT_info_skill is1
    //         WHERE ',' + a.skill_cfm + ',' LIKE '%,' + CAST(is1.id AS VARCHAR) + ',%') AS info_skill_mm,
    //     (SELECT STRING_AGG( is1.info_skill_en, ', ') FROM DT_info_skill is1
    //         WHERE ',' + a.skill_cfm + ',' LIKE '%,' + CAST(is1.id AS VARCHAR) + ',%') AS info_skill_en,
    //     (SELECT STRING_AGG( is1.info_skill_vn, ', ')  FROM DT_info_skill is1
    //         WHERE ',' + a.skill_cfm + ',' LIKE '%,' + CAST(is1.id AS VARCHAR) + ',%') AS info_skill_vn,
    //     a.id_owner_mechanic, a.date_asign_task, a.remark_mechanic, MAX(newmachine) newmachine
    // FROM  DT_task_detail AS a
    // LEFT JOIN DT_user_manager AS b ON b.user_name = a.id_user_mechanic
    // LEFT JOIN DT_user_manager AS c ON c.user_name = a.id_user_request
    // LEFT JOIN DT_machine M ON a.id_machine= M.ID_Code

    //  WHERE  (( a.status =1 AND a.id_owner_mechanic IS NULL) OR (a.status >=2 )) AND
    //   b.factory='${factory}' AND a.fixer='${lean}'
    //   AND  ',${floor},' LIKE '%,'+b.floor +',%' --floor chủ quản
    //   --AND CONVERT(DATE, a.date_asign_task) BETWEEN CONVERT(DATE,'') AND CONVERT(DATE,'')
    //   `;
    //     if (fromDate && toDate) {
    //       query += ` AND CONVERT(DATE, a.date_asign_task) BETWEEN CONVERT(DATE,'${fromDate}') AND CONVERT(DATE,'${toDate}')`;
    //     }

    //     query += ` GROUP BY  a.id, a.id_machine, a.id_user_request, a.date_user_request,
    //     a.id_user_mechanic, a.date_cfm_mechanic, a.date_mechanic_cfm_onsite,
    //     a.date_mechanic_cfm_finished, a.remark, a.status,
    // 	a.id_owner_mechanic, a.date_asign_task, a.factory,
    //     a.fixer,a.remark_mechanic, a.skill_cfm,b.name,c.line, c.floor, M.Name_vn,M.Name_en,c.name
    //     order by a.status`;

    let query = ``;
    if (fromDate && toDate) {
      query += ` DECLARE @formDate DATE, @toDate DATE;
      SET @formDate = '${fromDate}';
      SET @toDate = '${toDate}';
      `;
    }

    query += `
 ;WITH ReasonData AS (
    SELECT TD.id, STRING_AGG(info_reason_vn, ', ') AS info_reason_vn, STRING_AGG(info_reason_en, ', ') AS info_reason_en, STRING_AGG(info_reason_mm, ', ') AS info_reason_mm
    FROM DT_task_detail TD LEFT JOIN DT_info_reason ir ON ',' + TD.remark + ',' LIKE '%,' + CAST(ir.id AS VARCHAR) + ',%'
    WHERE TD.factory = '${factory}' AND CONVERT(DATE, TD.date_asign_task) BETWEEN @formDate AND @toDate AND TD.fixer='${lean}' GROUP BY TD.id),
SkillData AS (SELECT TD.id, STRING_AGG(info_skill_vn, ', ') AS info_skill_vn, STRING_AGG(info_skill_en, ', ') AS info_skill_en, STRING_AGG(info_skill_mm, ', ') AS info_skill_mm
    FROM DT_task_detail TD LEFT JOIN DT_info_skill is1 ON ',' + TD.skill_cfm + ',' LIKE '%,' + CAST(is1.id AS VARCHAR) + ',%'
    WHERE TD.factory = '${factory}' AND CONVERT(DATE, TD.date_asign_task) BETWEEN @formDate AND @toDate AND TD.fixer='${lean}'
    GROUP BY TD.id)
  SELECT a.id,c.line, c.floor, a.id_machine,MAX(mac.Custom_machine_Name) Name_vn,MAX(mac.Custom_machine_Name) Name_en,
 a.remark, a.status,
	MAX(info_reason_vn)	info_reason_vn,
	MAX(info_reason_en) info_reason_en,
	MAX(info_reason_mm) info_reason_mm,
 a.id_user_request, c.name as Req_name,
 a.id_user_mechanic, b.name AS name_mechanic,
 a.date_user_request, a.date_cfm_mechanic, a.date_mechanic_cfm_onsite, a.date_mechanic_cfm_finished,
   a.skill_cfm, 
   MAX(info_skill_mm) info_skill_mm,
   MAX(info_skill_en) info_skill_en,
   MAX(info_skill_vn) info_skill_vn,
    a.id_owner_mechanic, a.date_asign_task, a.remark_mechanic, MAX(newmachine) newmachine
FROM  DT_task_detail AS a
LEFT JOIN DT_user_manager AS b ON b.user_name = a.id_user_mechanic
LEFT JOIN DT_user_manager AS c ON c.user_name = a.id_user_request
LEFT JOIN [Machine].[Machine].dbo.LYG_Machine_Data mac ON REPLACE(TRANSLATE(mac.Asset_No, ' -_.,/?', '       '), ' ', '')  = REPLACE(TRANSLATE(a.id_machine, ' -_.,/?', '       '), ' ', '')
LEFT JOIN SkillData SD ON SD.id = a.id
LEFT JOIN ReasonData RD ON RD.id = a.id

 WHERE  (( a.status =1 AND a.id_owner_mechanic IS NULL) OR (a.status >=2 )) AND
  b.factory='${factory}' AND a.fixer='${lean}'   AND  ',${floor},' LIKE '%,'+b.floor +',%' 
  `;
    if (fromDate && toDate) {
      query += `  AND CONVERT(DATE, a.date_asign_task)  BETWEEN @formDate AND @toDate`;
    }

    query += ` GROUP BY  a.id, a.id_machine, a.id_user_request, a.date_user_request,
    a.id_user_mechanic, a.date_cfm_mechanic, a.date_mechanic_cfm_onsite,
    a.date_mechanic_cfm_finished, a.remark, a.status,
        a.id_owner_mechanic, a.date_asign_task, a.factory,
    a.fixer,a.remark_mechanic, a.skill_cfm,b.name,c.line, c.floor, --M.Name_vn,M.Name_en,
	c.name order by a.status
`;

    // console.log(query);
    const rs = await db.Execute(query);

    return rs.recordset || null;
  } catch (error) {
    return null;
  }
};

exports.getCountTask = async ({ floor, factory, lean, fromDate, toDate }) => {
  try {
    let query = `  	SELECT 
    SUM(CASE WHEN a.status = 2 THEN 1 ELSE 0 END) AS waiting, 
    SUM(CASE WHEN a.status = 3 THEN 1 ELSE 0 END) AS doing, 
    SUM(CASE WHEN a.status = 4 THEN 1 ELSE 0 END) AS finish
FROM 
    DT_task_detail AS a 
LEFT JOIN 
    DT_user_manager AS c ON c.user_name = a.id_user_request
WHERE 
    a.factory = '${factory}' 
    AND a.fixer = '${lean}' 
    AND ',${floor},' LIKE '%,' + c.floor + ',%'`;

    if (fromDate && toDate) {
      query += ` AND CONVERT(DATE, a.date_asign_task) BETWEEN CONVERT(DATE,'${fromDate}') AND CONVERT(DATE,'${toDate}')`;
    }

    // console.log(query);
    const rs = await db.Execute(query);

    return rs.recordset[0] || null;
  } catch (error) {
    return null;
  }
};

exports.getRepairedMechanic = async ({ floor, factory, lean, time }) => {
  try {
    let newTime = "DAYOFYEAR";
    if (time.toUpperCase() === "WEEK" || time.toUpperCase() === "MONTH") {
      newTime = time.toUpperCase();
    }
    //     let query = `
    //     WITH FrequencyCounts AS (SELECT id_machine,DATEPART(${newTime}, date_user_request) AS WeekNumber, COUNT(1) AS FreCount
    //     FROM DT_task_detail
    //     WHERE status = 4 GROUP BY id_machine, DATEPART(${newTime}, date_user_request)
    // ),AVGFrequency AS (
    //     SELECT id_machine,AVG(FreCount) AS AvGFreCount FROM FrequencyCounts
    //     GROUP BY id_machine
    // )
    //     SELECT  Name_vn,Name_en,ID_Code, TD.id_machine,REQ.floor, REQ.line,
    // Alltimes = (SELECT COUNT(1) FROM DT_task_detail WHERE DT_task_detail.id_machine = TD.id_machine AND status=4),
    // SUM(CAST(ROUND(datediff(MINUTE,date_mechanic_cfm_onsite,date_mechanic_cfm_finished),2) as float)) SumMinute,
    // AvGFreCount Frequency,
    // STRING_AGG( TD.[remark], ',') reason
    // FROM DT_task_detail TD
    // LEFT JOIN DT_machine M ON M.ID_Code = TD.id_machine
    // JOIN DT_user_manager REQ ON TD.id_user_request = REQ.user_name
    // LEFT JOIN AVGFrequency AG ON AG.id_machine= TD.id_machine
    // WHERE  ',${floor},' LIKE '%,'+REQ.floor +',%' -- AND  ',${floor},'  LIKE '%,'+REQ.floor +',%'
    //  and TD.factory='${factory}' and fixer='${lean}' and status=4
    // AND DATEPART(${newTime}, date_asign_task) = DATEPART(${newTime}, GETDATE())
    //   GROUP BY Name_vn,Name_en,ID_Code,TD.id_machine, REQ.floor,REQ.floors, REQ.line,status,TD.factory,AvGFreCount
    //     order by Name_vn, REQ.floor, REQ.line
    // `;

    //   if(fromDate && toDate){
    // query+= ` AND CONVERT(DATE, a.date_user_request) BETWEEN CONVERT(DATE,'${fromDate}') AND CONVERT(DATE,'${toDate}')`;
    // }

    let query = `
   WITH FrequencyCounts AS (
	SELECT id_machine,DATEPART(MONTH, date_user_request) AS WeekNumber, COUNT(1) AS FreCount
    FROM DT_task_detail WHERE status = 4 GROUP BY id_machine, DATEPART(MONTH, date_user_request)
),AVGFrequency AS (
    SELECT id_machine,AVG(FreCount) AS AvGFreCount FROM FrequencyCounts GROUP BY id_machine
),
   Alltimes AS (SELECT id_machine,COUNT(1) alltime FROM DT_task_detail WHERE  status=4   AND factory='${factory}' GROUP BY id_machine)
SELECT  Custom_machine_Name Name_vn, Custom_machine_Name Name_en, Asset_No ID_Code, TD.id_machine,REQ.floor, REQ.line,	MAX(alltime) Alltimes,
	SUM(CAST(ROUND(datediff(MINUTE,date_mechanic_cfm_onsite,date_mechanic_cfm_finished),2) as float)) SumMinute, AvGFreCount Frequency,STRING_AGG( TD.[remark], ',') reason
FROM DT_task_detail TD
LEFT JOIN [Machine].[Machine].dbo.LYG_Machine_Data M ON M.Asset_No = TD.id_machine
JOIN DT_user_manager REQ ON TD.id_user_request = REQ.user_name
JOIN Alltimes AL ON AL.id_machine=TD.id_machine
LEFT JOIN AVGFrequency AG ON AG.id_machine= TD.id_machine
WHERE  ',${floor},' LIKE '%,'+REQ.floor +',%' -- AND  ',${floor},'  LIKE '%,'+REQ.floor +',%'
 and TD.factory='${factory}' and fixer='${lean}' and TD.status=4
AND DATEPART(${newTime}, date_asign_task) = DATEPART(${newTime}, GETDATE())
  GROUP BY Custom_machine_Name, Asset_No,TD.id_machine, REQ.floor,REQ.floors, REQ.line,TD.status,TD.factory,AvGFreCount
    order by Custom_machine_Name, REQ.floor, REQ.line`;

    //console.log(query);
    const rs = await db.Execute(query);

    return rs.recordset || null;
  } catch (error) {
    return null;
  }
};

exports.TurnOnOffAlarm = async ({ line, factory, status, seg }) => {
  try {
    let query = ` UPDATE [data_Devices_Downtime] SET  [seg] = ${seg},  [status] = '${status}' WHERE 
      [Factory] = '${factory}' AND [Line] ='${line}' 
      
      `;
    //   console.log(` UPDATE [data_Devices_Downtime] SET [seg] = ${seg} ,[status] = '${status}'  WHERE
    // [Factory] = '${factory}' AND [Line] ='${line}'  AND (SELECT  COUNT(1)
    //         FROM DT_task_detail TD
    //         JOIN DT_user_manager UM ON TD.id_user_request = UM.user_name
    //         WHERE status = 1 AND UM.line = '${line}' AND CONVERT(DATE, date_user_request) = CONVERT(DATE, GETDATE())) <= 0

    // `);
    if (status === "off") {
      query += ` AND (SELECT  COUNT(1)
          FROM DT_task_detail TD
          JOIN DT_user_manager UM ON TD.id_user_request = UM.user_name
          WHERE status = 1 AND UM.line = '${line}' AND CONVERT(DATE, date_user_request) = CONVERT(DATE, GETDATE())) <= 0
       `;
    }
    return await db.Execute(query);
  } catch (error) {
    return null;
  }
};

exports.getReasonInfo = async ({ reasonString }) => {
  try {
    let query = ` SELECT 
    STRING_AGG([info_reason_mm], ',') [info_reason_mm], 
    STRING_AGG([info_reason_en], ',') [info_reason_en], 
    STRING_AGG([info_reason_vn], ',') [info_reason_vn]
  FROM [EIP].[dbo].[DT_info_reason]
  where '%,${reasonString},%' LIKE '%,'+CAST([id] as varchar)+',%' 	`;

    // console.log(query);
    const rs = await db.Execute(query);

    return rs.recordset[0] || null;
  } catch (error) {
    return null;
  }
};

exports.getRepairedMechanicLineChart = async ({
  floor,
  factory,
  lean,
  time,
}) => {
  try {
    let newTime = "DAYOFYEAR";
    if (time.toUpperCase() === "WEEK" || time.toUpperCase() === "MONTH") {
      newTime = time.toUpperCase();
    }
    let query = `
   SELECT TOP 5
    id_machine,
SUM(CAST(DATEDIFF(SECOND, date_mechanic_cfm_onsite, date_mechanic_cfm_finished) / 60.0 AS FLOAT)) AS [Minutes]
FROM 
      DT_task_detail TD JOIN DT_user_manager REQ ON TD.id_user_request = REQ.user_name
WHERE
    TD.factory = '${factory}'
    AND status = 4 and fixer='${lean}' 
    and  ',${floor},' LIKE '%,'+REQ.floor +',%' -- AND  ',${floor},'  LIKE '%,'+REQ.floor +',%'
AND( DATEPART(${newTime}, date_user_request) = DATEPART(${newTime}, GETDATE()) OR  DATEPART(${newTime}, date_mechanic_cfm_finished) = DATEPART(${newTime}, GETDATE()) )
GROUP BY 
    id_machine
	HAVING SUM(CAST(DATEDIFF(SECOND, date_mechanic_cfm_onsite, date_mechanic_cfm_finished) / 60.0 AS FLOAT))  > 0
	order by SUM(CAST(DATEDIFF(SECOND, date_mechanic_cfm_onsite, date_mechanic_cfm_finished) / 60.0 AS FLOAT))  DESC
`;
    //console.log(query);

    const rs = await db.Execute(query);

    return rs.recordset || null;
  } catch (error) {
    return null;
  }
};

exports.getDTsupport = async ({ user_machine, factory, line }) => {
  try {
    const rs = await db.Execute(
      `SELECT * FROM [DT_support] 
      WHERE [id_user_machine]  = '${user_machine}' 
       and factory='${factory}' AND Line ='${line}' 
       and ([date_cfm] is null OR [date_finish] is null) `
    );

    return rs.recordset[0] || null;
  } catch (error) {
    return null;
  }
};
exports.getRepairedMechanicPieChart = async ({
  floor,
  factory,
  lean,
  time,
}) => {
  try {
    let newTime = "DAYOFYEAR";
    if (time.toUpperCase() === "WEEK" || time.toUpperCase() === "MONTH") {
      newTime = time.toUpperCase();
    }
    let query = `
SELECT TOP (3) id_machine, COUNT(1) Time   
FROM 
    DT_task_detail TD JOIN DT_user_manager REQ ON TD.id_user_request = REQ.user_name
WHERE
    TD.factory =  '${factory}'
    AND status = 4
    and fixer='${lean}' 
    and  ',${floor},' LIKE '%,'+REQ.floor +',%' -- AND  ',${floor},'  LIKE '%,'+REQ.floor +',%'
  AND( DATEPART(${newTime}, date_user_request) = DATEPART(${newTime}, GETDATE()) OR  DATEPART(${newTime}, date_mechanic_cfm_finished) = DATEPART(${newTime}, GETDATE()) )
  GROUP BY id_machine
  ORDER BY COUNT(1)  DESC;
`;
    //console.log(query);

    const rs = await db.Execute(query);

    return rs.recordset || null;
  } catch (error) {
    return null;
  }
};

exports.createDTSupport = async ({
  id,
  floor,
  factory,
  line,
  status,
  user_machine,
  user_owner,
  remark,
  id_task,
  name_machine,
  support_detail,
}) => {
  try {
    //console.log(`INSERT INTO DT_support ([id_user_owner], [id_user_machine],[factory],[floor],[Line],[Remark],[status],[date_request],[modify_date],[id_task], [name_machine]) 
     // VALUES ('${user_owner}','${user_machine}','${factory}','','${line}',N'${remark}','1',GETDATE(),GETDATE(),'${id_task}', '${name_machine}' )`);
    const rs = await db.Execute(
      `INSERT INTO DT_support ([id_user_owner], [id_user_machine],[factory],[floor],[Line],[Remark],[status],[date_request],[modify_date],[id_task], [name_machine]) 
      VALUES ('${user_owner}','${user_machine}','${factory}','','${line}',N'${remark}','1',GETDATE(),GETDATE(),'${id_task}', '${name_machine}' )`
    );

    return rs || null;
  } catch (e) {
    return null;
  }
};

exports.UpdateDTSupport = async ({
  id,
  factory,
  line,
  status,
  user_machine,
  support_detail,
}) => {
  try {
    let query = `
      UPDATE DT_support 
      SET date_cfm = GETDATE(), modify_date = GETDATE() , status='${status}'
      WHERE id = '${id}' AND id_user_machine = '${user_machine}' AND factory = '${factory}'
    `;

    if (status === 3) {
      query = `
        UPDATE DT_support 
        SET [date_finish] = GETDATE(), support_detail = N'${support_detail}', modify_date = GETDATE() , status='${status}'
        WHERE id = '${id}' AND id_user_machine = '${user_machine}' AND factory = '${factory}'
      `;
    } else if (status === 5) {
      query = `
      UPDATE DT_support 
      SET date_cfm = GETDATE(), [date_finish] = GETDATE(),  modify_date = GETDATE() , status='${status}'
      WHERE id = '${id}' AND id_user_machine = '${user_machine}' AND factory = '${factory}'
    `;
    }

    const result = await db.Execute(query);
    return result || null;
  } catch (e) {
    console.error("Error updating DT_support:", e); // Log lỗi để dễ debug
    return null;
  }
};

exports.getTaskinformecha = async ({ id_user_mechanic, factory, fixer }) => {
  try {
    let query = "";
    if (factory.trim() !== "LYM") {
      query = `	
      DECLARE  @floor NVARCHAR(30), @floors NVARCHAR(30);
SELECT @floor=floor, @floors=floors FROM DT_user_manager where user_name='${id_user_mechanic}' and factory='${factory}' 
      SELECT TD.factory, fixer, UM.floor Floor_Machine,  REQ.floor, MAX(REQ.name) name_userrq, MAX(REQ.lean) lean_req,MAX(REQ.line) line_req,
	  --  REQ.floor, MAX(REQ.name) name_userrq, MAX(REQ.lean) lean_req,
      UM.floors--, UM.lean
      ,UM.name, TD.id id_task, id_machine, id_owner_mechanic, id_user_mechanic,
           id_user_request,
           UM.permission, UM.position, TD.remark,TD.other_reason, TD.remark_mechanic, TD.skill_cfm, status, TD.date_user_request, 
          UM.user_name, 
          STRING_AGG([info_reason_mm], ', ') AS [info_reason_mm], 
          STRING_AGG([info_reason_en], ', ') AS [info_reason_en], 
          STRING_AGG([info_reason_vn], ', ') AS [info_reason_vn]
    FROM DT_task_detail TD
    LEFT JOIN DT_user_manager UM ON TD.id_user_mechanic = UM.user_name
    LEFT JOIN DT_user_manager REQ ON TD.id_user_request = REQ.user_name
    LEFT JOIN DT_info_reason ir1 ON ','+TD.remark+',' LIKE '%,' + CAST(ir1.id AS VARCHAR) + ',%'
    WHERE TD.factory = '${factory}' AND fixer ='${fixer}'
      AND (
      (
      not exists (Select 1 from DT_task_detail T where T.id_user_mechanic IS NOT NULL AND T.status BETWEEN 1 AND 3 AND id_user_mechanic='${id_user_mechanic}') AND
      TD.id_user_mechanic IS NULL AND TD.status=1 AND TD.id_owner_mechanic IS NULL AND ','+@floor+',' LIKE '%,'+REQ.floor+',%' ) 
      	--OR (TD.status=1 AND TD.id_user_mechanic IS NULL AND fixer ='TM' and TD.factory = 'LVL' AND ','+@floor+',' LIKE '%,'+REQ.floor+',%' and ','+@floors+',' LIKE '%,'+REQ.floors+',%')
       OR ( TD.id_user_mechanic IS NOT NULL AND TD.status BETWEEN 1 AND 3 AND id_user_mechanic='${id_user_mechanic}')) 
    GROUP BY TD.factory, fixer, UM.floor, REQ.floor, UM.floors, UM.lean, UM.name,
             TD.id, id_machine, id_owner_mechanic, id_user_mechanic, id_user_request,
           UM.permission, UM.position, TD.remark,TD.other_reason, TD.remark_mechanic, TD.skill_cfm, status, TD.date_user_request,  UM.user_name 		   
           ORDER BY TD.date_user_request DESC`;
    } else {
      //   query = `SELECT  DT_task_detail.factory,fixer,floor,
      //   floors,DT_task_detail.id,id_machine,id_owner_mechanic,id_user_mechanic,
      //   id_user_request,DT_user_manager.lean,DT_user_manager.name AS name_mechanic,
      //   permission,position,remark,  STRING_AGG([info_reason_en], ', ') AS [info_reason_en], STRING_AGG([info_reason_vn], ', ') AS [info_reason_vn]
      // ,remark_mechanic,skill_cfm, status,DT_task_detail.date_user_request,
      //   user_name FROM DT_task_detail
      //   LEFT JOIN DT_user_manager ON DT_user_manager.user_name = DT_task_detail.id_user_mechanic
      //  LEFT JOIN DT_info_reason ir1 ON ','+DT_task_detail.remark+',' LIKE '%,' + CAST(ir1.id AS VARCHAR) + ',%'
      //   WHERE  DT_task_detail.id_user_mechanic ='${id_user_mechanic}'  AND DT_user_manager.factory='${factory}'  and ((status between 1 and 3) )
      // GROUP BY DT_task_detail.factory,fixer,floor,
      //   floors,DT_task_detail.id,id_machine,id_owner_mechanic,id_user_mechanic,
      //   id_user_request,DT_user_manager.lean,DT_user_manager.name,
      //   permission,position,remark ,remark_mechanic,skill_cfm, status,DT_task_detail.date_user_request,user_name`;

      query = `
   DECLARE  @floor NVARCHAR(30), @floors NVARCHAR(30);
SELECT @floor=floor, @floors=floors FROM DT_user_manager where user_name='${id_user_mechanic}' and factory='LYM' 

 SELECT TD.factory, fixer, UM.floor, UM.floors,UM.name, TD.id id_task, id_machine, id_owner_mechanic, id_user_mechanic,
           id_user_request,UM.permission, UM.position, TD.remark,TD.other_reason, MAX(REQ.name) name_userrq, MAX(REQ.lean) lean_req,MAX(REQ.line) line_req,
		   TD.remark_mechanic, TD.skill_cfm, status, TD.date_user_request, 
          UM.user_name, 
          STRING_AGG([info_reason_mm], ', ') AS [info_reason_mm], 
          STRING_AGG([info_reason_en], ', ') AS [info_reason_en], 
          STRING_AGG([info_reason_vn], ', ') AS [info_reason_vn]
    FROM DT_task_detail TD
    LEFT JOIN DT_user_manager UM ON TD.id_user_mechanic = UM.user_name
    LEFT JOIN DT_user_manager REQ ON TD.id_user_request = REQ.user_name
    LEFT JOIN DT_info_reason ir1 ON ','+TD.remark+',' LIKE '%,' + CAST(ir1.id AS VARCHAR) + ',%'
    WHERE TD.factory = '${factory}' AND fixer ='${fixer}'
	AND (
      (
      not exists (Select 1 from DT_task_detail T where T.id_user_mechanic IS NOT NULL AND T.status BETWEEN 2 AND 3 AND id_user_mechanic='${id_user_mechanic}')
	AND      
	TD.status=1 AND ','+@floor+',' LIKE '%,'+REQ.floor+',%' --AND ','+@floors+',' LIKE '%,'+REQ.floors+',%'
   AND id_user_mechanic='${id_user_mechanic}'
	
	  ) 
	OR (TD.id_user_mechanic IS NOT NULL AND TD.status BETWEEN 2 AND 3 AND id_user_mechanic='${id_user_mechanic}')
	 )

    GROUP BY TD.factory, fixer, UM.floor, REQ.floor, UM.floors, UM.lean, UM.name,
             TD.id, id_machine, id_owner_mechanic, id_user_mechanic, id_user_request,
           UM.permission, UM.position, TD.remark,TD.other_reason, TD.remark_mechanic, TD.skill_cfm, status, TD.date_user_request,  UM.user_name 		   
           ORDER BY TD.date_user_request DESC
    `;
    }
    // console.log(query);
    const rs = await db.Execute(query);

    return rs.recordset || null;
  } catch (error) {
    return null;
  }
};

exports.getTaskInfoSupport = async ({ user_machine, factory }) => {
  try {
    const rs = await db.Execute(
      `	 SELECT S.*, [user_name],[name],[phone_number],[lean],[permission],[token_devices],[position] FROM [DT_support] S
JOIN DT_user_manager UM ON S.id_user_machine = UM.user_name

where id_user_machine='${user_machine}' and S.factory='${factory}' and (date_cfm IS NULL OR date_finish IS NULL)  and status!='5'`
    );

    return rs.recordset || null;
  } catch (error) {
    return null;
  }
};
exports.getHistoryInfoSupport = async ({ user_machine, factory }) => {
  try {
    const rs = await db.Execute(
      `	 SELECT S.*, [user_name],[name],[phone_number],[lean],[permission],[token_devices],[position] FROM [DT_support] S
JOIN DT_user_manager UM ON S.id_user_machine = UM.user_name

where id_user_machine='${user_machine}' and S.factory='${factory}' and status='3'`
    );

    return rs.recordset || null;
  } catch (error) {
    return null;
  }
};

exports.updateFloor = async ({ factory, user_name, floor }) => {
  try {
    const rs = await db.Execute(
      `UPDATE DT_user_manager SET floor='${floor}' WHERE user_name='${user_name}' AND factory='${factory}'`
    );

    return rs || null;
  } catch (e) {
    return null;
  }
};

exports.createDT_NoResponse = async ({
  id_task,
  id_user_onwer,
  id_user_machine,
  factory,
  id_machine,
  receive_date,
}) => {
  try {
    const receiveDate = new Date(receive_date);
    // console.log(receiveDate);

    const dateISO = receiveDate.toISOString();
    let query = `  INSERT INTO [EIP].[dbo].[DT_NoResponse] ([id_task],[id_user_owner],[id_user_mechanic],[Factory], [no_response_date], [id_machine],[receive_date]) 
    VALUES (${id_task}, '${id_user_onwer}','${id_user_machine}','${factory}',getdate(),'${id_machine}',convert(datetime,'${dateISO}'))`;
    // console.log(query)
    const rs = await db.Execute(query);
    return rs || null;
  } catch (error) {
    return null;
  }
};

exports.getCurrentMachineByLine = async ({ line, factory }) => {
  try {
    let query = `  SELECT TD.id, id_machine FROM DT_task_detail TD 
JOIN DT_user_manager REQ ON TD.id_user_request = REQ.user_name
where status != 4 AND REQ.line='${line}' and TD.factory='${factory}'
`;
    // console.log(query)
    const rs = await db.Execute(query);
    return rs.recordset || null;
  } catch (error) {
    return null;
  }
};

exports.getDetailProcessTask = async (id_task) => {
  try {
    const query = `SELECT NoRep.id,'NoRep' [Status],id_task,id_user_mechanic, id_machine, id_user_owner,no_response_date,  Onwer.name CB, Mechanic.name Tho
FROM DT_NoResponse NoRep
JOIN DT_user_manager Onwer ON Onwer.user_name= NoRep.id_user_owner
JOIN DT_user_manager Mechanic ON Mechanic.user_name= NoRep.id_user_mechanic
where id_task='${id_task}'
union
select Reject.id,'Reject', id_task_detail,id_user_mechanic, id_machine,'',  create_date  ,'',Mechanic.name Tho
FROM DT_reject_task Reject
JOIN DT_user_manager Mechanic ON Mechanic.user_name= Reject.id_user_mechanic
where id_task_detail='${id_task}'

union
select Reject.id,'Reject', id_task_detail,id_user_mechanic, id_machine,'',   date_recive  ,'',Mechanic.name Tho
FROM DT_reject_task Reject
JOIN DT_user_manager Mechanic ON Mechanic.user_name= Reject.id_user_mechanic
where id_task_detail='${id_task}' and date_recive <> create_date

ORDER BY no_response_date

`;
    // console.log(query)
    //     const query = `SELECT id,'NoRep' [Status],id_task,id_user_mechanic, id_machine, id_user_owner,no_response_date, '' date2 FROM DT_NoResponse where id_task='${id_task}'
    // union
    // select id,'Reject', id_task_detail,id_user_mechanic, id_machine,'',  create_date, date_recive  FROM DT_reject_task where id_task_detail='${id_task}'

    // ORDER BY no_response_date
    // `;
    const rs = await db.Execute(query);
    return rs.recordset || null;
  } catch (error) {
    return null;
  }
};

exports.getAllTaskInfo = async ({ factory, fromdate, todate }) => {
  try {
    //     const query = `
    //     ;WITH ReasonData AS (
    //     SELECT TD.id, STRING_AGG(info_reason_vn, ', ') AS info_reason_vn, STRING_AGG(info_reason_en, ', ') AS info_reason_en, STRING_AGG(info_reason_mm, ', ') AS info_reason_mm
    //     FROM DT_task_detail TD LEFT JOIN DT_info_reason ir ON ',' + TD.remark + ',' LIKE '%,' + CAST(ir.id AS VARCHAR) + ',%'
    //     WHERE TD.factory = '${factory}' AND CONVERT(DATE, date_user_request) BETWEEN CONVERT(DATE,'${fromdate}') AND CONVERT(DATE,'${todate}')
    //     GROUP BY TD.id),
    // SkillData AS (SELECT TD.id, STRING_AGG(info_skill_vn, ', ') AS info_skill_vn, STRING_AGG(info_skill_en, ', ') AS info_skill_en, STRING_AGG(info_skill_mm, ', ') AS info_skill_mm
    //     FROM DT_task_detail TD LEFT JOIN DT_info_skill is1 ON ',' + TD.skill_cfm + ',' LIKE '%,' + CAST(is1.id AS VARCHAR) + ',%'
    //     WHERE TD.factory = '${factory}' AND CONVERT(DATE, date_user_request) BETWEEN CONVERT(DATE,'${fromdate}') AND CONVERT(DATE,'${todate}')
    //     GROUP BY TD.id)
    // SELECT TD.id, MAX(TD.id_machine) id_machine, MAX(mac.Name_vn) Name_vn,MAX(TD.factory) factory, MAX(fixer) fixer,MAX(REQ.line) Line,
    //     Max(REQ.user_name) id_user_request, Max(REQ.name) name_user_request, Max(REQ.floor) floor_user_request,
    //     Max(UM.user_name) id_mechanic, Max(UM.name) name_mechanic,Max(UM.floor) floor_mechanic,
    //     Max(UOWNER.user_name) id_owner, Max(UOWNER.name) name_owner,Max(UOWNER.floor) floor_owner,
    // 		MAX(TD.date_user_request) date_user_request, Max(TD.date_cfm_mechanic) accept,
    // 		SUM(DATEDIFF(SECOND, date_user_request, date_cfm_mechanic) / 60.0) AS waitting_Minutes,
    // 		Max(TD.date_mechanic_cfm_onsite) fixing,
    // 		SUM(DATEDIFF(SECOND, date_user_request, date_mechanic_cfm_onsite) / 60.0) AS fixing_Minutes,
    // 		Max(TD.date_mechanic_cfm_finished) finish,
    // 		SUM(DATEDIFF(SECOND, date_mechanic_cfm_onsite, date_mechanic_cfm_finished) / 60.0) AS finish_Minutes,
    // 		MAX(status) status, MAX([info_reason_mm]) AS [info_reason_mm], MAX([info_reason_en]) AS [info_reason_en], MAX([info_reason_vn]) AS [info_reason_vn], MAX(TD.other_reason) other_reason,
    // 		MAX([info_skill_mm]) AS [info_skill_mm], MAX([info_skill_en]) AS [info_skill_en], MAX([info_skill_vn]) AS [info_skill_vn], MAX(TD.other_skill) other_skill, MAX(TD.remark_mechanic) remark_mechanic
    //     FROM DT_task_detail TD
    //     LEFT JOIN DT_user_manager UM ON TD.id_user_mechanic = UM.user_name
    //     LEFT JOIN DT_user_manager REQ ON TD.id_user_request = REQ.user_name
    //     LEFT JOIN DT_user_manager UOWNER ON TD.id_owner_mechanic = UOWNER.user_name
    //     LEFT JOIN DT_machine  mac ON TD.id_machine = mac.ID_Code
    //     LEFT JOIN ReasonData ir ON ir.id=TD.id
    //     LEFT JOIN SkillData iskill ON iskill.id=TD.id
    //     WHERE TD.factory = '${factory}' AND CONVERT(DATE, date_user_request) BETWEEN CONVERT(DATE,'${fromdate}') AND CONVERT(DATE,'${todate}')
    //     GROUP BY TD.id ORDER BY MAX(TD.date_user_request) DESC
    // `;

    const query = `;WITH ReasonData AS (
    SELECT TD.id, STRING_AGG(info_reason_vn, ', ') AS info_reason_vn, STRING_AGG(info_reason_en, ', ') AS info_reason_en, STRING_AGG(info_reason_mm, ', ') AS info_reason_mm
    FROM DT_task_detail TD LEFT JOIN DT_info_reason ir ON ',' + TD.remark + ',' LIKE '%,' + CAST(ir.id AS VARCHAR) + ',%'
    WHERE TD.factory = '${factory}' AND CONVERT(DATE, date_user_request)  BETWEEN CONVERT(DATE,'${fromdate}') AND CONVERT(DATE,'${todate}')
    GROUP BY TD.id),
SkillData AS (SELECT TD.id, STRING_AGG(info_skill_vn, ', ') AS info_skill_vn, STRING_AGG(info_skill_en, ', ') AS info_skill_en, STRING_AGG(info_skill_mm, ', ') AS info_skill_mm
    FROM DT_task_detail TD LEFT JOIN DT_info_skill is1 ON ',' + TD.skill_cfm + ',' LIKE '%,' + CAST(is1.id AS VARCHAR) + ',%'
    WHERE TD.factory = '${factory}' AND CONVERT(DATE, date_user_request)  BETWEEN CONVERT(DATE,'${fromdate}') AND CONVERT(DATE,'${todate}')
    GROUP BY TD.id)
SELECT TD.id, MAX(TD.id_machine) id_machine, MAX(mac.Custom_machine_Name) Name_vn,MAX(TD.factory) factory, MAX(fixer) fixer,MAX(REQ.line) Line,
    Max(REQ.user_name) id_user_request, Max(REQ.name) name_user_request, Max(REQ.floor) floor_user_request,
    Max(UM.user_name) id_mechanic, Max(UM.name) name_mechanic,Max(UM.floor) floor_mechanic,
    Max(UOWNER.user_name) id_owner, Max(UOWNER.name) name_owner,Max(UOWNER.floor) floor_owner,
		MAX(TD.date_user_request) date_user_request, Max(TD.date_cfm_mechanic) accept, 
		SUM(DATEDIFF(SECOND, date_user_request, date_cfm_mechanic) / 60.0) AS waitting_Minutes,
		Max(TD.date_mechanic_cfm_onsite) fixing,
		SUM(DATEDIFF(SECOND, date_user_request, date_mechanic_cfm_onsite) / 60.0) AS fixing_Minutes,
		Max(TD.date_mechanic_cfm_finished) finish,
		SUM(DATEDIFF(SECOND, date_mechanic_cfm_onsite, date_mechanic_cfm_finished) / 60.0) AS finish_Minutes,
		MAX(TD.status) status, MAX([info_reason_mm]) AS [info_reason_mm], MAX([info_reason_en]) AS [info_reason_en], MAX([info_reason_vn]) AS [info_reason_vn], MAX(TD.other_reason) other_reason,
		MAX([info_skill_mm]) AS [info_skill_mm], MAX([info_skill_en]) AS [info_skill_en], MAX([info_skill_vn]) AS [info_skill_vn], MAX(TD.other_skill) other_skill, MAX(TD.remark_mechanic) remark_mechanic
    FROM DT_task_detail TD
    LEFT JOIN DT_user_manager UM ON TD.id_user_mechanic = UM.user_name
    LEFT JOIN DT_user_manager REQ ON TD.id_user_request = REQ.user_name
    LEFT JOIN DT_user_manager UOWNER ON TD.id_owner_mechanic = UOWNER.user_name
	LEFT JOIN [Machine].[Machine].dbo.LYG_Machine_Data mac ON REPLACE(TRANSLATE(mac.Asset_No, ' -_.,', '     '), ' ', '')  = REPLACE(TRANSLATE(TD.id_machine, ' -_.,', '     '), ' ', '')
    LEFT JOIN ReasonData ir ON ir.id=TD.id
    LEFT JOIN SkillData iskill ON iskill.id=TD.id
    WHERE TD.factory = '${factory}' AND CONVERT(DATE, date_user_request)  BETWEEN CONVERT(DATE,'${fromdate}') AND CONVERT(DATE,'${todate}')
    GROUP BY TD.id ORDER BY MAX(TD.date_user_request) DESC`;

    // console.log(query)

    const rs = await db.Execute(query);
    return rs.recordset || null;
  } catch (error) {
    return null;
  }
};
