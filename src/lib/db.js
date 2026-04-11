import mysql from 'mysql2/promise'

// Single connection pool — reused across all API routes
const pool = mysql.createPool({
  host:     'localhost',
  port:     3306,
  user:     'root',       // XAMPP default
  password: '',           // XAMPP default (empty password)
  database: 'campus_ar',
  waitForConnections: true,
  connectionLimit:    10,
})

export default pool