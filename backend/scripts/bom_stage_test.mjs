import mysql from 'mysql2';

const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Shinde@24',
  database: 'aakar',
  port: 3306,
});

const q = (sql, params = []) => new Promise((resolve, reject) => {
  conn.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
});

try {
  const stages = await q('SELECT stageId, stageName, projectNumber FROM stage WHERE projectNumber = ? ORDER BY stageId LIMIT 2', [69]);
  console.log('STAGES:', stages);

  if (stages.length >= 1) {
    const s1 = stages[0].stageId;
    await q(
      'INSERT INTO itemmaster (itemCode, itemName, specification) VALUES (?, ?, ?)',
      ['STAGE-TST-1', 'Stage Test Item 1', 'Per-stage visibility test']
    );
    const item = await q('SELECT MAX(itemId) AS itemId FROM itemmaster');
    await q(
      'INSERT INTO bomdetails (itemId, ELength, EWidth, EHeight, EQuantity, ALength, AWidth, AHeight, AQuantity, projectNumber, stageId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [item[0].itemId, 1, 1, 1, 1, 1, 1, 1, 1, 69, s1]
    );
    console.log('Inserted one stage-scoped BOM row for stageId:', s1);
  }

  const bomRows = await q('SELECT bomId, projectNumber, stageId, itemId FROM bomdetails WHERE projectNumber = ? ORDER BY bomId DESC LIMIT 10', [69]);
  console.log('LATEST_BOM_ROWS:', bomRows);
} catch (e) {
  console.error('TEST_ERR:', e.message);
  process.exitCode = 1;
} finally {
  conn.end();
}
