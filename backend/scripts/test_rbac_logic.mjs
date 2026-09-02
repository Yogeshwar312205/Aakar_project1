import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

console.log('🧪 Testing RBAC Logic for Tanmay + Project #107\n')

const projectNumber = 107
const tanmayId = 293

try {
  // Simulate rbacMiddleware logic
  console.log('=== Step 1: Get Assignments ===')
  const [assignments] = await connection.query(
    'SELECT stageId, substageId FROM stage_assignment WHERE employeeId = ? AND projectNumber = ?',
    [tanmayId, projectNumber]
  )
  
  console.log(`Assignments found: ${assignments.length}`)
  assignments.forEach(a => {
    console.log(`  - stageId: ${a.stageId}, substageId: ${a.substageId}`)
  })
  console.log()
  
  // Extract owned stages and substages
  const ownedStages = assignments
    .filter(a => a.stageId !== null)
    .map(a => a.stageId)
  
  const ownedSubstages = assignments
    .filter(a => a.substageId !== null)
    .map(a => a.substageId)
  
  console.log('Owned stages (direct):', ownedStages)
  console.log('Owned substages:', ownedSubstages)
  console.log()
  
  // Get parent stages for owned substages
  console.log('=== Step 2: Get Parent Stages ===')
  let parentStageIds = []
  if (ownedSubstages.length > 0) {
    const [parentStages] = await connection.query(
      'SELECT DISTINCT stageId FROM substage WHERE substageId IN (?)',
      [ownedSubstages]
    )
    parentStageIds = parentStages.map(ps => ps.stageId)
    console.log('Parent stages for owned substages:', parentStageIds)
  } else {
    console.log('No owned substages')
  }
  console.log()
  
  // Merge to get all visible stages
  const allVisibleStages = [...new Set([...ownedStages, ...parentStageIds])]
  console.log('=== Step 3: Final Visible Stages ===')
  console.log('All visible stages:', allVisibleStages)
  console.log()
  
  // Query stages with filter
  console.log('=== Step 4: Query Stages ===')
  let query = `SELECT s.stageId, s.stageName, s.owner, e.employeeName AS ownerName
    FROM stage s
    INNER JOIN employee e ON s.owner = e.employeeId
    WHERE s.projectNumber = ? AND s.historyOf IS NULL`
  
  let queryParams = [projectNumber]
  
  if (allVisibleStages.length > 0) {
    query += ` AND s.stageId IN (?)`
    queryParams.push(allVisibleStages)
  } else {
    query += ` AND 1 = 0`
  }
  
  console.log('Query:', query)
  console.log('Params:', queryParams)
  console.log()
  
  const [stages] = await connection.query(query, queryParams)
  
  console.log(`✅ Stages returned: ${stages.length}`)
  stages.forEach(s => {
    const isDirectlyOwned = ownedStages.includes(s.stageId)
    const isParent = parentStageIds.includes(s.stageId)
    console.log(`  - Stage ${s.stageId}: ${s.stageName}`)
    console.log(`    Owner: ${s.ownerName} (ID: ${s.owner})`)
    console.log(`    Directly owned: ${isDirectlyOwned}`)
    console.log(`    Parent of owned substage: ${isParent}`)
    console.log(`    Can edit: ${isDirectlyOwned}`)
  })
  
  console.log('\n✅ Test Complete!')
  
  if (stages.length === 2) {
    console.log('\n✅✅ SUCCESS! Tanmay should see 2 stages')
  } else {
    console.log(`\n⚠️  ISSUE: Tanmay sees ${stages.length} stages instead of 2`)
  }
  
} catch (error) {
  console.error('❌ Error:', error)
} finally {
  await connection.end()
}
