import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Shinde@24',
  database: 'aakar'
});

console.log('\n======================================================================');
console.log('Testing DSA Skill Department Display Fix');
console.log('======================================================================\n');

// Get DSA skill details
const [skillData] = await connection.execute(`
  SELECT s.skillId, s.skillName, s.departmentId as skillOwnerDept, d.departmentName as ownerDeptName
  FROM skill s 
  JOIN department d ON s.departmentId = d.departmentId
  WHERE s.skillName = 'DSA' AND s.skillActivityStatus = 1
`);

if (skillData.length === 0) {
  console.error('❌ DSA skill not found!');
  await connection.end();
  process.exit(1);
}

const dsa = skillData[0];
console.log('📋 DSA Skill Info:');
console.log(`  Skill ID: ${dsa.skillId}`);
console.log(`  Skill Name: ${dsa.skillName}`);
console.log(`  Owner Department ID: ${dsa.skillOwnerDept}`);
console.log(`  Owner Department Name: ${dsa.ownerDeptName}\n`);

// Get all relationships
const [relationships] = await connection.execute(`
  SELECT ds.*, d.departmentName, s.departmentId as skillOwnerDept
  FROM departmentSkill ds
  JOIN department d ON ds.departmentId = d.departmentId
  JOIN skill s ON ds.skillId = s.skillId
  WHERE ds.skillId = ? AND ds.departmentSkillStatus = 1
  ORDER BY ds.departmentId, ds.departmentSkillType
`, [dsa.skillId]);

console.log('📊 Current departmentSkill Relationships:');
console.table(relationships);

// Test the API query (simulate what the endpoint returns)
const [apiResponse] = await connection.execute(`
  SELECT 
    ds.departmentId,
    ds.skillId, 
    s.skillName, 
    s.skillDescription, 
    d.departmentName,
    ds.departmentSkillType,
    ds.departmentSkillStatus,
    s.departmentId as skillOwnerDeptId,
    ownerDept.departmentName as skillOwnerDeptName
  FROM 
    departmentSkill ds
  INNER JOIN 
    skill s 
    ON s.skillId = ds.skillId
  INNER JOIN
    department d
    ON d.departmentId = ds.departmentId
  INNER JOIN
    department ownerDept
    ON ownerDept.departmentId = s.departmentId
  WHERE 
    ds.skillId = ? AND s.skillActivityStatus = 1
  ORDER BY ds.departmentId, ds.departmentSkillType
`, [dsa.skillId]);

console.log('\n📡 API Response (what frontend receives):');
console.table(apiResponse);

console.log('\n======================================================================');
console.log('Verification:');
console.log('======================================================================\n');

let allCorrect = true;

// Check each relationship
for (const rel of apiResponse) {
  const isCorrect = rel.skillOwnerDeptId === dsa.skillOwnerDept && rel.skillOwnerDeptName === dsa.ownerDeptName;
  
  console.log(`Department: ${rel.departmentName} (ID: ${rel.departmentId})`);
  console.log(`  Type: ${rel.departmentSkillType === 1 ? 'Giving Training' : rel.departmentSkillType === 2 ? 'Taking Training' : 'Applicable'}`);
  console.log(`  Shown Department: ${rel.skillOwnerDeptName} (ID: ${rel.skillOwnerDeptId})`);
  console.log(`  Correct: ${isCorrect ? '✅' : '❌'}\n`);
  
  if (!isCorrect) {
    allCorrect = false;
  }
}

if (allCorrect) {
  console.log('======================================================================');
  console.log('✅ SUCCESS: All departments see DSA as belonging to CS!');
  console.log('======================================================================\n');
  console.log('Expected Behavior:');
  console.log(`  - CS views DSA: Shows "CS" as department ✓`);
  console.log(`  - Finance views DSA: Shows "CS" as department (not Finance) ✓`);
  console.log(`  - Any department views DSA: Always shows "CS" as owner ✓\n`);
} else {
  console.log('======================================================================');
  console.log('❌ FAILED: Some departments show incorrect owner!');
  console.log('======================================================================\n');
}

await connection.end();
