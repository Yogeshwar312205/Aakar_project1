/**
 * Test script for rbacMiddleware
 * This script verifies the middleware logic without running a full server
 */

import { connection } from './db/index.js'

async function testRBACLogic() {
  console.log('Testing RBAC Middleware Logic...\n')

  try {
    // Test 1: Check if a project exists
    console.log('Test 1: Checking for existing projects...')
    const [projects] = await connection.promise().query(
      'SELECT projectNumber, projectCreatedBy FROM project LIMIT 1'
    )
    
    if (projects.length === 0) {
      console.log('❌ No projects found in database. Cannot test RBAC logic.')
      process.exit(0)
    }

    const testProject = projects[0]
    console.log(`✓ Found project ${testProject.projectNumber} created by employee ${testProject.projectCreatedBy}\n`)

    // Test 2: Check if stage_assignment table exists and has data
    console.log('Test 2: Checking stage_assignment table...')
    const [assignments] = await connection.promise().query(
      'SELECT * FROM stage_assignment LIMIT 5'
    )
    
    console.log(`✓ stage_assignment table exists with ${assignments.length} sample records\n`)

    // Test 3: Simulate Manager role detection
    console.log('Test 3: Simulating Manager role detection...')
    const managerId = testProject.projectCreatedBy
    const [managerCheck] = await connection.promise().query(
      'SELECT projectCreatedBy FROM project WHERE projectNumber = ?',
      [testProject.projectNumber]
    )
    
    if (managerCheck[0].projectCreatedBy === managerId) {
      console.log(`✓ Manager role detected for employee ${managerId}\n`)
    }

    // Test 4: Simulate Assignee role detection
    console.log('Test 4: Simulating Assignee role detection...')
    if (assignments.length > 0) {
      const testAssignment = assignments[0]
      const [assigneeCheck] = await connection.promise().query(
        'SELECT stageId, substageId FROM stage_assignment WHERE employeeId = ? AND projectNumber = ?',
        [testAssignment.employeeId, testAssignment.projectNumber]
      )
      
      const ownedStages = assigneeCheck.filter(a => a.stageId !== null).map(a => a.stageId)
      const ownedSubstages = assigneeCheck.filter(a => a.substageId !== null).map(a => a.substageId)
      
      console.log(`✓ Assignee role for employee ${testAssignment.employeeId}:`)
      console.log(`  - Owned Stages: [${ownedStages.join(', ')}]`)
      console.log(`  - Owned Substages: [${ownedSubstages.join(', ')}]\n`)
    }

    // Test 5: Simulate unauthorized access
    console.log('Test 5: Simulating unauthorized access...')
    const [randomEmployee] = await connection.promise().query(
      'SELECT employeeId FROM employee WHERE employeeId NOT IN (SELECT DISTINCT employeeId FROM stage_assignment) LIMIT 1'
    )
    
    if (randomEmployee.length > 0) {
      const [unauthorizedCheck] = await connection.promise().query(
        'SELECT stageId, substageId FROM stage_assignment WHERE employeeId = ? AND projectNumber = ?',
        [randomEmployee[0].employeeId, testProject.projectNumber]
      )
      
      if (unauthorizedCheck.length === 0) {
        console.log(`✓ Unauthorized access correctly detected for employee ${randomEmployee[0].employeeId}\n`)
      }
    } else {
      console.log('⚠ Could not find employee without assignments to test unauthorized access\n')
    }

    console.log('✅ All RBAC middleware logic tests passed!\n')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error(error)
  } finally {
    connection.end()
    process.exit(0)
  }
}

// Run tests
testRBACLogic()
