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
console.log('==========  PROJECT #986 DIAGNOSTIC ==========\n')

try {
  // 1. Get all stages for project 986
  const [stages] = await connection.query(`
    SELECT s.stageId, s.stageName, e.employeeName as owner, e.employeeId as ownerId
    FROM stage s
    INNER JOIN employee e ON s.owner = e.employeeId
    WHERE s.projectNumber = 986 AND s.historyOf IS NULL
    ORDER BY s.stageId
  `)
  
  console.log(`Found ${stages.length} stages:\n`)
  stages.forEach(s => {
    console.log(`  Stage ${s.stageId}: "${s.stageName}" - Owner: ${s.owner} (ID: ${s.ownerId})`)
  })
  
  // 2. Get all substages for each stage
  console.log('\n--- Substages ---\n')
  for (const stage of stages) {
    const [substages] = await connection.query(`
      SELECT ss.substageId, ss.substageName, e.employeeName as owner, e.employeeId as ownerId
      FROM substage ss
      INNER JOIN employee e ON ss.owner = e.employeeId
      WHERE ss.stageId = ? AND ss.historyOf IS NULL
      ORDER BY ss.substageId
    `, [stage.stageId])
    
    if (substages.length > 0) {
      console.log(`  Stage ${stage.stageId} (${stage.stageName}):`)
      substages.forEach(ss => {
        console.log(`    - Substage ${ss.substageId}: "${ss.substageName}" - Owner: ${ss.owner} (ID: ${ss.ownerId})`)
      })
    } else {
      console.log(`  Stage ${stage.stageId} (${stage.stageName}): NO SUBSTAGES`)
    }
  }
  
  // 3. Check stage_assignment records
  console.log('\n--- Stage Assignments for Employee Tanmay (ID 293) ---\n')
  const [assignments] = await connection.query(`
    SELECT sa.*, 
           s.stageName, 
           ss.substageName
    FROM stage_assignment sa
    LEFT JOIN stage s ON sa.stageId = s.stageId
    LEFT JOIN substage ss ON sa.substageId = ss.substageId
    WHERE sa.projectNumber = 986 AND sa.employeeId = 293
    ORDER BY sa.stageId, sa.substageId
  `)
  
  if (assignments.length === 0) {
    console.log('  NO ASSIGNMENTS FOUND for Tanmay!')
  } else {
    console.log(`  Found ${assignments.length} assignments:`)
    assignments.forEach(a => {
      if (a.stageId) {
        console.log(`    - Stage ${a.stageId}: "${a.stageName}"`)
      }
      if (a.substageId) {
        console.log(`    - Substage ${a.substageId}: "${a.substageName}" (Stage ${a.stageId || 'NULL'})`)
      }
    })
  }
  
  // 4. What SHOULD Tanmay see?
  console.log('\n--- What Tanmay SHOULD See (Based on RBAC Logic) ---\n')
  
  const directlyOwnedStageIds = assignments.filter(a => a.stageId !== null).map(a => a.stageId)
  const ownedSubstageIds = assignments.filter(a => a.substageId !== null).map(a => a.substageId)
  
  // Get parent stages for owned substages
  let parentStageIds = []
  if (ownedSubstageIds.length > 0) {
    const [parentStages] = await connection.query(
      'SELECT DISTINCT stageId FROM substage WHERE substageId IN (?)',
      [ownedSubstageIds]
    )
    parentStageIds = parentStages.map(ps => ps.stageId)
  }
  
  const allVisibleStageIds = [...new Set([...directlyOwnedStageIds, ...parentStageIds])]
  
  console.log(`  Directly owned stages: ${directlyOwnedStageIds.length > 0 ? directlyOwnedStageIds.join(', ') : 'NONE'}`)
  console.log(`  Owned substages: ${ownedSubstageIds.length > 0 ? ownedSubstageIds.join(', ') : 'NONE'}`)
  console.log(`  Parent stages of owned substages: ${parentStageIds.length > 0 ? parentStageIds.join(', ') : 'NONE'}`)
  console.log(`  ALL VISIBLE STAGES: ${allVisibleStageIds.length > 0 ? allVisibleStageIds.join(', ') : 'NONE'}`)
  
  if (allVisibleStageIds.length > 0) {
    console.log('\n  Tanmay should see these stages:')
    const visibleStages = stages.filter(s => allVisibleStageIds.includes(s.stageId))
    visibleStages.forEach(s => {
      console.log(`    - Stage ${s.stageId}: "${s.stageName}"`)
    })
  }
  
  console.log('\n==============================================')
  
} catch (error) {
  console.error('Error:', error)
} finally {
  await connection.end()
}
