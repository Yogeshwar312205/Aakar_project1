// Test script to check employee projects query
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
  
  // First, get an employee who owns stages
  const findEmployeeQuery = `
    SELECT DISTINCT e.employeeId, e.customEmployeeId, e.employeeName
    FROM employee e
    INNER JOIN stage s ON e.employeeId = s.owner
    WHERE s.historyOf IS NULL
    LIMIT 1
  `;
  
  db.query(findEmployeeQuery, (err, employees) => {
    if (err) {
      console.error('Error finding employee:', err);
      db.end();
      return;
    }
    
    if (employees.length === 0) {
      console.log('No employees found who own stages');
      
      // Try finding employee who owns substages
      const findEmployeeQuery2 = `
        SELECT DISTINCT e.employeeId, e.customEmployeeId, e.employeeName
        FROM employee e
        INNER JOIN substage ss ON e.employeeId = ss.owner
        WHERE ss.historyOf IS NULL
        LIMIT 1
      `;
      
      db.query(findEmployeeQuery2, (err, employees2) => {
        if (err) {
          console.error('Error finding employee:', err);
          db.end();
          return;
        }
        
        if (employees2.length === 0) {
          console.log('No employees found who own substages either');
          db.end();
          return;
        }
        
        testEmployee(employees2[0]);
      });
    } else {
      testEmployee(employees[0]);
    }
  });
});

function testEmployee(employee) {
  console.log('Testing with employee:');
  console.log('  employeeId:', employee.employeeId);
  console.log('  customEmployeeId:', employee.customEmployeeId);
  console.log('  employeeName:', employee.employeeName);
  console.log('\n---\n');
  
  // Test the EXISTS query
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
  
  console.log('Running query with employeeId:', employee.employeeId);
  
  db.query(query, [employee.employeeId, employee.employeeId], (err, projects) => {
    if (err) {
      console.error('Query error:', err);
      db.end();
      return;
    }
    
    console.log('\nProjects found:', projects.length);
    
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
      console.log('\nNo projects found - investigating why...\n');
      
      // Check stages
      const stageQuery = `
        SELECT s.stageId, s.stageName, s.projectNumber, s.owner
        FROM stage s
        WHERE s.owner = ? AND s.historyOf IS NULL
        LIMIT 3
      `;
      
      db.query(stageQuery, [employee.employeeId], (err, stages) => {
        if (err) {
          console.error('Error checking stages:', err);
        } else {
          console.log('Stages owned by this employee:', stages.length);
          if (stages.length > 0) {
            stages.forEach(s => {
              console.log(`  - Stage ${s.stageId}: ${s.stageName} (Project: ${s.projectNumber})`);
            });
          }
        }
        
        // Check substages
        const substageQuery = `
          SELECT ss.substageId, ss.substageName, ss.projectNumber, ss.owner
          FROM substage ss
          WHERE ss.owner = ? AND ss.historyOf IS NULL
          LIMIT 3
        `;
        
        db.query(substageQuery, [employee.employeeId], (err, substages) => {
          if (err) {
            console.error('Error checking substages:', err);
          } else {
            console.log('\nSubstages owned by this employee:', substages.length);
            if (substages.length > 0) {
              substages.forEach(ss => {
                console.log(`  - Substage ${ss.substageId}: ${ss.substageName} (Project: ${ss.projectNumber})`);
              });
            }
          }
          
          // Check projects table
          const projectCheckQuery = `
            SELECT projectNumber, companyName, dieName, historyOf
            FROM project
            WHERE historyOf IS NULL
            LIMIT 5
          `;
          
          db.query(projectCheckQuery, (err, allProjects) => {
            if (err) {
              console.error('Error checking projects:', err);
            } else {
              console.log('\nActive projects in database:', allProjects.length);
              if (allProjects.length > 0) {
                allProjects.forEach(p => {
                  console.log(`  - Project ${p.projectNumber}: ${p.companyName} - ${p.dieName}`);
                });
              }
            }
            
            db.end();
          });
        });
      });
    }
  });
}
