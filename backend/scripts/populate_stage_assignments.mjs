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
  // Step 1: Get all active stages (historyOf IS NULL)
  const [stages] = await connection.query(`
    SELECT s.stageId, s.projectNumber, s.owner, s.createdBy, p.projectCreatedBy
    FROM stage s
    INNER JOIN project p ON s.projectNumber = p.projectNumber
    WHERE s.historyOf IS NULL
    ORDER BY s.projectNumber, s.stageId
  `)
  
  console.log(`Found ${stages.length} active stages\n`)
  
  let insertedCount = 0
  let skippedCount = 0
  
  for (const stage of stages) {
    // Check if owner is different from project creator
    if (stage.owner !== stage.projectCreatedBy) {
      // Check if assignment already exists
      const [existing] = await connection.query(`
        SELECT assignmentId FROM stage_assignment 
        WHERE stageId = ? AND employeeId = ? AND projectNumber = ?
      `, [stage.stageId, stage.owner, stage.projectNumber])
      
      if (existing.length === 0) {
        // Insert stage_assignment
        await connection.query(`
          INSERT INTO stage_assignment (projectNumber, stageId, substageId, employeeId, assignedBy)
          VALUES (?, ?, NULL, ?, ?)
        `, [stage.projectNumber, stage.stageId, stage.owner, stage.createdBy])
        
        console.log(`✓ Created assignment: Project ${stage.projectNumber}, Stage ${stage.stageId}, Employee ${stage.owner}`)
        insertedCount++
      } else {
        console.log(`- Skipped: Assignment already exists for Stage ${stage.stageId}`)
        skippedCount++
      }
    } else {
      console.log(`- Skipped: Owner ${stage.owner} is project creator for Stage ${stage.stageId}`)
      skippedCount++
    }
  }
  
  console.log(`\n✅ Done! Inserted ${insertedCount} assignments, Skipped ${skippedCount}`)
  
  // Step 2: Do the same for substages
  console.log(`\n--- Processing Substages ---\n`)
  
  const [substages] = await connection.query(`
    SELECT ss.substageId, ss.stageId, ss.projectNumber, ss.owner, ss.createdBy, p.projectCreatedBy
    FROM substage ss
    INNER JOIN project p ON ss.projectNumber = p.projectNumber
    WHERE ss.historyOf IS NULL
    ORDER BY ss.projectNumber, ss.stageId, ss.substageId
  `)
  
  console.log(`Found ${substages.length} active substages\n`)
  
  let substageInsertedCount = 0
  let substageSkippedCount = 0
  
  for (const substage of substages) {
    // Check if owner is different from project creator
    if (substage.owner !== substage.projectCreatedBy) {
      // Check if assignment already exists
      const [existing] = await connection.query(`
        SELECT assignmentId FROM stage_assignment 
        WHERE substageId = ? AND employeeId = ? AND projectNumber = ?
      `, [substage.substageId, substage.owner, substage.projectNumber])
      
      if (existing.length === 0) {
        // Insert stage_assignment for substage
        await connection.query(`
          INSERT INTO stage_assignment (projectNumber, stageId, substageId, employeeId, assignedBy)
          VALUES (?, ?, ?, ?, ?)
        `, [substage.projectNumber, null, substage.substageId, substage.owner, substage.createdBy])
        
        console.log(`✓ Created assignment: Project ${substage.projectNumber}, Substage ${substage.substageId}, Employee ${substage.owner}`)
        substageInsertedCount++
      } else {
        console.log(`- Skipped: Assignment already exists for Substage ${substage.substageId}`)
        substageSkippedCount++
      }
    } else {
      console.log(`- Skipped: Owner ${substage.owner} is project creator for Substage ${substage.substageId}`)
      substageSkippedCount++
    }
  }
  
  console.log(`\n✅ Done! Inserted ${substageInsertedCount} substage assignments, Skipped ${substageSkippedCount}`)
  console.log(`\n🎉 TOTAL: ${insertedCount + substageInsertedCount} new assignments created`)
  
} catch (error) {
  console.error('Error:', error)
} finally {
  await connection.end()
}
