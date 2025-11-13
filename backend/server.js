import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import bodyParser from 'body-parser'
import todoRoutes from './routes/todosRoutes.js'
import  authMiddleware  from './middlewares/authMiddleware.js'
import path from 'path'
dotenv.config()

const app = express()
const PORT = 5003

app.use(cors(
    origin:"https://taskmanager-pcp0.onrender.com/"
))
app.use(express.json())
app.use(bodyParser.json({limit:"20mb"}))
app.use('/uploads',express.static(path.join(process.cwd(),"uploads")))
//authentication routes
app.use('/api/auth',authRoutes)
//todoRoutes route
app.use('/api/todo',authMiddleware,todoRoutes)
app.listen(PORT,()=>{
    console.log(`Server is up and running on Port ${PORT}`);
    
})
