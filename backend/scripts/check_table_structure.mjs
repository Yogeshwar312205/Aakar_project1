import { connection } from '../db/index.js';

async function checkTableStructure() {
  try {
    // Check employee table structure
    const [employeeColumns] = await connection.promise().query('DESCRIBE employee');
    console.log('\n=== EMPLOYEE TABLE STRUCTURE ===');
    console.log(employeeColumns.filter(col => col.Field === 'employeeId'));

    // Check dsaSkills table structure
    const [skillColumns] = await connection.promise().query('DESCRIBE dsaSkills');
    console.log('\n=== DSASKILLS TABLE STRUCTURE ===');
    console.log(skillColumns.filter(col => col.Field === 'skillId'));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTableStructure();
