import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Shinde@24',
  database: 'aakar'
});

console.log('\n=== Checking DSA Skill Data ===\n');

// Check skill table
const [skillData] = await connection.execute(`
  SELECT s.skillId, s.skillName, s.departmentId as skillOwnerDept, d.departmentName as ownerDeptName
  FROM skill s 
  JOIN department d ON s.departmentId = d.departmentId
  WHERE s.skillName = 'DSA' AND s.skillActivityStatus = 1
`);

console.log('Skill Table (DSA):');
console.table(skillData);

if (skillData.length > 0) {
  const skillId = skillData[0].skillId;
  
  // Check departmentSkill relationships
  const [deptSkillData] = await connection.execute(`
    SELECT ds.*, d.departmentName, s.departmentId as skillOwnerDept
    FROM departmentSkill ds
    JOIN department d ON ds.departmentId = d.departmentId
    JOIN skill s ON ds.skillId = s.skillId
    WHERE ds.skillId = ? AND ds.departmentSkillStatus = 1
    ORDER BY ds.departmentId, ds.departmentSkillType
  `, [skillId]);
  
  console.log('\nDepartmentSkill Relationships for DSA:');
  console.table(deptSkillData);
}

await connection.end();
