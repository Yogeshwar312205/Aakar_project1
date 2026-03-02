import { connection } from "../db/index.js";
import express from "express";

const router = express.Router();


router.get('/skills/:departmentId', (req, res) => {
    const departmentId = req.params.departmentId;
    const query = `
    SELECT s.skillId, s.skillName ,s.departmentIdGivingTraining, s.skillDescription ,d.departmentName
    FROM skill s
    INNER JOIN department d ON d.departmentId = s.departmentId 
    WHERE s.departmentId = ? AND skillActivityStatus = 1;
    `
    connection.query(query, [departmentId], (err, result) => {
      if (err) throw err;
      res.send(result);
      console.log(result);
    });
  });

  router.put('/skills/:skillId/deactivate', (req, res) => {
    const skillId = req.params.skillId;
    const sql = 'UPDATE skill SET skillActivityStatus = 0 WHERE skillId = ?';
  
    connection.query(sql, [skillId], (err, result) => {
      if (err) {
        console.error('Error deactivating skill:', err);
        return res.status(500).send('Failed to deactivate skill.');
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).send('Skill not found.');
      }
  
      res.send('Skill deactivated successfully.');
    });
  });

  router.get('/get-all-skills/:departmentId', (req, res) => {
    const departmentId= req.params.departmentId;
    const query = `
      SELECT s.skillId, s.skillName
  FROM skill s
  JOIN departmentSkill ds ON s.skillId = ds.skillId
  WHERE s.skillActivityStatus = 1
    AND ds.departmentId = ?  
    AND ds.departmentSkillType IN (1, 3);
  `; // Ensuring we get only active skills
  
    connection.query(query,[departmentId], (err, results) => {
      if (err) {
        console.error('Error fetching all skills:', err);
        return res.status(500).json({ error: 'Server error' });
      }
  
      // Return skills in the desired format
      const skills = results.map(skill => ({
        id: skill.skillId,
        label: skill.skillName, // Adjust based on what your frontend expects
      }));
  
      res.json({ skills }); // Return all skills in a consistent format
    });
  });

  router.post('/skills/:departmentId', (req, res) => {
    const { skillName, skillDescription, departmentIdGivingTraining:departmentId } = req.body;
    const deptId = req.params.departmentId;
    const query1 = `
      INSERT INTO skill (skillName, departmentId, skillDescription, departmentIdGivingTraining)
      VALUES (?, ?, ?, ?)`;
  
    connection.query(query1, [skillName, deptId, skillDescription, departmentId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error adding skill.' });
      }
  
      const skillId = results.insertId;
      const query2 = `
        INSERT INTO employeeSkill (employeeId, skillId, grade)
        SELECT DISTINCT ed.employeeId, ? , 0
        FROM employeeDesignation ed
        LEFT JOIN employeeSkill es ON ed.employeeId = es.employeeId AND es.skillId = ?
        WHERE ed.departmentId = ? AND es.employeeId IS NULL;
  `;
  
      connection.query(query2, [skillId,skillId, deptId], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error assigning skill to employees.' });
        }
  
        res.status(201).json({
          skillId,
          deptId,
          skillName,
          skillDescription,
          message: 'Skill added and assigned to employees successfully.'
        });
      });
    });
  });

  router.put('/skills/:currentSkill', (req, res) => {
    const { skillName, skillDescription, departmentIdGivingTraining } = req.body;
    const skillId = req.params.currentSkill;
    const query = 'UPDATE skill SET skillName = ?, skillDescription = ?, departmentIdGivingTraining = ? WHERE skillId = ?';
    
    connection.query(query, [skillName, skillDescription, departmentIdGivingTraining, skillId], (err, results) => {
      if (err) {
        console.error('Error updating skill:', err); 
        res.json({ skillId: skillId, skillName, skillDescription , departmentIdGivingTraining });
        return res.status(500).json({ error: 'Error updating skill.', details: err.message });
      }
      res.json({ skillId: skillId, skillName, skillDescription, departmentIdGivingTraining });
    });
  });
  
  
  router.put('/skills/:skillId/delete', (req, res) => {
    const skillId = req.params.skillId;
    connection.query('UPDATE skill SET skillActivityStatus = ? WHERE skillId = ?', [false, skillId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error deactivating skill.' });
      }
      res.status(204).end(); 
    });
  });

