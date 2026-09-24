import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Shinde@24',
    database: 'aakar'
});

console.log('Testing Department Skills Query...\n');

// Get Yogendra's department (the admin who adds external trainers)
const [adminData] = await connection.query(
    `SELECT e.employeeId, e.employeeName, ed.departmentId, d.departmentName 
     FROM employee e 
     JOIN employeeDesignation ed ON e.employeeId = ed.employeeId 
     JOIN department d ON ed.departmentId = d.departmentId 
     WHERE e.employeeName LIKE '%Yogendra%' OR e.customEmployeeId LIKE '%99%'
     LIMIT 1`
);

if (adminData.length === 0) {
    console.log('Admin employee not found or no department assigned');
    await connection.end();
    process.exit(1);
}

const { employeeId: adminId, employeeName, departmentId, departmentName } = adminData[0];
console.log(`Admin: ${employeeName} (ID: ${adminId})`);
console.log(`Department: ${departmentName} (ID: ${departmentId})\n`);

// Test the skills query
const query = `
    SELECT DISTINCT s.skillId, s.skillName, s.departmentIdGivingTraining, s.skillDescription, s.departmentId as skillOwnerDept,
    CASE 
        WHEN s.departmentId = ? THEN 'Owned by this department'
        WHEN ds.departmentSkillType = 1 THEN 'Cross-department (Read-only)'
        WHEN ds.departmentSkillType = 2 THEN 'Cross-department (Manager Assigned)'
        WHEN ds.departmentSkillType = 3 THEN 'Cross-department (Full Access)'
        ELSE 'Unknown'
    END as accessType
    FROM skill s
    LEFT JOIN departmentSkill ds ON s.skillId = ds.skillId
    WHERE s.skillActivityStatus = 1
        AND (
            s.departmentId = ? 
            OR (ds.departmentId = ? AND ds.departmentSkillType IN (1, 2, 3) AND ds.departmentSkillStatus = 1)
        )
    ORDER BY s.skillName
`;

const [skills] = await connection.query(query, [departmentId, departmentId, departmentId]);

console.log(`Found ${skills.length} skills for department "${departmentName}":\n`);

skills.forEach((skill, index) => {
    console.log(`${index + 1}. ${skill.skillName}`);
    console.log(`   - Skill ID: ${skill.skillId}`);
    console.log(`   - Access Type: ${skill.accessType}`);
    console.log(`   - Owner Dept ID: ${skill.skillOwnerDept}`);
    console.log('');
});

// Now check all cross-department mappings for this department
console.log('\n--- Checking Cross-Department Skill Mappings (with Activity Status) ---\n');

const [crossDeptSkills] = await connection.query(`
    SELECT 
        ds.skillId,
        s.skillName,
        ds.departmentId,
        d.departmentName as targetDeptName,
        ds.departmentSkillType,
        ds.departmentSkillStatus,
        s.departmentId as skillOwnerDept,
        s.skillActivityStatus,
        dOwner.departmentName as skillOwnerDeptName
    FROM departmentSkill ds
    JOIN skill s ON ds.skillId = s.skillId
    JOIN department d ON ds.departmentId = d.departmentId
    JOIN department dOwner ON s.departmentId = dOwner.departmentId
    WHERE ds.departmentId = ?
    ORDER BY s.skillName
`, [departmentId]);

if (crossDeptSkills.length === 0) {
    console.log('⚠️ No cross-department skills configured for this department!');
} else {
    console.log(`Found ${crossDeptSkills.length} cross-department skill mappings:\n`);
    
    crossDeptSkills.forEach((mapping, index) => {
        const typeLabel = mapping.departmentSkillType === 1 ? 'Read-only' : 
                         mapping.departmentSkillType === 2 ? 'Manager Assigned' :
                         mapping.departmentSkillType === 3 ? 'Full Access' : 'Unknown';
        const statusLabel = mapping.departmentSkillStatus === 1 ? '✅ Active' : '❌ Inactive';
        const activityLabel = mapping.skillActivityStatus === 1 ? '✅ Active' : '❌ Inactive';
        
        console.log(`${index + 1}. ${mapping.skillName} (ID: ${mapping.skillId}, from ${mapping.skillOwnerDeptName})`);
        console.log(`   - Type: ${typeLabel} (${mapping.departmentSkillType})`);
        console.log(`   - Dept Skill Status: ${statusLabel}`);
        console.log(`   - Skill Activity Status: ${activityLabel}`);
        console.log('');
    });
}

await connection.end();
console.log('✅ Test complete!');
