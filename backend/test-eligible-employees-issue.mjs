import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Shinde@24',
  database: 'aakar'
});

console.log('\n======================================================================');
console.log('Diagnosing "Employee To Train" Empty List Issue');
console.log('======================================================================\n');

// Get a sample training
const [trainings] = await connection.execute(`
  SELECT t.trainingId, t.trainingTitle, t.trainerId, e.employeeName as trainerName
  FROM training t
  LEFT JOIN employee e ON t.trainerId = e.employeeId
  ORDER BY t.trainingId DESC
  LIMIT 5
`);

if (trainings.length === 0) {
  console.log('❌ No trainings found in the database!\n');
  await connection.end();
  process.exit(1);
}

console.log('📋 Sample Trainings:');
console.table(trainings);

// Pick the first training
const training = trainings[0];
console.log(`\n📌 Testing with Training: "${training.trainingTitle}" (ID: ${training.trainingId})\n`);

// Get skills for this training
const [trainingSkills] = await connection.execute(`
  SELECT ts.skillId, s.skillName, s.departmentId, d.departmentName
  FROM trainingSkills ts
  JOIN skill s ON ts.skillId = s.skillId
  LEFT JOIN department d ON s.departmentId = d.departmentId
  WHERE ts.trainingId = ?
`, [training.trainingId]);

console.log('📚 Skills for this training:');
console.table(trainingSkills);

if (trainingSkills.length === 0) {
  console.log('⚠️  This training has no skills assigned!\n');
}

// Get the department for this training (from first skill)
const departmentId = trainingSkills[0]?.departmentId;

if (!departmentId) {
  console.log('❌ Cannot determine department for this training!\n');
  await connection.end();
  process.exit(1);
}

console.log(`\n🏢 Department ID for testing: ${departmentId}\n`);

// Test the exact query used by the endpoint
console.log('======================================================================');
console.log('Testing Eligible Employees Query (from endpoint)');
console.log('======================================================================\n');

const query = `
  SELECT DISTINCT 
    es.employeeId, 
    es.skillId,
    s.skillName,
    e.employeeName,
    ed.departmentId,
    es.grade
  FROM training t
  INNER JOIN trainingSkills ts ON t.trainingId = ts.trainingId
  INNER JOIN employeeSkill es ON es.skillId = ts.skillId
  INNER JOIN skill s ON es.skillId = s.skillId
  INNER JOIN employee e ON e.employeeId = es.employeeId
  INNER JOIN employeeDesignation ed ON ed.employeeId = es.employeeId
  WHERE t.trainingId = ? 
    AND ed.departmentId = ? 
    AND es.employeeId != t.trainerId
  ORDER BY e.employeeName, s.skillName
`;

const [eligibleEmployees] = await connection.execute(query, [training.trainingId, departmentId]);

console.log(`Query Parameters:`);
console.log(`  Training ID: ${training.trainingId}`);
console.log(`  Department ID: ${departmentId}`);
console.log(`  Trainer ID: ${training.trainerId}\n`);

console.log(`Result: ${eligibleEmployees.length} eligible employees found\n`);

if (eligibleEmployees.length > 0) {
  console.log('✅ Eligible Employees:');
  console.table(eligibleEmployees);
} else {
  console.log('❌ No eligible employees found!\n');
  
  // Diagnose why no employees were found
  console.log('======================================================================');
  console.log('Diagnostic Analysis');
  console.log('======================================================================\n');
  
  // Check if employees exist in department
  const [deptEmployees] = await connection.execute(`
    SELECT COUNT(DISTINCT ed.employeeId) as count
    FROM employeeDesignation ed
    WHERE ed.departmentId = ?
  `, [departmentId]);
  
  console.log(`1. Employees in department ${departmentId}: ${deptEmployees[0].count}`);
  
  // Check if employees have the required skills
  const skillIds = trainingSkills.map(s => s.skillId);
  const placeholders = skillIds.map(() => '?').join(',');
  
  const [employeesWithSkills] = await connection.execute(`
    SELECT COUNT(DISTINCT es.employeeId) as count
    FROM employeeSkill es
    WHERE es.skillId IN (${placeholders})
  `, skillIds);
  
  console.log(`2. Employees with required skills (any dept): ${employeesWithSkills[0].count}`);
  
  // Check if employees in THIS department have the skills
  const [deptEmployeesWithSkills] = await connection.execute(`
    SELECT COUNT(DISTINCT es.employeeId) as count
    FROM employeeSkill es
    INNER JOIN employeeDesignation ed ON ed.employeeId = es.employeeId
    WHERE es.skillId IN (${placeholders})
      AND ed.departmentId = ?
  `, [...skillIds, departmentId]);
  
  console.log(`3. Employees in dept ${departmentId} with skills: ${deptEmployeesWithSkills[0].count}`);
  
  // Show which employees have which skills
  const [employeeSkillDetails] = await connection.execute(`
    SELECT 
      e.employeeId,
      e.employeeName,
      s.skillId,
      s.skillName,
      es.grade,
      ed.departmentId,
      d.departmentName
    FROM employeeSkill es
    INNER JOIN employee e ON e.employeeId = es.employeeId
    INNER JOIN skill s ON s.skillId = es.skillId
    INNER JOIN employeeDesignation ed ON ed.employeeId = es.employeeId
    LEFT JOIN department d ON d.departmentId = ed.departmentId
    WHERE es.skillId IN (${placeholders})
      AND ed.departmentId = ?
    ORDER BY e.employeeName, s.skillName
  `, [...skillIds, departmentId]);
  
  console.log(`\n4. Employee-Skill Details:`);
  if (employeeSkillDetails.length > 0) {
    console.table(employeeSkillDetails);
  } else {
    console.log('   No employees in this department have the required skills!\n');
  }
  
  // Check if trainer is excluding all employees
  if (training.trainerId) {
    const [trainerInfo] = await connection.execute(`
      SELECT e.employeeId, e.employeeName, ed.departmentId
      FROM employee e
      LEFT JOIN employeeDesignation ed ON ed.employeeId = e.employeeId
      WHERE e.employeeId = ?
    `, [training.trainerId]);
    
    console.log('\n5. Trainer Info:');
    console.table(trainerInfo);
  }
}

// Check overall employeeSkill table
const [totalEmployeeSkills] = await connection.execute(`
  SELECT COUNT(*) as count FROM employeeSkill
`);

console.log(`\n======================================================================`);
console.log(`Overall Database Stats:`);
console.log(`  Total employeeSkill records: ${totalEmployeeSkills[0].count}`);

const [totalEmployees] = await connection.execute(`SELECT COUNT(*) as count FROM employee`);
console.log(`  Total employees: ${totalEmployees[0].count}`);

const [totalTrainings] = await connection.execute(`SELECT COUNT(*) as count FROM training`);
console.log(`  Total trainings: ${totalTrainings[0].count}`);

console.log(`======================================================================\n`);

// Recommendations
console.log('💡 Recommendations:\n');
if (eligibleEmployees.length === 0) {
  console.log('To fix the empty employee list:');
  console.log('1. Ensure employees are added to the department');
  console.log('2. Assign the required skills to employees in employeeSkill table');
  console.log('3. Verify employees have employeeDesignation records');
  console.log('4. Make sure the skills match those required by the training\n');
} else {
  console.log('✅ The query is working! Employees should appear in the UI.\n');
  console.log('If not showing in UI, check:');
  console.log('1. Frontend is using correct trainingId and departmentId');
  console.log('2. API endpoint is accessible (check network tab)');
  console.log('3. Frontend is rendering the response correctly\n');
}

await connection.end();
