import mysql from 'mysql2'
import ApiError from '../utils/ApiError.js'
import dotenv from 'dotenv'
dotenv.config()

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aakar',
  port: process.env.DB_PORT || 3306
})

connection.connect((err) => {
  if (err) {
    console.log(new ApiError(500, `Database connection failed. ${err.message}`))
    process.exit(1)
  } else {
    console.log('Connected to database as ID: ' + connection.threadId)
  }
})

export { connection }
