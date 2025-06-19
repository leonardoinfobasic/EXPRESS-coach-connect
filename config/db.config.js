const mysql = require("mysql2/promise")
const dotenv = require("dotenv")

dotenv.config()

// Configurazione del pool di connessioni MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "coachconnect",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Test della connessione al database
async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log("Connessione al database MySQL stabilita con successo")
    connection.release()
    return true
  } catch (error) {
    console.error("Errore nella connessione al database MySQL:", error)
    return false
  }
}

module.exports = {
  pool,
  testConnection,
}