///// Update skils ---------------------------//////
router.put("/update-departmentSkill-skill", (req, res) => {
  const { skillId, skillName, skillDescription, departmentId, departmentSkillTypes} = req.body;

  // Validate input
  if (
    !skillId ||
    !skillName ||
    !skillDescription ||
    !departmentId ||
    !Array.isArray(departmentSkillTypes) ||
    departmentSkillTypes.length === 0
  ) {
    return res.status(400).json({ message: "Invalid input data. All fields are required." });
  }

  // Update skill table
  const departmentSkillTypesLabel = departmentSkillTypes.map((dept) => dept.label).join(',');
  const query1 = `UPDATE skill SET skillName = ?, skillDescription = ? WHERE skillId = ?;`
  connection.query(query1, [skillName, skillDescription, skillId], (error) => {
    if (error) {
      console.error("Error updating skill:", error);
      return res.status(500).json({ error: "Error updating skill.", details: error.message });
    }

    // Prepare departmentSkillTypes array for processing
    const activeSkillTypes = departmentSkillTypes.map((dept) => dept.id);

    // First, toggle the departmentSkillStatus for entries not in departmentSkillTypes
    const query2 = `
      UPDATE departmentSkill
      SET departmentSkillStatus = 0
      WHERE skillId = ? AND departmentId = ? AND departmentSkillType NOT IN (?)
    `;
    connection.query(query2, [skillId, departmentId, activeSkillTypes], (err) => {
      if (err) {
        console.error("Error toggling inactive departmentSkill types:", err);
        return res.status(500).json({ error: "Error updating inactive departmentSkill types.", details: err.message });
      }

      // Now, insert or update departmentSkill for active skill types
      const promises = departmentSkillTypes.map((dept) => {
        const query3 = `
          INSERT INTO departmentSkill (departmentSkillType, skillId, departmentId, departmentSkillStatus) 
          VALUES (?, ?, ?, 1)
          ON DUPLICATE KEY UPDATE departmentSkillStatus = VALUES(departmentSkillStatus)
        `;

        return new Promise((resolve, reject) => {
          connection.query(query3, [dept.id, skillId, departmentId], (insertErr) => {
            if (insertErr) {
              console.error({error: "upserting departmentSkill for ${dept.id}:", insertErr});
              return reject(insertErr);
            }
            resolve();
          });
        });
      });

      // Execute all promises
      Promise.all(promises)
        .then(() => {
          res.status(200).json({
            message: "Skill and departmentSkill updated successfully.",
            skillId,
            skillName,
            skillDescription,
            // departmentSkillTypesId :departmentSkillTypes ,
            departmentSkillType : departmentSkillTypesLabel
          });
        })
        .catch((promiseErr) => {
          console.error("Error inserting/updating departmentSkill entries:", promiseErr);
          res.status(500).json({ error: "Error inserting/updating departmentSkill entries.", details: promiseErr.message });
        });
    });
  });
});

// <------------------------------------------------------------temp emp ------------------------------------------------------->
router.post("/add-2-in-department-skill", (req, res) => {
  const { skillId, departmentId } = req.body;

  // Validate inputs
  if (!departmentId) {
    return res.status(400).json({ message: "Not selected Department ID" });
  }
  if (!skillId) {
    return res.status(400).json({ message: "Skill ID is required" });
  }

  // Check existence
  const query1 = `
    SELECT EXISTS(
      SELECT 1 
      FROM departmentSkill 
      WHERE skillId = ? AND departmentId = ? AND departmentSkillType =2
    ) AS existsFlag;
  `;

  connection.query(query1, [skillId, departmentId], (error, result) => {
    if (error) {
      console.error("Error from query1:", error);
      return res
        .status(500)
        .json({
          message: "Error in query1 in add-2-in-department-skill",
          error: error.message,
        });
    }

    const exist = result[0].existsFlag === 1;

    if (!exist) {
      // Insert new record
      const query2 = `
        INSERT INTO departmentSkill (skillId, departmentId, departmentSkillType)
        VALUES (?, ?, 2);
      `;

      connection.query(query2, [skillId, departmentId], (err, result) => {
        if (err) {
          console.error("Error in query2:", err);
          return res
            .status(500)
            .json({
              message: "Error in add-2-in-department-skill query2",
              error: err.message,
            });
        }

        const query4 = `
        INSERT INTO employeeSkill (employeeId, skillId, grade)
        SELECT DISTINCT ed.employeeId, ? , 0
        FROM employeeDesignation ed
        LEFT JOIN employeeSkill es ON ed.employeeId = es.employeeId AND es.skillId = ?
        WHERE ed.departmentId = ? AND es.employeeId IS NULL;
        `;
        connection.query(query4, [skillId, skillId, departmentId], (err) => {
          if (err) {
            return res
              .status(500)
              .json({ error: "Error assigning skill to employees." });
          }
        });

        return res.status(201).json({
          skillId,
          departmentId,
          departmentSkillType: 2,
        });
      });
    } else {
      // Update existing record
      const query3 = `
       UPDATE departmentSkill
        SET departmentSkillStatus = 
        CASE 
          WHEN departmentSkillStatus = 0 THEN 1
          WHEN departmentSkillStatus = 1 THEN 0
          ELSE departmentSkillStatus -- No change for other values (2, 3, etc.)
        END
          WHERE skillId = ? AND departmentId = ?;

      `;

      connection.query(query3, [skillId, departmentId], (err, result) => {
        if (err) {
          console.error("Error in query3:", err);
          return res
            .status(500)
            .json({
              message: "Error in add-2-in-department-skill query3",
              error: err.message,
            });
        }
        return res.status(200).json({
          skillId,
          departmentId,
          previousDepartmentSkillType: 2, // Show previous state explicitly
          updatedDepartmentSkillType: 0,
        });
      });
    }
  });
});

