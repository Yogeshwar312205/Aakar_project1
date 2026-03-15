import mysql from 'mysql2';

const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Shinde@24',
  database: 'aakar',
  port: 3306,
});

const run = (sql) =>
  new Promise((resolve, reject) => {
    conn.query(sql, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });

try {
  await run(`ALTER TABLE bomdetails ADD COLUMN stageId INT(10) UNSIGNED NULL`);
  console.log('Added stageId column to bomdetails.');
} catch (error) {
  if (String(error.message).includes('Duplicate column name')) {
    console.log('stageId column already exists in bomdetails.');
  } else {
    console.error('Failed to add stageId column:', error.message);
    process.exitCode = 1;
  }
}

try {
  await run(`CREATE INDEX bomdetails_stage_idx ON bomdetails(stageId)`);
  console.log('Ensured index: bomdetails_stage_idx');
} catch (error) {
  if (String(error.message).includes('Duplicate key name')) {
    console.log('Index bomdetails_stage_idx already exists.');
  } else {
    console.error('Failed to create stage index:', error.message);
    process.exitCode = 1;
  }
}

conn.end();
