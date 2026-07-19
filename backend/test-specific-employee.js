// Test script for specific employee
import mysql from 'mysql2';

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Shinde@24',
  database: 'aakar',
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
  console.log('Connected to database\n');
  
  const customEmployeeId = '3'; // Alice
  
  // Get employee details
  const getEmployeeQuery = 'SELECT employeeId, customEmployeeId, employeeName FROM employee WHERE customEmployeeId = ?';
  
  db.query(getEmployeeQuery, [customEmployeeId], (err, employees) => {
    if (err) {
      console.error('Error finding employee:', err);
      db.end();
      return;
    }
    
    if (employees.length === 0) {
      console.log('Employee with customEmployeeId "3" not found');
      db.end();
      return;
    }
    
    const employee = employees[0];
    console.log('Testing employee:');
    console.log('  employeeId:', employee.employeeId);
    console.log('  customEmployeeId:', employee.customEmployeeId);
    console.log('  employeeName:', employee.employeeName);
    console.log('\n---\n');
    
    // Check stages owned
    const stageQuery = `
      SELECT s.stageId, s.stageName, s.projectNumber, s.owner
      FROM stage s
      WHERE s.owner = ? AND s.historyOf IS NULL
    `;
    
    db.query(stageQuery, [employee.employeeId], (err, stages) => {
      if (err) {
        console.error('Error checking stages:', err);
      } else {
        console.log('Stages owned by this employee:', stages.length);
        if (stages.length > 0) {
          console.log('Stage details:');
          stages.forEach(s => {
            console.log(`  - Stage ${s.stageId}: ${s.stageName} (Project: ${s.projectNumber}, Owner: ${s.owner})`);
          });
        }
      }
      console.log('\n');
      
      // Check substages owned
      const substageQuery = `
        SELECT ss.substageId, ss.substageName, ss.projectNumber, ss.owner
        FROM substage ss
        WHERE ss.owner = ? AND ss.historyOf IS NULL
      `;
      
      db.query(substageQuery, [employee.employeeId], (err, substages) => {
        if (err) {
          console.error('Error checking substages:', err);
        } else {
          console.log('Substages owned by this employee:', substages.length);
          if (substages.length > 0) {
            console.log('Substage details:');
            substages.forEach(ss => {
              console.log(`  - Substage ${ss.substageId}: ${ss.substageName || 'N/A'} (Project: ${ss.projectNumber}, Owner: ${ss.owner})`);
            });
          }
        }
        console.log('\n---\n');
        
        // Run the actual query
        const query = `
          SELECT DISTINCT p.*
          FROM project p
          WHERE p.historyOf IS NULL
          AND (
            EXISTS (
              SELECT 1 FROM stage s 
              WHERE s.projectNumber = p.projectNumber 
              AND s.owner = ? 
              AND s.historyOf IS NULL
            )
            OR EXISTS (
              SELECT 1 FROM substage ss 
              WHERE ss.projectNumber = p.projectNumber 
              AND ss.owner = ? 
              AND ss.historyOf IS NULL
            )
          )
          ORDER BY p.startDate DESC
        `;
        
        console.log('Running projects query...\n');
        
        db.query(query, [employee.employeeId, employee.employeeId], (err, projects) => {
          if (err) {
            console.error('Query error:', err);
            db.end();
            return;
          }
          
          console.log('✅ Projects found:', projects.length);
          
          if (projects.length > 0) {
            console.log('\nProject details:');
            projects.forEach((p, i) => {
              console.log(`\n${i + 1}. Project ${p.projectNumber}:`);
              console.log('   Company:', p.companyName);
              console.log('   Die:', p.dieName);
              console.log('   Status:', p.projectStatus);
              console.log('   Progress:', p.progress + '%');
            });
          } else {
            console.log('\n❌ No projects found for this employee');
            console.log('This employee is not assigned as owner of any stages or substages');
          }
          
          db.end();
        });
      });
    });
  });
});
