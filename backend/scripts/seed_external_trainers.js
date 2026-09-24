import { connection } from '../db/index.js';
import bcrypt from 'bcrypt';

async function seedExternalTrainersAsEmployees() {
  console.log('=== Cleaning up Gemini\'s bad data ===');

  // Clean up the bad training records Gemini created (trainerId 5-8 pointed to wrong employees)
  // First find training IDs that Gemini inserted by title
  const geminiTitles = [
    'Modern React & Node.js Masterclass',
    'AWS Cloud & DevOps Deployment',
    'Penetration Testing & Network Defense',
    'Deep Learning & AI Systems'
  ];

  for (const title of geminiTitles) {
    const [trainings] = await connection.promise().query(
      'SELECT trainingId FROM training WHERE trainingTitle = ?', [title]
    );
    for (const t of trainings) {
      await connection.promise().query('DELETE FROM attendance WHERE sessionId IN (SELECT sessionId FROM sessions WHERE trainingId = ?)', [t.trainingId]);
      await connection.promise().query('DELETE FROM sessions WHERE trainingId = ?', [t.trainingId]);
      await connection.promise().query('DELETE FROM trainingregistration WHERE trainingId = ?', [t.trainingId]);
      await connection.promise().query('DELETE FROM trainingskills WHERE trainingId = ?', [t.trainingId]);
      await connection.promise().query('DELETE FROM training WHERE trainingId = ?', [t.trainingId]);
      console.log(`Cleaned up training: ${title} (ID: ${t.trainingId})`);
    }
  }

  // Clean up Gemini's training_programs and training_attendees for trainer IDs 5-8
  const [badProgs] = await connection.promise().query(
    'SELECT id FROM training_programs WHERE trainer_id IN (5, 6, 7, 8)'
  );
  for (const p of badProgs) {
    await connection.promise().query('DELETE FROM training_attendees WHERE training_id = ?', [p.id]);
    await connection.promise().query('DELETE FROM training_programs WHERE id = ?', [p.id]);
    console.log(`Cleaned up training_program ID: ${p.id}`);
  }

  // Remove Gemini's trainers (IDs 5-8) — we'll re-create them properly
  await connection.promise().query('DELETE FROM trainers WHERE id IN (5, 6, 7, 8)');
  console.log('Cleaned up Gemini trainers 5-8');

  console.log('\n=== Creating tanmay1-4 as proper employees + external trainers ===');

  const passwordHash = await bcrypt.hash('admin123', 10);

  // Check/create External Trainer designation
  let [desg] = await connection.promise().query(
    "SELECT designationId FROM designation WHERE designationName = 'External Trainer'"
  );
  let extTrainerDesignationId;
  if (desg.length === 0) {
    const [insertDesg] = await connection.promise().query(
      "INSERT INTO designation (designationName, designationSlug, access) VALUES ('External Trainer', 'external-trainer', '0000000000000000,0000,1000000000000000000000,00000')"
    );
    extTrainerDesignationId = insertDesg.insertId;
    console.log(`Created designation: External Trainer (ID: ${extTrainerDesignationId})`);
  } else {
    extTrainerDesignationId = desg[0].designationId;
    console.log(`Found existing designation: External Trainer (ID: ${extTrainerDesignationId})`);
  }

  const trainersData = [
    {
      customId: 'EXT-001',
      name: 'tanmay1',
      email: 'tanmay1@college.com',
      phone: '9876543231',
      organization: 'FullStack Academy',
      specialization: 'Web Full Stack & React',
      training: {
        title: 'Modern React & Node.js Masterclass',
        startDate: '2026-09-15',
        endDate: '2026-09-30',
        skills: [5, 1], // Web Development, Python
        employees: [1, 2, 4], // Rajesh, Meena, Sneha
        sessions: [
          { name: 'React Hooks & State Management', date: '2026-09-16', start: '10:00', end: '12:00', desc: 'React Hooks, Context, and Redux' },
          { name: 'REST APIs with Express & JWT', date: '2026-09-20', start: '14:00', end: '16:00', desc: 'Backend APIs and Authentication' },
          { name: 'Full Stack Deployment', date: '2026-09-25', start: '10:00', end: '12:00', desc: 'End-to-end full stack project' },
        ]
      }
    },
    {
      customId: 'EXT-002',
      name: 'tanmay2',
      email: 'tanmay2@college.com',
      phone: '9876543232',
      organization: 'Cloud Solutions Corp',
      specialization: 'Cloud & AWS Solutions',
      training: {
        title: 'AWS Cloud & DevOps Bootcamp',
        startDate: '2026-10-01',
        endDate: '2026-10-15',
        skills: [1], // Python
        employees: [3, 6, 7], // Amit, Kavita, Rahul
        sessions: [
          { name: 'EC2, S3 & VPC Networking', date: '2026-10-02', start: '10:00', end: '12:00', desc: 'Core AWS cloud architecture' },
          { name: 'CI/CD & Docker Containers', date: '2026-10-08', start: '10:00', end: '12:00', desc: 'Automated deployment pipelines' },
        ]
      }
    },
    {
      customId: 'EXT-003',
      name: 'tanmay3',
      email: 'tanmay3@college.com',
      phone: '9876543233',
      organization: 'CyberShield Security',
      specialization: 'Ethical Hacking & Cybersecurity',
      training: {
        title: 'Penetration Testing Workshop',
        startDate: '2026-10-10',
        endDate: '2026-10-25',
        skills: [4], // Cybersecurity
        employees: [4, 5, 8], // Sneha, Vinod, Suresh
        sessions: [
          { name: 'OWASP Top 10 Exploits', date: '2026-10-12', start: '11:00', end: '13:00', desc: 'Hands-on vulnerability testing' },
          { name: 'Network Defense & Wireshark', date: '2026-10-18', start: '11:00', end: '13:00', desc: 'Packet analysis and firewall config' },
        ]
      }
    },
    {
      customId: 'EXT-004',
      name: 'tanmay4',
      email: 'tanmay4@college.com',
      phone: '9876543234',
      organization: 'DataMinds AI',
      specialization: 'Machine Learning & Generative AI',
      training: {
        title: 'Deep Learning & AI Systems',
        startDate: '2026-11-01',
        endDate: '2026-11-15',
        skills: [3], // Machine Learning
        employees: [2, 3, 9], // Meena, Amit, Priya
        sessions: [
          { name: 'Neural Networks & PyTorch', date: '2026-11-03', start: '14:00', end: '16:00', desc: 'Deep learning model training' },
          { name: 'LLMs & Fine-Tuning', date: '2026-11-10', start: '14:00', end: '16:00', desc: 'Transformer architectures and prompt tuning' },
        ]
      }
    }
  ];

  for (const item of trainersData) {
    // 1. Create employee record (so they can log in via normal login)
    let employeeId;
    const [existingEmp] = await connection.promise().query(
      'SELECT employeeId FROM employee WHERE employeeEmail = ?', [item.email]
    );

    if (existingEmp.length > 0) {
      employeeId = existingEmp[0].employeeId;
      console.log(`Employee already exists: ${item.name} (ID: ${employeeId})`);
    } else {
      const [empRes] = await connection.promise().query(
        `INSERT INTO employee (customEmployeeId, employeeName, companyName, employeeQualification,
         experienceInYears, employeeGender, employeePhone, employeeEmail, employeePassword,
         employeeAccess)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.customId,
          item.name,
          item.organization,
          item.specialization,
          3,
          'Male',
          item.phone,
          item.email,
          passwordHash,
          '0000000000000000,0000,1000000000000000000000,00000'
        ]
      );
      employeeId = empRes.insertId;
      console.log(`Created employee: ${item.name} (ID: ${employeeId})`);
    }

    // 2. Create employeeDesignation
    const [existingED] = await connection.promise().query(
      'SELECT employeeDesignationId FROM employeedesignation WHERE employeeId = ?', [employeeId]
    );
    if (existingED.length === 0) {
      await connection.promise().query(
        'INSERT INTO employeedesignation (employeeId, departmentId, designationId, managerId) VALUES (?, ?, ?, ?)',
        [employeeId, 1, extTrainerDesignationId, null] // CS department, External Trainer
      );
      console.log(`  → Assigned to CS department as External Trainer`);
    }

    // 3. Create entry in trainers table (for External Trainers page)
    const [existingTrainer] = await connection.promise().query(
      'SELECT id FROM trainers WHERE email = ?', [item.email]
    );
    if (existingTrainer.length === 0) {
      await connection.promise().query(
        `INSERT INTO trainers (trainer_type, employee_id, full_name, email, phone, organization,
         specialization, password, expiry_date, is_active)
         VALUES ('EXTERNAL', ?, ?, ?, ?, ?, ?, ?, '2027-12-31', 1)`,
        [String(employeeId), item.name, item.email, item.phone, item.organization,
         item.specialization, passwordHash]
      );
      console.log(`  → Created external trainer record`);
    }

    // 4. Create training record (using real employeeId as trainerId)
    let trainingId;
    const [existingTraining] = await connection.promise().query(
      'SELECT trainingId FROM training WHERE trainingTitle = ? AND trainerId = ?',
      [item.training.title, employeeId]
    );
    if (existingTraining.length > 0) {
      trainingId = existingTraining[0].trainingId;
    } else {
      const [tRes] = await connection.promise().query(
        'INSERT INTO training (trainerId, trainingTitle, startTrainingDate, endTrainingDate, evaluationType) VALUES (?, ?, ?, ?, ?)',
        [employeeId, item.training.title, item.training.startDate, item.training.endDate, 1]
      );
      trainingId = tRes.insertId;
      console.log(`  → Created training: ${item.training.title} (ID: ${trainingId})`);
    }

    // 5. Link skills
    for (const skillId of item.training.skills) {
      await connection.promise().query(
        'INSERT IGNORE INTO trainingskills (trainingId, skillId) VALUES (?, ?)',
        [trainingId, skillId]
      );
    }

    // 6. Register enrolled employees
    for (const empId of item.training.employees) {
      await connection.promise().query(
        'INSERT IGNORE INTO trainingregistration (employeeId, trainingId) VALUES (?, ?)',
        [empId, trainingId]
      );
    }

    // 7. Create sessions and attendance
    for (const s of item.training.sessions) {
      let sessionId;
      const [existSess] = await connection.promise().query(
        'SELECT sessionId FROM sessions WHERE trainingId = ? AND sessionName = ?',
        [trainingId, s.name]
      );
      if (existSess.length > 0) {
        sessionId = existSess[0].sessionId;
      } else {
        const [sessRes] = await connection.promise().query(
          'INSERT INTO sessions (sessionName, sessionDate, sessionStartTime, sessionEndTime, trainingId, sessionDescription) VALUES (?, ?, ?, ?, ?, ?)',
          [s.name, s.date, s.start, s.end, trainingId, s.desc]
        );
        sessionId = sessRes.insertId;
        console.log(`  → Created session: ${s.name} (ID: ${sessionId})`);
      }

      // Mark attendance
      for (const empId of item.training.employees) {
        await connection.promise().query(
          'INSERT IGNORE INTO attendance (employeeId, sessionId, attendanceStatus) VALUES (?, ?, 1)',
          [empId, sessionId]
        );
      }
    }

    // 8. Also create training_programs & training_attendees for the Training Records page
    const [existProg] = await connection.promise().query(
      'SELECT id FROM training_programs WHERE title = ?', [item.training.title]
    );
    if (existProg.length === 0) {
      // Find the trainers table ID for this trainer
      const [trainerRow] = await connection.promise().query(
        'SELECT id FROM trainers WHERE email = ?', [item.email]
      );
      if (trainerRow.length > 0) {
        const [pRes] = await connection.promise().query(
          'INSERT INTO training_programs (title, description, trainer_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?)',
          [item.training.title, item.training.sessions[0].desc, trainerRow[0].id,
           item.training.startDate + ' 10:00:00', item.training.endDate + ' 16:00:00', 'IN_PROGRESS']
        );
        for (const empId of item.training.employees) {
          await connection.promise().query(
            'INSERT IGNORE INTO training_attendees (training_id, employee_id, status) VALUES (?, ?, ?)',
            [pRes.insertId, empId, 'ATTENDED']
          );
        }
      }
    }

    console.log(`✅ ${item.name} ready — login: ${item.email} / admin123\n`);
  }

  console.log('=== All done! ===');
  console.log('Login credentials:');
  console.log('  tanmay1@college.com / admin123');
  console.log('  tanmay2@college.com / admin123');
  console.log('  tanmay3@college.com / admin123');
  console.log('  tanmay4@college.com / admin123');
  console.log('\nAfter login, they see: Sidebar → Training → Trainer Status');
  process.exit(0);
}

seedExternalTrainersAsEmployees().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
