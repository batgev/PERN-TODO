import jwt from 'jsonwebtoken'
import pool from '../db.js'


 const authMiddleware = async(req,res,next)=>{
   
    try {
        const authHeader = req.header('Authorization');
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).json({error:"No token found"})
        }

        const token = authHeader.replace('Bearer ','');
        const decoded = jwt.verify(token,process.env.JWT_SECRETS)

        const userResult = await pool.query("SELECT id,username,email,profile_picture FROM user_data WHERE id=$1",[decoded.id])

        if(userResult.rows.length === 0){
            return res.status(401).json({error:"User not Found"})
        }
        req.user = userResult.rows[0]
        next();
    } catch (error) {
        console.log(error.message);
        res.status(500).json({error:"Internal Server Error"})
        
    }         
}
export default authMiddleware