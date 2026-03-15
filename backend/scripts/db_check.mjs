import mysql from 'mysql2';

const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Shinde@24',
  database: 'aakar',
  port: 3306,
});

const query = (sql) =>
  new Promise((resolve, reject) => {
    conn.query(sql, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

try {
  const dbs = await query('SHOW DATABASES');
  console.log('DBS:', dbs.map((x) => Object.values(x)[0]).join(', '));

  const tables = await query('SHOW TABLES');
  console.log('AAKAR_TABLES:', tables.map((x) => Object.values(x)[0]).join(', '));

  try {
    const invTables = await query('SHOW TABLES FROM inventory');
    console.log('INVENTORY_TABLES:', invTables.map((x) => Object.values(x)[0]).join(', '));
  } catch (e) {
    console.log('INVENTORY_TABLES_ERR:', e.message);
  }

  const targets = [
    'SHOW COLUMNS FROM itemmaster',
    'SHOW COLUMNS FROM bomdetails',
    'SHOW COLUMNS FROM inventory.itemmaster',
    'SHOW COLUMNS FROM inventory.bomdetails',
  ];

  for (const sql of targets) {
    try {
      const cols = await query(sql);
      console.log(sql + ':', cols.map((c) => c.Field).join(', '));
    } catch (e) {
      console.log(sql + ' ERR:', e.message);
    }
  }
} finally {
  conn.end();
}
