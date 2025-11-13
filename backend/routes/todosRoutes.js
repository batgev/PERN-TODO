import express from 'express'
import authMiddleware from '../middlewares/authMiddleware.js'
import pool from '../db.js'
const router = express.Router()


//user info endpoint
router.get('/user',authMiddleware, async(req,res)=>{
    try {
        const user = req.user
     res.status(200).json({
        message:`Welcome ${user.username}`,
        data:{
            username:user.username,
            email:user.email,
            picture:`https://backend-1vjp.onrender.com/${user.profile_picture}`
        }
    })
    } catch (error) {
        res.status(500).json({error:"Internal Server Error"})
    }
})


//displaying todo's endpoint
router.get('/task',authMiddleware,async(req,res)=>{
    const user = req.user
        
    try {
        const result = await pool.query('SELECT * FROM user_todo  WHERE user_id=$1 ORDER BY created_at ASC',[user.id])
       const userResult = result.rows         
        res.json(userResult)
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error fetching user data')
        
    }
})

//adding a toDo
router.post('/addTodo',authMiddleware,async(req,res)=>{
  const {title,description,dueDate} = req.body
  const user = req.user
  
  
  try {
    if(!title || !description || !dueDate){
        return res.status(401).json({error:"Please Provide Valid Information"})
    }

    const result = await pool.query('INSERT INTO user_todo(user_id,title,description,due_date) VALUES($1,$2,$3,$4) RETURNING *',[user.id,title,description,dueDate])
    const data = result.rows[0]
    updateCount(user.id)
    
    
    if(result.rowCount ===0){
        return res.status(500).json({error:"Something Went Wrong"})
    }
    res.status(200).json({message:"Task added",data})
  } catch (error) {
    console.error(error.message);
    res.status(500).json({error:"Internal Server Error"})
    
  }
  
})

//deleting a todo endpoint
router.delete('/delete/:id',authMiddleware,async(req,res)=>{
    const {id} = req.params
    
    
    try {
         await pool.query('DELETE  FROM user_todo WHERE id = $1 RETURNING *',[id])
        res.json({message:"Task Deleted"})
    } catch (error) {
        console.error(error.message);
        res.status(500).json({error:"Internal Server Error"})
        
    }
})

//completing a todo
router.post('/complete/:id',authMiddleware,async(req,res)=>{
    const {id} = req.params
    try {
        const result = await pool.query(`UPDATE user_todo SET is_completed = ${true} WHERE id=$1 RETURNING *`,[id])
        const isComplete = result.rows[0]
        if(!isComplete){
            return res.status(401).json({error:"No todo found"})
        }
        res.status(200).json({message:"Task Completed"})
    } catch (error) {
        console.error(error.message);
        res.status(500).json({error:"Internal server error"})
        
    }
})

const updateCount = async(id)=>{
    try {
          await pool.query('UPDATE user_data SET todo_count = todo_count + 1 WHERE id=$1',[id])
          console.log('done');
          
    } catch (error) {
        console.log(error.message);
        
    }
}


export default router
