import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Shinde@24',
    database: 'aakar'
});

console.log('Testing External Trainer Training Query...\n');

const employeeId = 300; // Anu's employee ID

// Check if employee is a trainer
const [employeeData] = await connection.query(`
    SELECT 
        e.userType,
        e.employeeName,
        MAX(es.grade) as maxGrade
    FROM employee e
    LEFT JOIN employeeSkill es ON e.employeeId = es.employeeId
    WHERE e.employeeId = ?
    GROUP BY e.employeeId, e.userType, e.employeeName
`, [employeeId]);

console.log('1. Employee Data:');
console.log(employeeData);
console.log('\n');

const { userType, maxGrade, employeeName } = employeeData[0];
const isTrainer = userType === 'external_trainer' || maxGrade === 4;

console.log('2. Is Trainer?', isTrainer);
console.log('   userType:', userType);
console.log('   maxGrade:', maxGrade);
console.log('\n');

if (isTrainer) {
    console.log('3. Fetching trainings where this person is the TRAINER...\n');
    
    const [trainings] = await connection.query(`
        SELECT
            t.trainingTitle,
            t.trainingId,
            t.startTrainingDate,
            t.endTrainingDate,
            e.employeeName AS trainerName,
            GROUP_CONCAT(DISTINCT s.skillName) AS skillNames,
            GROUP_CONCAT(DISTINCT emp.employeeName) AS traineesNames,
            COUNT(DISTINCT tr.employeeId) AS traineeCount
        FROM
            training t
        LEFT JOIN
            employee e ON t.trainerId = e.employeeId
        LEFT JOIN
            trainingSkills ts ON t.trainingId = ts.trainingId
        LEFT JOIN
            skill s ON ts.skillId = s.skillId
        LEFT JOIN
            trainingRegistration tr ON t.trainingId = tr.trainingId
        LEFT JOIN
            employee emp ON tr.employeeId = emp.employeeId
        WHERE
            t.trainerId = ?
        GROUP BY
            t.trainingId, t.trainingTitle, t.startTrainingDate, t.endTrainingDate, e.employeeName
    `, [employeeId]);
    
    console.log('4. Trainings Found:', trainings.length);
    console.log('\n5. Training Details:');
    trainings.forEach((training, index) => {
        console.log(`\n   Training #${index + 1}:`);
        console.log('   - ID:', training.trainingId);
        console.log('   - Title:', training.trainingTitle);
        console.log('   - Trainer:', training.trainerName);
        console.log('   - Skills:', training.skillNames);
        console.log('   - Start Date:', training.startTrainingDate);
        console.log('   - End Date:', training.endTrainingDate);
        console.log('   - Trainees:', training.traineesNames);
        console.log('   - Trainee Count:', training.traineeCount);
    });
    
    if (trainings.length === 0) {
        console.log('\n❌ NO TRAININGS FOUND!');
        console.log('\nDebugging: Checking training table for this trainer...\n');
        
        const [allTrainings] = await connection.query(
            'SELECT trainingId, trainingTitle, trainerId FROM training WHERE trainerId = ?',
            [employeeId]
        );
        
        console.log('6. Direct check in training table:', allTrainings);
    }
} else {
    console.log('3. This employee is NOT a trainer, would fetch trainings as trainee');
}

await connection.end();
console.log('\n✅ Test complete!');
