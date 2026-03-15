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
  // Drop FK safely if it exists.
  try {
    await run('ALTER TABLE bomdetails DROP FOREIGN KEY bomdetails_project_fk');
    console.log('Dropped FK: bomdetails_project_fk');
  } catch (e) {
    console.log('FK bomdetails_project_fk not dropped:', e.message);
  }

  // Optional: keep plain index for performance.
  try {
    await run('CREATE INDEX bomdetails_project_idx ON bomdetails(projectNumber)');
    console.log('Ensured index: bomdetails_project_idx');
  } catch (e) {
    console.log('Index creation skipped:', e.message);
  }

  console.log('BOM FK fix completed.');
} catch (error) {
  console.error('Failed to fix BOM FK:', error.message);
  process.exitCode = 1;
} finally {
  conn.end();
}
