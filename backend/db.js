import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const {Pool} = pkg

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: 
        process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

pool.connect().then(
    console.log(`Connected to the neondb database`)
).catch(err=>{
    console.log(err.message);
    
})
export default pool
