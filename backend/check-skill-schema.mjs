import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Shinde@24',
  database: 'aakar'
});

const [columns] = await connection.execute('DESCRIBE skill');
console.log('Skill table columns:');
console.table(columns);

await connection.end();
