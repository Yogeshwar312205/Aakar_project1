import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Shinde@24',
  database: 'aakar'
});

console.log('\n======================================================================');
console.log('Testing ShowTrainingDept Endpoint');
console.log('Endpoint: /get-distinct-department-employess-skill-to-train/:departmentId');
console.log('======================================================================\n');

// Test with different departments
const TEST_DEPT_IDS = [1, 2, 3, 69]; // HR, IT, Finance, CS

for (const deptId of TEST_DEPT_IDS) {
  console.log(`\n--- Testing Department ID: ${deptId} ---\n`);
  
  // Get department name
  const [deptInfo] = await connection.execute(
    'SELECT departmentName FROM department WHERE departmentId = ?',
    [deptId]
  );
  
  if (deptInfo.length === 0) {
    console.log(`⚠️  Department ${deptId} not found\n`);
    continue;
  }
  
  console.log(`Department: ${deptInfo[0].departmentName}\n`);
  
  // Test the exact query from the endpoint
  const query = `
    SELECT sa.employeeId, sa.skillId, e.employeeName, d.departmentName, d.departmentId, s.skillName 
    FROM selectedAssigntraining sa
    INNER JOIN employee e ON sa.employeeId = e.employeeId
    INNER JOIN employeeDesignation ed ON e.employeeId = ed.employeeId
    INNER JOIN department d ON d.departmentId = ed.departmentId
    INNER JOIN skill s ON sa.skillId = s.skillId
    WHERE sa.skillId IN (
      SELECT skillId FROM departmentSkill 
      WHERE departmentId = ? AND (departmentSkillType = 1 OR departmentSkillType = 3)
    )
  `;
  
  const [result] = await connection.execute(query, [deptId]);
  
  console.log(`Query Result: ${result.length} records found`);
  
  if (result.length > 0) {
    // Group by department (like the endpoint does)
    const response = {};
    result.forEach(row => {
      if (!response[row.departmentName]) {
        response[row.departmentName] = [];
      }
      response[row.departmentName].push({
        employeeId: row.employeeId,
        employeeName: row.employeeName,
        skillName: row.skillName,
        skillId: row.skillId,
        departmentId: row.departmentId
      });
    });
    
    console.log('\n✅ Grouped Response:');
    console.log(JSON.stringify(response, null, 2));
  } else {
    console.log('❌ No data found!');
    
    // Diagnose why
    console.log('\nDiagnostic Analysis:');
    
    // Check if selectedAssigntraining table has data
    const [assignTrainingData] = await connection.execute(
      'SELECT COUNT(*) as count FROM selectedAssigntraining'
    );
    console.log(`1. Total records in selectedAssigntraining: ${assignTrainingData[0].count}`);
    
    // Check skills for this department
    const [deptSkills] = await connection.execute(`
      SELECT skillId, skillName FROM skill s
      WHERE skillId IN (
        SELECT skillId FROM departmentSkill 
        WHERE departmentId = ? AND (departmentSkillType = 1 OR departmentSkillType = 3)
      )
    `, [deptId]);
    console.log(`2. Skills available for dept ${deptId}: ${deptSkills.length}`);
    if (deptSkills.length > 0) {
      deptSkills.forEach(s => console.log(`   - ${s.skillName} (ID: ${s.skillId})`));
    }
    
    // Check if any employees in selectedAssigntraining have these skills
    if (deptSkills.length > 0) {
      const skillIds = deptSkills.map(s => s.skillId);
      const placeholders = skillIds.map(() => '?').join(',');
      
      const [assignedEmps] = await connection.execute(`
        SELECT COUNT(*) as count FROM selectedAssigntraining 
        WHERE skillId IN (${placeholders})
      `, skillIds);
      console.log(`3. Employees in selectedAssigntraining with these skills: ${assignedEmps[0].count}`);
    }
  }
  
  console.log('\n' + '='.repeat(70));
}

console.log('\n======================================================================');
console.log('Analysis Complete');
console.log('======================================================================\n');

console.log('📊 Key Finding:');
console.log('This endpoint depends on the "selectedAssigntraining" table.');
console.log('If this table is empty, no employees will appear.\n');

console.log('💡 Possible Issues:');
console.log('1. selectedAssigntraining table is empty or has no data for these skills');
console.log('2. This is an old/deprecated approach');
console.log('3. Should use employeeSkill table instead (like eligible-employee endpoint)\n');

console.log('🔧 Recommended Fix:');
console.log('Update the endpoint to use employeeSkill table instead of selectedAssigntraining');
console.log('This will show ALL employees with skills, not just pre-assigned ones\n');

await connection.end();
