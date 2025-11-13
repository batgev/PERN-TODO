import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const {Pool} = pkg

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: 
        process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err)
})

// Testing the connection
(async () => {
    try {
        await pool.connect()
        console.log('Connected to the neondb database')
    } catch (err) {
        console.error('Database connection failed:', err.message)
    }
})()
export default pool
