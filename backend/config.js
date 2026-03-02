// config.js
import dotenv from 'dotenv'
dotenv.config()

import mysql from 'mysql2'

const pool = mysql
  .createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'Ashutosh@2003',
    database: 'commondb1',
  })
  .promise()

export default pool
