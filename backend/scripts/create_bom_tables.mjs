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
  await run(`
    CREATE TABLE IF NOT EXISTS itemmaster (
      itemId INT UNSIGNED NOT NULL AUTO_INCREMENT,
      itemCode VARCHAR(100) NOT NULL,
      itemName VARCHAR(255) NOT NULL,
      specification TEXT DEFAULT NULL,
      PRIMARY KEY (itemId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS bomdetails (
      bomId INT UNSIGNED NOT NULL AUTO_INCREMENT,
      itemId INT UNSIGNED NOT NULL,
      ELength DECIMAL(10,2) DEFAULT NULL,
      EWidth DECIMAL(10,2) DEFAULT NULL,
      EHeight DECIMAL(10,2) DEFAULT NULL,
      EQuantity DECIMAL(10,2) DEFAULT NULL,
      ALength DECIMAL(10,2) DEFAULT NULL,
      AWidth DECIMAL(10,2) DEFAULT NULL,
      AHeight DECIMAL(10,2) DEFAULT NULL,
      AQuantity DECIMAL(10,2) DEFAULT NULL,
      projectNumber INT(10) UNSIGNED NOT NULL,
      PRIMARY KEY (bomId),
      KEY bomdetails_itemId_fk (itemId),
      KEY bomdetails_project_fk (projectNumber),
      CONSTRAINT bomdetails_itemId_fk FOREIGN KEY (itemId) REFERENCES itemmaster(itemId) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT bomdetails_project_fk FOREIGN KEY (projectNumber) REFERENCES project(projectNumber) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);

  console.log('BOM tables ensured successfully.');
} catch (error) {
  console.error('Failed to create BOM tables:', error.message);
  process.exitCode = 1;
} finally {
  conn.end();
}
