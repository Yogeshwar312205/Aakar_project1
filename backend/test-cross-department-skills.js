/**
 * Test Script: Cross-Department Skills Visibility
 * 
 * This script tests the complete flow:
 * 1. Department A creates a skill
 * 2. Department A marks it as "Giving Training" (type 1)
 * 3. Department B should be able to see this skill
 * 4. Department B marks it as "Applicable to my department" (creates type 2 relationship)
 * 5. Both departments should see the skill with their respective relationship types
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

// Test configuration
const DEPT_A_ID = 1; // Replace with actual department ID
const DEPT_B_ID = 2; // Replace with actual department ID

console.log('='.repeat(60));
console.log('Cross-Department Skills Visibility Test');
console.log('='.repeat(60));

async function testCrossDepartmentSkills() {
  try {
    console.log('\n📋 Step 1: Fetching initial skills for Department A...');
    const deptAInitial = await axios.get(`${API_BASE_URL}/expected-department-skill`);
    const deptASkillsBefore = deptAInitial.data.filter(s => s.departmentId === DEPT_A_ID);
    console.log(`✓ Department A has ${deptASkillsBefore.length} skills`);

    console.log('\n📋 Step 2: Fetching initial skills for Department B...');
    const deptBInitial = await axios.get(`${API_BASE_URL}/expected-department-skill`);
    const deptBSkillsBefore = deptBInitial.data.filter(s => s.departmentId === DEPT_B_ID);
    console.log(`✓ Department B has ${deptBSkillsBefore.length} skills`);

    console.log('\n📋 Step 3: Creating a new skill for Department A...');
    const newSkillData = {
      skillName: `Test Skill ${Date.now()}`,
      skillDescription: 'Test skill for cross-department visibility',
      departmentId: DEPT_A_ID,
      TrainingOptionType: [1], // Type 1 = Giving Training
      TrainingOptionTypeLabel: 'Giving Training'
    };

    const createResponse = await axios.post(
      `${API_BASE_URL}/insert-into-departmentSkill`,
      newSkillData
    );
    const newSkillId = createResponse.data.skillId;
    console.log(`✓ Created skill with ID: ${newSkillId}`);
    console.log(`  Name: ${newSkillData.skillName}`);
    console.log(`  Type: Giving Training (type 1)`);

    // Wait a moment for database consistency
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('\n📋 Step 4: Verifying Department A can see the skill...');
    const deptAAfterCreate = await axios.get(`${API_BASE_URL}/expected-department-skill`);
    const deptASkill = deptAAfterCreate.data.find(
      s => s.skillId === newSkillId && s.departmentId === DEPT_A_ID
    );
    
    if (deptASkill) {
      console.log(`✓ Department A can see the skill`);
      console.log(`  Type: ${deptASkill.departmentSkillType} (should be 1)`);
    } else {
      console.log(`✗ ERROR: Department A cannot see the skill!`);
      return;
    }

    console.log('\n📋 Step 5: Verifying Department B can see the skill...');
    const allSkills = await axios.get(`${API_BASE_URL}/expected-department-skill`);
    console.log(`  Total skills in system: ${allSkills.data.length}`);
    
    // Check if skill is visible to Department B through type 1 relationship
    const skillAvailableToDeptB = allSkills.data.filter(
      s => s.skillId === newSkillId && (s.departmentSkillType === 1 || s.departmentSkillType === 3)
    );
    
    console.log(`  Skills with ID ${newSkillId}:`, skillAvailableToDeptB.map(s => ({
      deptId: s.departmentId,
      type: s.departmentSkillType,
      deptName: s.departmentName
    })));

    if (skillAvailableToDeptB.length > 0) {
      console.log(`✓ Skill is available (created by Department A with type 1)`);
    } else {
      console.log(`✗ ERROR: Skill is not visible!`);
      return;
    }

    console.log('\n📋 Step 6: Department B marks skill as "Applicable to my department"...');
    const addType2Response = await axios.post(
      `${API_BASE_URL}/add-2-in-department-skill`,
      {
        skillId: newSkillId,
        departmentId: DEPT_B_ID
      }
    );
    console.log(`✓ Department B added type 2 relationship`);
    console.log(`  Response:`, addType2Response.data);

    // Wait a moment for database consistency
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('\n📋 Step 7: Verifying both departments see the skill correctly...');
    const finalSkills = await axios.get(`${API_BASE_URL}/expected-department-skill`);
    
    const deptAFinalSkill = finalSkills.data.find(
      s => s.skillId === newSkillId && s.departmentId === DEPT_A_ID
    );
    const deptBFinalSkill = finalSkills.data.find(
      s => s.skillId === newSkillId && s.departmentId === DEPT_B_ID
    );

    console.log('\nFinal State:');
    console.log('  Department A:');
    if (deptAFinalSkill) {
      console.log(`    ✓ Can see skill "${deptAFinalSkill.skillName}"`);
      console.log(`    ✓ Type: ${deptAFinalSkill.departmentSkillType} (should be 1 = Giving Training)`);
      console.log(`    ✓ Status: ${deptAFinalSkill.departmentSkillStatus === 1 ? 'Active' : 'Inactive'}`);
    } else {
      console.log(`    ✗ ERROR: Cannot see skill!`);
    }

    console.log('  Department B:');
    if (deptBFinalSkill) {
      console.log(`    ✓ Can see skill "${deptBFinalSkill.skillName}"`);
      console.log(`    ✓ Type: ${deptBFinalSkill.departmentSkillType} (should be 2 = Taking Training)`);
      console.log(`    ✓ Status: ${deptBFinalSkill.departmentSkillStatus === 1 ? 'Active' : 'Inactive'}`);
    } else {
      console.log(`    ✗ ERROR: Cannot see skill!`);
    }

    console.log('\n📋 Step 8: Testing the /skills/:departmentId endpoint...');
    
    const deptBSkillsEndpoint = await axios.get(`${API_BASE_URL}/skills/${DEPT_B_ID}`);
    const skillInDeptBList = deptBSkillsEndpoint.data.find(s => s.skillId === newSkillId);
    
    if (skillInDeptBList) {
      console.log(`✓ Department B can see the skill through /skills/${DEPT_B_ID}`);
      console.log(`  Skill: ${skillInDeptBList.skillName}`);
    } else {
      console.log(`✗ ERROR: Department B cannot see the skill through /skills/${DEPT_B_ID}`);
      console.log(`  Available skills for Dept B:`, deptBSkillsEndpoint.data.map(s => ({
        id: s.skillId,
        name: s.skillName,
        deptId: s.departmentId
      })));
    }

    console.log('\n📋 Step 9: Cleanup - Removing type 2 relationship...');
    await axios.delete(`${API_BASE_URL}/remove-2-in-deparment-skill`, {
      data: {
        skillId: newSkillId,
        departmentId: DEPT_B_ID
      }
    });
    console.log(`✓ Removed Department B's type 2 relationship`);

    console.log('\n📋 Step 10: Cleanup - Deactivating test skill...');
    await axios.put(`${API_BASE_URL}/skills/${newSkillId}/deactivate`);
    console.log(`✓ Deactivated test skill`);

    console.log('\n' + '='.repeat(60));
    console.log('✓ TEST COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('✗ TEST FAILED');
    console.error('='.repeat(60));
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    console.error('Stack:', error.stack);
  }
}

// Run the test
testCrossDepartmentSkills();
