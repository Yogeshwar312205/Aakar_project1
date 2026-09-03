import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true
})

console.log('Connected to database\n')
console.log('========== TRAINERS MODULE MIGRATION ==========\n')

try {
  // Read the migration file
  const migrationPath = path.join(__dirname, '..', 'migrations', 'trainers_module.sql')
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
  
  console.log('Running migration...\n')
  
  // Execute the migration
  await connection.query(migrationSQL)
  
  console.log('✅ Migration completed successfully!\n')
  console.log('Created tables:')
  console.log('  1. trainers - Store trainer information (Internal/External)')
  console.log('  2. training_programs - Store training sessions')
  console.log('  3. training_attendees - Track employee attendance\n')
  
  // Verify tables were created
  const [tables] = await connection.query(`
    SELECT TABLE_NAME 
    FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = ? 
    AND TABLE_NAME IN ('trainers', 'training_programs', 'training_attendees')
  `, [process.env.DB_NAME])
  
  console.log('Verified tables in database:')
  tables.forEach(t => console.log(`  ✓ ${t.TABLE_NAME}`))
  
  console.log('\n🎉 You can now add external trainers!')
  
} catch (error) {
  console.error('❌ Migration failed:', error.message)
  console.error('\nError details:', error)
} finally {
  await connection.end()
}
