import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

console.log('🧪 Testing Tanmay Access to Project #107\n')

const projectNumber = 107
const tanmayId = 293

try {
  // Step 1: Check if Tanmay is Manager
  console.log('Step 1: Check if Tanmay is Manager...')
  const [projectData] = await connection.query(
    'SELECT projectCreatedBy FROM project WHERE projectNumber = ?',
    [projectNumber]
  )
  
  const isManager = projectData[0]?.projectCreatedBy === tanmayId
  console.log(`  Project Creator: ${projectData[0]?.projectCreatedBy}`)
  console.log(`  Tanmay ID: ${tanmayId}`)
  console.log(`  Is Manager: ${isManager}`)
  console.log()
  
  if (isManager) {
    console.log('✅ Tanmay is Manager - should see ALL stages\n')
  } else {
    console.log('❌ Tanmay is NOT Manager - checking assignments...\n')
    
    // Step 2: Get Tanmay's assignments
    console.log('Step 2: Get Tanmay assignments...')
    const [assignments] = await connection.query(
      'SELECT stageId, substageId FROM stage_assignment WHERE employeeId = ? AND projectNumber = ?',
      [tanmayId, projectNumber]
    )
    
    console.log(`  Found ${assignments.length} assignments:`)
    assignments.forEach(a => {
      console.log(`    - stageId: ${a.stageId}, substageId: ${a.substageId}`)
    })
    console.log()
    
    const ownedStages = assignments
      .filter(a => a.stageId !== null)
      .map(a => a.stageId)
    
    const ownedSubstages = assignments
      .filter(a => a.substageId !== null)
      .map(a => a.substageId)
    
    console.log(`  Owned Stages: [${ownedStages.join(', ')}]`)
    console.log(`  Owned Substages: [${ownedSubstages.join(', ')}]`)
    console.log()
    
    // Step 3: Query stages with RBAC filter
    console.log('Step 3: Query stages with RBAC filter...')
    
    if (ownedStages.length === 0) {
      console.log('  ⚠️  NO OWNED STAGES - Tanmay will see 0 stages!')
    } else {
      const [stages] = await connection.query(
        `SELECT s.stageId, s.stageName, s.owner, e.employeeName
         FROM stage s
         INNER JOIN employee e ON s.owner = e.employeeId
         WHERE s.projectNumber = ? AND s.historyOf IS NULL AND s.stageId IN (?)`,
        [projectNumber, ownedStages]
      )
      
      console.log(`  ✅ Query returned ${stages.length} stages:`)
      stages.forEach(s => {
        console.log(`    - Stage ${s.stageId}: ${s.stageName}, Owner: ${s.employeeName}`)
      })
    }
  }
  
  console.log('\n✅ Test Complete!')
  
} catch (error) {
  console.error('❌ Error:', error)
} finally {
  await connection.end()
}
