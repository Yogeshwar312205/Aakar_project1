import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

console.log('Connected to database\n')

try {
  // Check project
  console.log('=== PROJECT #107 ===')
  const [project] = await connection.query(`
    SELECT projectNumber, projectCreatedBy
    FROM project 
    WHERE projectNumber = 107
  `)
  console.log('Project:', project[0])
  console.log()
  
  // Check stages
  console.log('=== STAGES ===')
  const [stages] = await connection.query(`
    SELECT s.stageId, s.stageName, s.owner, e.employeeName, e.customEmployeeId
    FROM stage s
    LEFT JOIN employee e ON s.owner = e.employeeId
    WHERE s.projectNumber = 107 AND s.historyOf IS NULL
  `)
  console.log(`Found ${stages.length} stages:`)
  stages.forEach(s => {
    console.log(`  - Stage ${s.stageId}: ${s.stageName}, Owner: ${s.employeeName} (ID: ${s.owner}, Custom: ${s.customEmployeeId})`)
  })
  console.log()
  
  // Check employees
  console.log('=== EMPLOYEES ===')
  const [employees] = await connection.query(`
    SELECT employeeId, employeeName, customEmployeeId
    FROM employee
    WHERE employeeName IN ('Tanmay', 'Yogendra')
  `)
  employees.forEach(emp => {
    console.log(`  - ${emp.employeeName}: employeeId=${emp.employeeId}, customId=${emp.customEmployeeId}`)
  })
  console.log()
  
  // Check stage_assignment for project 107
  console.log('=== STAGE_ASSIGNMENTS for Project #107 ===')
  const [assignments] = await connection.query(`
    SELECT sa.assignmentId, sa.stageId, sa.substageId, sa.employeeId, 
           e.employeeName, e.customEmployeeId,
           s.stageName
    FROM stage_assignment sa
    LEFT JOIN employee e ON sa.employeeId = e.employeeId
    LEFT JOIN stage s ON sa.stageId = s.stageId
    WHERE sa.projectNumber = 107
  `)
  
  if (assignments.length === 0) {
    console.log('  ⚠️  NO ASSIGNMENTS FOUND!')
  } else {
    console.log(`Found ${assignments.length} assignments:`)
    assignments.forEach(a => {
      console.log(`  - Assignment ${a.assignmentId}: ${a.employeeName} (ID: ${a.employeeId}) → Stage ${a.stageId} (${a.stageName})`)
    })
  }
  console.log()
  
  // Check if Tanmay has any assignments at all
  const tanmayId = employees.find(e => e.employeeName === 'Tanmay')?.employeeId
  if (tanmayId) {
    console.log(`=== ALL ASSIGNMENTS FOR TANMAY (ID: ${tanmayId}) ===`)
    const [tanmayAssignments] = await connection.query(`
      SELECT sa.projectNumber, sa.stageId, sa.substageId, s.stageName
      FROM stage_assignment sa
      LEFT JOIN stage s ON sa.stageId = s.stageId
      WHERE sa.employeeId = ?
    `, [tanmayId])
    
    console.log(`Found ${tanmayAssignments.length} assignments for Tanmay:`)
    tanmayAssignments.forEach(a => {
      console.log(`  - Project ${a.projectNumber}, Stage ${a.stageId} (${a.stageName}), Substage ${a.substageId}`)
    })
  }
  
} catch (error) {
  console.error('Error:', error)
} finally {
  await connection.end()
}