router.post("/add-3-in-department-skill", (req, res) => {
  const { skillId, departmentId } = req.body;

  // Validate inputs
  if (!departmentId) {
    return res.status(400).json({ message: "Not selected Department ID" });
  }
  if (!skillId) {
    return res.status(400).json({ message: "Skill ID is required" });
  }

  // Check existence
  const query1 = `
    SELECT EXISTS(
      SELECT 1 
      FROM departmentSkill 
      WHERE skillId = ? AND departmentId = ? AND departmentSkillType = 3 
    ) AS existsFlag;
  `;

  connection.query(query1, [skillId, departmentId], (error, result) => {
    if (error) {
      console.error("Error from query1:", error);
      return res
        .status(500)
        .json({
          message: "Error in query1 in add-3-in-department-skill",
          error: error.message,
        });
    }

    const exist = result[0].existsFlag === 1;

    if (!exist) {
      // Insert new record
      const query2 = `
        UPDATE departmentSkill ds SET ds.departmentSkillType = 3 WHERE ds.skillId = ? AND ds.departmentId = ?;
      `;

      connection.query(query2, [skillId, departmentId], (err, result) => {
        if (err) {
          console.error("Error in query2:", err);
          return res
            .status(500)
            .json({
              message: "Error in add-3-in-department-skill query2",
              error: err.message,
            });
        }

        const query4 = `
          INSERT INTO employeeSkill (employeeId, skillId, grade)
          SELECT DISTINCT ed.employeeId, ?, 0
          FROM employeeDesignation ed
          LEFT JOIN employeeSkill es ON ed.employeeId = es.employeeId AND es.skillId = ?
          WHERE ed.departmentId = ? AND es.employeeId IS NULL;
        `;
        connection.query(query4, [skillId, skillId, departmentId], (err) => {
          if (err) {
            return res
              .status(500)
              .json({ error: "Error assigning skill to employees." });
          }
        });

        return res.status(201).json({
          skillId,
          departmentId,
          departmentSkillType: 3,
        });
      });
    } else {
      return res.status(400).json({
        message: "Skill already exists for the department with type 3 or 0",
      });
    }
  });
});


router.delete('/remove-2-in-deparment-skill',(req,res)=>{
  const {skillId,departmentId }= req.body;
  if(!skillId) return res.status(400).json({message:"SkillId is required..."})
  const query = `UPDATE departmentSkill set  departmentSkillStatus = 0 where skillId = ? and departmentId = ?  and departmentSkillType = 2`
  connection.query(query,[skillId,departmentId],(err,result)=>{
    if(err){
      console.log("Error in removing skillId from deparmentskill",err)
      return res.status(500).json({message:"Error in removing skillId from deparmentskill",error:err.message})
    }
    return res.status(200).json({
      message : "Skill removed successfully...",
      skillId,
      departmentSkillType : 2,
    })
  })
})

router.delete('/remove-3-in-deparment-skill', (req, res) => {
  const { skillId, departmentId } = req.body;

  if (!skillId) {
    return res.status(400).json({ message: "SkillId is required..." });
  }

  if (!departmentId) {
    return res.status(400).json({ message: "DepartmentId is required..." });
  }

  const query = `
    UPDATE departmentSkill
    SET departmentSkillType = 1
    WHERE skillId = ? AND departmentId = ? AND departmentSkillType = 3
  `;

  connection.query(query, [skillId, departmentId], (err, result) => {
    if (err) {
      console.error("Error in removing skillId from departmentSkill", err);
      return res.status(500).json({
        message: "Error in removing skillId from departmentSkill",
        error: err.message,
      });
    }

    return res.status(200).json({
      message: "Skill removed successfully...",
      skillId,
      departmentSkillType: 3,
    });
  });
});

// --------------------------------------------Department Skill Crud Oprations ---------------------------------------- //


