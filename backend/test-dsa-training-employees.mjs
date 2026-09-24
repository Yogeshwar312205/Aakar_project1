import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Shinde@24',
  database: 'aakar'
});

console.log('\n======================================================================');
console.log('Testing DSA Training - Employee To Train');
console.log('======================================================================\n');

// Find DSA training
const [dsaTraining] = await connection.execute(`
  SELECT t.trainingId, t.trainingTitle, t.trainerId, e.employeeName as trainerName
  FROM training t
  LEFT JOIN employee e ON t.trainerId = e.employeeId
  WHERE t.trainingTitle LIKE '%DSA%'
  ORDER BY t.trainingId DESC
  LIMIT 1
`);

if (dsaTraining.length === 0) {
  console.log('❌ No DSA training found!\n');
  await connection.end();
  process.exit(1);
}

const training = dsaTraining[0];
console.log(`📌 DSA Training Found:`);
console.log(`  Training ID: ${training.trainingId}`);
console.log(`  Title: ${training.trainingTitle}`);
console.log(`  Trainer: ${training.trainerName} (ID: ${training.trainerId})\n`);

// Get skills for DSA training
const [trainingSkills] = await connection.execute(`
  SELECT ts.skillId, s.skillName, s.departmentId, d.departmentName
  FROM trainingSkills ts
  JOIN skill s ON ts.skillId = s.skillId
  LEFT JOIN department d ON s.departmentId = d.departmentId
  WHERE ts.trainingId = ?
`, [training.trainingId]);

console.log('📚 Required Skills:');
console.table(trainingSkills);

if (trainingSkills.length === 0) {
  console.log('⚠️  DSA training has no skills assigned!\n');
  await connection.end();
  process.exit(1);
}

const departmentId = trainingSkills[0].departmentId; // Assume CS department
console.log(`\n🏢 Testing for Department: ${trainingSkills[0].departmentName} (ID: ${departmentId})\n`);

// Test with CS department
const query = `
  SELECT DISTINCT 
    es.employeeId, 
    es.skillId,
    s.skillName,
    e.employeeName,
    ed.departmentId,
    d.departmentName,
    es.grade
  FROM training t
  INNER JOIN trainingSkills ts ON t.trainingId = ts.trainingId
  INNER JOIN employeeSkill es ON es.skillId = ts.skillId
  INNER JOIN skill s ON es.skillId = s.skillId
  INNER JOIN employee e ON e.employeeId = es.employeeId
  INNER JOIN employeeDesignation ed ON ed.employeeId = es.employeeId
  LEFT JOIN department d ON d.departmentId = ed.departmentId
  WHERE t.trainingId = ? 
    AND ed.departmentId = ? 
    AND es.employeeId != ?
  ORDER BY e.employeeName, s.skillName
`;

const [eligibleCS] = await connection.execute(query, [training.trainingId, departmentId, training.trainerId || 0]);

console.log('======================================================================');
console.log(`Eligible Employees for CS Department:`);
console.log('======================================================================\n');

if (eligibleCS.length > 0) {
  console.log(`✅ Found ${eligibleCS.length} eligible employees:`);
  console.table(eligibleCS);
} else {
  console.log('❌ No eligible employees in CS department!\n');
  
  // Check if anyone has DSA skill
  const [allWithDSA] = await connection.execute(`
    SELECT 
      e.employeeId,
      e.employeeName,
      es.skillId,
      s.skillName,
      es.grade,
      ed.departmentId,
      d.departmentName
    FROM employeeSkill es
    INNER JOIN employee e ON e.employeeId = es.employeeId
    INNER JOIN skill s ON s.skillId = es.skillId
    INNER JOIN employeeDesignation ed ON ed.employeeId = es.employeeId
    LEFT JOIN department d ON d.departmentId = ed.departmentId
    WHERE s.skillName = 'DSA'
    ORDER BY e.employeeName
  `);
  
  console.log('Employees with DSA skill (any department):');
  if (allWithDSA.length > 0) {
    console.table(allWithDSA);
  } else {
    console.log('  No employees have DSA skill assigned!\n');
  }
}

// Test with Finance department (cross-department scenario)
console.log('\n======================================================================');
console.log(`Testing Cross-Department: Finance Department`);
console.log('======================================================================\n');

const FINANCE_DEPT_ID = 3;
const [eligibleFinance] = await connection.execute(query, [training.trainingId, FINANCE_DEPT_ID, training.trainerId || 0]);

if (eligibleFinance.length > 0) {
  console.log(`✅ Found ${eligibleFinance.length} eligible Finance employees:`);
  console.table(eligibleFinance);
} else {
  console.log('❌ No eligible employees in Finance department for DSA training\n');
}

// Show all trainings with eligible employee counts
console.log('\n======================================================================');
console.log('All Trainings - Eligible Employee Summary');
console.log('======================================================================\n');

const [trainingSummary] = await connection.execute(`
  SELECT 
    t.trainingId,
    t.trainingTitle,
    e.employeeName as trainerName,
    GROUP_CONCAT(DISTINCT s.skillName SEPARATOR ', ') as requiredSkills,
    s.departmentId,
    d.departmentName,
    COUNT(DISTINCT es.employeeId) as eligibleEmployeeCount
  FROM training t
  LEFT JOIN employee e ON t.trainerId = e.employeeId
  INNER JOIN trainingSkills ts ON t.trainingId = ts.trainingId
  INNER JOIN skill s ON ts.skillId = s.skillId
  LEFT JOIN department d ON s.departmentId = d.departmentId
  LEFT JOIN employeeSkill es ON es.skillId = ts.skillId
  LEFT JOIN employeeDesignation ed ON ed.employeeId = es.employeeId AND ed.departmentId = s.departmentId
  WHERE es.employeeId != t.trainerId OR es.employeeId IS NULL
  GROUP BY t.trainingId, t.trainingTitle, e.employeeName, s.departmentId, d.departmentName
  ORDER BY t.trainingId DESC
`);

console.table(trainingSummary);

console.log('\n💡 Key Findings:\n');
console.log('To see employees in "Employee To Train":');
console.log('1. Employees must have the required skills in employeeSkill table');
console.log('2. Employees must belong to the same department as the skill');
console.log('3. Employees must have employeeDesignation records');
console.log('4. Employees cannot be the trainer of the training\n');

await connection.end();
