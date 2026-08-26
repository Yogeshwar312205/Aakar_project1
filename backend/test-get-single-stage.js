import axios from 'axios'

const BASE_URL = 'http://localhost:5000/api'

// Test credentials
const MANAGER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXBsb3llZUlkIjoxLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDAwMDAwMH0.test'
const ASSIGNEE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXBsb3llZUlkIjoyLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDAwMDAwMH0.test'

async function testGetSingleStage() {
  console.log('\n=== Testing getSingleStageByStageId with RBAC ===\n')

  // Test 1: Manager accessing a stage (should have canEdit: true)
  console.log('Test 1: Manager accessing stage')
  try {
    const response = await axios.get(`${BASE_URL}/stage/1`, {
      headers: { Authorization: `Bearer ${MANAGER_TOKEN}` }
    })
    console.log('✓ Manager response:', JSON.stringify(response.data, null, 2))
    console.log(`  canEdit flag: ${response.data.data.canEdit}`)
    if (response.data.data.canEdit === true) {
      console.log('✓ PASS: Manager has canEdit: true\n')
    } else {
      console.log('✗ FAIL: Manager should have canEdit: true\n')
    }
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message)
  }

  // Test 2: Assignee accessing owned stage (should have canEdit: true)
  console.log('Test 2: Assignee accessing owned stage')
  try {
    const response = await axios.get(`${BASE_URL}/stage/2`, {
      headers: { Authorization: `Bearer ${ASSIGNEE_TOKEN}` }
    })
    console.log('✓ Assignee (owned) response:', JSON.stringify(response.data, null, 2))
    console.log(`  canEdit flag: ${response.data.data.canEdit}`)
    if (response.data.data.canEdit === true) {
      console.log('✓ PASS: Assignee has canEdit: true for owned stage\n')
    } else {
      console.log('✗ FAIL: Assignee should have canEdit: true for owned stage\n')
    }
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message)
  }

  // Test 3: Assignee accessing non-owned stage (should have canEdit: false)
  console.log('Test 3: Assignee accessing non-owned stage')
  try {
    const response = await axios.get(`${BASE_URL}/stage/3`, {
      headers: { Authorization: `Bearer ${ASSIGNEE_TOKEN}` }
    })
    console.log('✓ Assignee (non-owned) response:', JSON.stringify(response.data, null, 2))
    console.log(`  canEdit flag: ${response.data.data.canEdit}`)
    if (response.data.data.canEdit === false) {
      console.log('✓ PASS: Assignee has canEdit: false for non-owned stage\n')
    } else {
      console.log('✗ FAIL: Assignee should have canEdit: false for non-owned stage\n')
    }
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message)
  }

  // Test 4: Verify all expected fields are present
  console.log('Test 4: Verify response structure')
  try {
    const response = await axios.get(`${BASE_URL}/stage/1`, {
      headers: { Authorization: `Bearer ${MANAGER_TOKEN}` }
    })
    const stage = response.data.data
    const requiredFields = ['stageId', 'stageName', 'projectNumber', 'owner', 'canEdit']
    const missingFields = requiredFields.filter(field => !(field in stage))
    
    if (missingFields.length === 0) {
      console.log('✓ PASS: All required fields present')
      console.log('  Fields:', Object.keys(stage).join(', '))
    } else {
      console.log('✗ FAIL: Missing fields:', missingFields.join(', '))
    }
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message)
  }
}

testGetSingleStage()
  .then(() => console.log('\n=== Test Suite Complete ==='))
  .catch(err => console.error('Test suite error:', err))
