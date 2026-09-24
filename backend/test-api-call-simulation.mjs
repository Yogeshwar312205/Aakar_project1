import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

console.log('\n======================================================================');
console.log('Simulating Frontend API Call to eligible-employee-to-send-to-training');
console.log('======================================================================\n');

// Test with DSA training (ID: 4) and IT department (ID: 2)
const testCases = [
  { trainingId: 4, departmentId: 2, name: 'DSA Training (IT dept)' },
  { trainingId: 22, departmentId: 3, name: 'Fin Train (Finance dept)' },
  { trainingId: 21, departmentId: 69, name: 'teastV1 (CS dept)' },
  { trainingId: 1, departmentId: 1, name: 'Intern (HR dept) - Should be empty' },
];

for (const testCase of testCases) {
  console.log(`\n--- Testing: ${testCase.name} ---`);
  console.log(`URL: ${API_BASE_URL}/eligible-employee-to-send-to-training`);
  console.log(`Params: trainingId=${testCase.trainingId}, departmentId=${testCase.departmentId}\n`);
  
  try {
    const response = await axios.get(`${API_BASE_URL}/eligible-employee-to-send-to-training`, {
      params: {
        trainingId: testCase.trainingId,
        departmentId: testCase.departmentId
      }
    });
    
    const uniqueEmployees = response.data.filter(
      (item, index, array) =>
        index === array.findIndex(emp => emp.employeeId === item.employeeId)
    );
    
    console.log(`✅ API Response: ${response.data.length} records, ${uniqueEmployees.length} unique employees`);
    
    if (uniqueEmployees.length > 0) {
      console.log('\nEmployees:');
      uniqueEmployees.forEach((emp, idx) => {
        console.log(`  ${idx + 1}. ${emp.employeeName} (ID: ${emp.employeeId})`);
      });
    } else {
      console.log('⚠️  No eligible employees found');
    }
    
  } catch (error) {
    console.error(`❌ API Error: ${error.message}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
    }
  }
}

console.log('\n======================================================================');
console.log('Simulation Complete');
console.log('======================================================================\n');

console.log('💡 If you see employees here but not in UI:');
console.log('1. Check browser console for errors');
console.log('2. Verify departmentId is being passed correctly');
console.log('3. Check if backend server is running on port 3000');
console.log('4. Verify you\'re expanding the correct training row\n');