router.get('/get-department-skill', (req, res) => {
  const query = `
  SELECT 
    ds.departmentId,
    ds.skillId, 
    s.skillName, 
    s.skillDescription, 
    d.departmentName,
    GROUP_CONCAT(ds.departmentSkillType) AS departmentSkillTypes
FROM 
    departmentSkill ds
INNER JOIN 
    skill s 
    ON s.skillId = ds.skillId
INNER JOIN
    department d
    ON d.departmentId = ds.departmentId
WHERE 
     s.skillActivityStatus = 1 AND ds.departmentSkillStatus = 1
GROUP BY 
    ds.skillId, s.skillName, d.departmentName, s.skillDescription;

  `;
  connection.query(query, (err, result) => {
    if (err) {
      console.log("Error fetching skill from departmentSkill: ", err);
      return res.status(500).json({ message: "Error getting data from department skill" });
    }
    return res.json(result);
  });
});

router.get('/expected-department-skill', (req, res) => {
  const query = `
  SELECT 
    ds.departmentId,
    ds.skillId, 
    s.skillName, 
    s.skillDescription, 
    d.departmentName,
    ds.departmentSkillType,
    ds.departmentSkillStatus

FROM 
    departmentSkill ds
INNER JOIN 
    skill s 
    ON s.skillId = ds.skillId
INNER JOIN
    department d
    ON d.departmentId = ds.departmentId
WHERE 
     s.skillActivityStatus = 1 ;

  `;
  connection.query(query, (err, result) => {
    if (err) {
      console.log("Error fetching skill from departmentSkill: ", err);
      return res.status(500).json({ message: "Error getting data from department skill" });
    }
    return res.json(result);
  });
});

router.get("/check-in-sql-table/:skillId/:departmentId/:departmentSkillType", (req, res) => {
  const { skillId, departmentId, departmentSkillType } = req.params;
  if(!skillId || !departmentId || Array.isArray(departmentSkillType) || departmentSkillType.length !== 0){
    res.status(400).json({message :"It should not be null ...."})
  }
  // SQL query to check if the record exists
  const query = `
    SELECT EXISTS(
      SELECT 1 
      FROM departmentSkill 
      WHERE skillId = ? AND departmentId = ? AND departmentSkillType = ?
    ) AS existsFlag;
  `;

  connection.query(query, [skillId, departmentId, departmentSkillType], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Retrieve the `existsFlag` from the result
    const exists = results[0].existsFlag === 1;
    res.json(results); // Respond with boolean value
  });
});

router.get(`/get-skillName-skillId/:departmentId`, (req, res) => {
  const { departmentId } = req.params; 
  const query = `
  SELECT ds.skillId,s.skillName
  FROM departmentSkill ds
  inner join skill s on s.skillId = ds.skillId
  WHERE ds.departmentId = ? AND (ds.departmentSkillType = 2 Or ds.departmentSkillType = 3) AND s.skillActivityStatus = 1 AND ds.departmentSkillStatus = 1;
  `;
  connection.query(query, [departmentId], (err, result) => {
    if (err) {
      console.log("Error fetching skill from departmentSkill: ", err);
      return res.status(500).json({ message: "Error getting data from department skill" });
    }
    return res.json(result);
  });
});

router.post("/insert-into-departmentSkill", (req, res) => {
  console.log('My %s has %d ears', 'cat', 2);

  const { skillName, skillDescription, departmentId , TrainingOptionType , TrainingOptionTypeLabel} = req.body;
  // const departmentSkillTypes = [1, 2]; // Example departmentSkillTypes

  if (!skillName || !skillDescription || !departmentId || !Array.isArray(TrainingOptionType) || TrainingOptionType.length === 0) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const query1 = `INSERT INTO skill (skillName, departmentId,skillDescription) VALUES (?, ?,?);`

  connection.query(query1, [skillName,departmentId, skillDescription], (err, result) => {
    if (err) {
      console.error("Error inserting skill:", err);
      return res.status(500).json({ message: "Error adding skill", error: err.message });
    }

    const skillId = result.insertId;

    // Prepare the data to be inserted into departmentSkill
    const insertQueries = TrainingOptionType.map((dst) => [skillId, departmentId, dst]);

    const query2 = `INSERT INTO departmentSkill (skillId, departmentId, departmentSkillType) VALUES ?;`

    // Execute the second query to insert multiple departmentSkill entries
    connection.query(query2, [insertQueries], (err, result) => {
      if (err) {
        console.error("Error inserting into departmentSkill:", err);
        return res.status(500).json({ message: "Error linking skill to department", error: err.message });
      }

      res.status(201).json({
        skillId,
        departmentId,
        skillDescription,
        skillName,
        // departmentSkillType : TrainingOptionType,
        departmentSkillType : TrainingOptionTypeLabel,
        message: "Skill successfully linked to department with departmentSkillTypes",
      });
    });
  });
});

// Export the router
export default router;