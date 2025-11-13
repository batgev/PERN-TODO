import express from 'express'
import dotenv from 'dotenv'
import pool from '../db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
import multer from 'multer' // added
import authMiddleware from '../middlewares/authMiddleware.js'

dotenv.config()

const router = express.Router()

// ensure uploads dir exists
const uploadsDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || '.png'
        cb(null, `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`)
    }
})
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) return cb(new Error('Only images allowed'))
        cb(null, true)
    }
})

//registration endpoint
router.post('/register', upload.single('picture'), async (req, res) => {
    
    const { username, email, password } = req.body
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'username, email and password are required' })
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10)

        const filePath = req.file ? path.join('uploads', req.file.filename) : null

        const result = await pool.query(
            'INSERT INTO user_data(username,email,password,profile_picture) VALUES($1,$2,$3,$4) RETURNING *',
            [username, email, hashedPassword, filePath]
        )

        if (result.rowCount === 0) {
            return res.status(500).json({ error: 'Failed to register' })
        }

        const user = result.rows[0]
        delete user.password
        res.status(201).json({ message: 'User registered successfully', user })
    } catch (error) {
        console.error(error)
        // multer fileFilter / limits errors come here as well
        res.status(500).json({ error: error.message || 'Internal Server error' })
    }
})

//login endpoint
router.post('/login', async (req, res) => {
    // ...existing code...
    const { username, password } = req.body
    try {
        const result = await pool.query('SELECT * FROM user_data WHERE username = $1', [username])
        const user = result.rows[0]

        if (!user) {
            return res.status(401).json({ error: 'User not found' })
        }

        const verifiedPassword = await bcrypt.compare(password, user.password)
        if (!verifiedPassword) {
            return res.status(401).json({ error: 'Incorrect Password' })
        }

        const jwtSecret = process.env.JWT_SECRET || process.env.JWT_SECRETS
        if (!jwtSecret) {
            console.error('Missing JWT secret env var')
            return res.status(500).json({ error: 'Server misconfiguration' })
        }

        const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '60m' })
        const { password: pw, ...userSafe } = user
        res.status(200).json({ message: 'Logged in Successfully', token, user: userSafe })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

//deleting user account
router.delete('/delete',authMiddleware,async(req,res)=>{
    const user = req.user
    try {
        await pool.query('DELETE FROM user_data WHERE id=$1 RETURNING *',[user.id])
        res.status(200).json({message:"User Deleted"})
    } catch (error) {
       console.error(error.message);
       res.status(500).json({error:"Internal Server Error"})
        
    }
})

//fetching data for admin
router.get('/getusers',authMiddleware,async(req,res)=>{
    try {
        const results = await pool.query('SELECT * FROM user_data  ORDER BY username DESC')
        
                
          const data = results.rows
       res.json(data)
    } catch (error) {
        console.error(error.message);
        res.status(500).json({error:"Internal Server Error"})
        
    }
})

//getting total users
router.get('/totalusers',authMiddleware,async(req,res)=>{
    try {
        const totalTask = await pool.query('SELECT COUNT(*) FROM user_data')          
        res.json(totalTask.rows)
    } catch (error) {
      res.status(500).json({error:"Internal Server Error"})  
    }
})

//getting total todos
router.get('/totaltask',authMiddleware,async(req,res)=>{
    try {
        const totalTask = await pool.query('SELECT COUNT(*) FROM user_todo')          
        res.json(totalTask.rows)
    } catch (error) {
      res.status(500).json({error:"Internal Server Error"})  
    }
})

//admin deleting a user
router.delete('/admindelete/:id',authMiddleware,async(req,res)=>{
    const {id} = req.params
       
    try {
        const result = await pool.query('DELETE FROM user_data WHERE id=$1 RETURNING *',[id])
         res.status(200).json({message:"User Deleted"})
    } catch (error) {
        console.error(error.message);
       res.status(500).json({error:"Internal Server Error"})
        
    }
})

export default router
