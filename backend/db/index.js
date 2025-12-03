import mysql from 'mysql2'
import ApiError from '../utils/ApiError.js'

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Aakar@2025',
  // password: 'password',
  database: 'commonDB12',
  port:3306 
})

connection.connect((err) => {
  if (err) {
    console.log(new ApiError(500, 'Database connection failed.'))
    process.exit(1)
  } else {
    console.log('Connected to database as ID: ' + connection.threadId)
  }
})

export { connection }
