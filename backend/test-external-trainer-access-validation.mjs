import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Shinde@24',
    database: 'aakar'
});

console.log('Testing External Trainer Access Period Validation...\n');

// Get external trainer info
const [trainerData] = await connection.query(`
    SELECT 
        employeeId,
        employeeName,
        employeeEmail,
        userType,
        accessStartDate,
        accessEndDate,
        CURDATE() as today
    FROM employee
    WHERE userType = 'external_trainer'
    LIMIT 1
`);

if (trainerData.length === 0) {
    console.log('❌ No external trainers found in database');
    await connection.end();
    process.exit(1);
}

const trainer = trainerData[0];
console.log('External Trainer Info:');
console.log('----------------------');
console.log('Name:', trainer.employeeName);
console.log('Email:', trainer.employeeEmail);
console.log('Access Start:', trainer.accessStartDate?.toLocaleDateString() || 'Not Set');
console.log('Access End:', trainer.accessEndDate?.toLocaleDateString() || 'Not Set');
console.log('Today:', trainer.today.toLocaleDateString());
console.log('');

// Check access status
const today = new Date(trainer.today);
const startDate = trainer.accessStartDate ? new Date(trainer.accessStartDate) : null;
const endDate = trainer.accessEndDate ? new Date(trainer.accessEndDate) : null;

today.setHours(0, 0, 0, 0);
if (startDate) startDate.setHours(0, 0, 0, 0);
if (endDate) endDate.setHours(0, 0, 0, 0);

console.log('Access Validation Results:');
console.log('-------------------------');

if (!startDate || !endDate) {
    console.log('❌ BLOCKED: Access dates not configured');
    console.log('   Login will fail with: "Access period not configured"');
} else if (today < startDate) {
    console.log('❌ BLOCKED: Access period has not started yet');
    console.log(`   Login will fail with: "Access period starts on ${startDate.toLocaleDateString()}"`);
    console.log(`   Days until access: ${Math.ceil((startDate - today) / (1000 * 60 * 60 * 24))}`);
} else if (today > endDate) {
    console.log('❌ BLOCKED: Access period has expired');
    console.log(`   Login will fail with: "Access period has expired"`);
    console.log(`   Days since expiry: ${Math.ceil((today - endDate) / (1000 * 60 * 60 * 24))}`);
} else {
    console.log('✅ ALLOWED: Access period is currently active');
    console.log(`   Valid from: ${startDate.toLocaleDateString()}`);
    console.log(`   Valid until: ${endDate.toLocaleDateString()}`);
    console.log(`   Days remaining: ${Math.ceil((endDate - today) / (1000 * 60 * 60 * 24))}`);
}

console.log('');

// Test scenarios
console.log('Test Scenarios:');
console.log('---------------');

// Scenario 1: Extend access
const futureDate = new Date(today);
futureDate.setDate(futureDate.getDate() + 30);
console.log('\n1. To extend access by 30 days, run:');
console.log(`   UPDATE employee SET accessEndDate = '${futureDate.toISOString().split('T')[0]}' WHERE employeeId = ${trainer.employeeId};`);

// Scenario 2: Expire access immediately
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
console.log('\n2. To expire access immediately, run:');
console.log(`   UPDATE employee SET accessEndDate = '${yesterday.toISOString().split('T')[0]}' WHERE employeeId = ${trainer.employeeId};`);

// Scenario 3: Delay access start
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);
console.log('\n3. To delay access start by 7 days, run:');
console.log(`   UPDATE employee SET accessStartDate = '${nextWeek.toISOString().split('T')[0]}' WHERE employeeId = ${trainer.employeeId};`);

await connection.end();
console.log('\n✅ Test complete!');
