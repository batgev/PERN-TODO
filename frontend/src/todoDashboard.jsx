import toast from 'react-hot-toast'
import { useEffect, useState } from "react"
import { API_URL } from './api.js'
import {useNavigate} from 'react-router-dom'
const TodoDashboard = ()=> {
  const [toggleMenu,setToggleMenu] = useState(false)
  const [profile,setProfile] = useState("")
  const [tasks,setTasks] = useState([])
  const [toggleAddTodo,setAddTodo] = useState(false)
  const [isComplete,setIsComplete] = useState(false)

  const [filteredTask,setFilteredTask] = useState([])
  //adding todos
  const [title,setTitle] = useState("")
  const [description,setDescription] = useState("")
  const [dueDate,setDueDate] = useState("")
  const navigate = useNavigate()

  //fetching users data on load
   const fetchUserData = async()=>{
      const token = localStorage.getItem('token')
      try {
        const res = await fetch(`${API_URL}/api/todo/user`,{
          method:'GET',
          headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}
        })
        const data = await res.json()
        if (!res.ok) {
          console.error('user fetch error', data)
          return toast.error(data.error || 'Failed to fetch user')
        }
        
        setProfile(data.data?.picture || '')
        toast.success(data.message || 'Welcome')
      } catch (error) {
        console.log(error.message);
        toast.error("Internal Server Error")
      }
    }

    //fetching todo's onload
    const fetchTodos = async()=>{
      const token = localStorage.getItem('token')
      try {
        const res = await fetch(`${API_URL}/api/todo/task`,{
          method:'GET',
          headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}
        })
        const data = await res.json()
        

        // Normalize response to an array before setting state
        if (Array.isArray(data)) {
          setTasks(data)
        } else if (Array.isArray(data.data)) {
          setTasks(data.data)
        } else {
          // unexpected shape — clear tasks and log
          setTasks([])
          console.error('Unexpected /task response shape:', data)
        }
      } catch (error) {
        console.log(error.message);
      }
    }

    //deleting a todo's function
    const handleDelete = async(id)=>{
      const token = localStorage.getItem('token')
     if(!window.confirm("Are you sure you want to delete this task?")) return;
      
      
          try {
        const res = await fetch(`${API_URL}/api/todo/delete/${id}`,
          {
            method:"DELETE",
            headers:
            {
              "Authorization":`Bearer ${token}`
            }
          })
          
          
          const data = await res.json()
          if(!res.ok){
            toast.error(data.error)
          }
          toast.success(data.message)
          fetchTodos()
      } catch (error) {
        console.error(error.message);
        toast.error("Network Error")
      }
      }
      
    

    //deleting a user's account
    const handleAccountDelete = async()=>{
      const token = localStorage.getItem("token")
      if(!window.confirm("Are you sure you want to delete your Account?")) return;
      
        try {
          const res = await fetch(`${API_URL}/api/auth/delete`,
            {
              method:"DELETE",
              headers:{"Authorization":`Bearer ${token}`}
            }
          )
          const data = await res.json()
          if(!res.ok){
            toast.error(data.error)
          }
          toast.success(data.message)
          navigate('/')
        } catch (error) {
          console.error(error.message);
          toast.error("Something went wrong")
          
        }
      }
    
  useEffect(()=>{  
    fetchTodos()
    fetchUserData()
  },[])
 
  //adding a todo
  const handleAddTodo = async(e)=>{
      e.preventDefault()
      const token = localStorage.getItem('token')
      try {
        const res = await fetch(`${API_URL}/api/todo/addTodo`,
          {
          method:"POST",
          headers:
          {"Content-Type":"application/json","Authorization":`Bearer ${token}`},
          body:JSON.stringify({title,description,dueDate})
        }
      )
        const data = await res.json()
        if(!res.ok){
          return toast.error(data.error)
        }
        toast.success(data.message)
        await fetchTodos()
        setTimeout(()=>{
          setAddTodo(false)
          
        },2000)
      } catch (error) {
        console.error(error.message);
        
      }
      
    }
  //completing a task
  const handleTaskComplete = async(id)=>{
    setIsComplete(true)
    const token = localStorage.getItem("token")
    if(isComplete){
      try {
     const res = await fetch(`${API_URL}/api/todo/complete/${id}`,
      {
        method:"POST",
        headers:{"Authorization":`Bearer ${token}`}
      }
    )
    if(!res.ok){
      toast.error(data.error)
    }
    const data = await res.json()
    toast.success(data.message)
    fetchTodos()
    } catch (error) {
      console.error(error.message);
      toast.error("Network issues")
      
    }
  }
 
    }
    
  return <div className="flex flex-col items-center justify-between w-full h-screen text-xl" style={{background:"url('assets/background.svg')",
    backgroundSize:'cover',
    
    
  }}>
    {/*header section */}
    <div className="flex justify-between items-center gap-8 mt-[5px] w-screen max-h-screen">
      
      {/*menu bar */}
      <div className="flex flex-col gap-4 ml-4">
        <img src="assets/menu.svg" alt="menu icon" width={45} className="shadow-md" onClick={()=>{
          setToggleMenu(!toggleMenu)
          setAddTodo(false)
          const todo = document.getElementById('todo')
              const todoCom = document.getElementById('todo-complete')
              todoCom.style.display ="none"
               todo.style.display ="none"
        }}/>

        {/*sidebar section */}
        <div  className={`${toggleMenu ? 'w-[70vw]':'right-[387px]'} flex flex-col justify-between fixed mt-[3rem] bg-emerald-600  h-[80vh] shadow-md text-2xl p-2  -ml-5 rounded-r-md overflow-x-hidden text-emerald-100`}>
          <ul className="flex flex-col gap-8  p-2 h-[95%]">
            <li className='shadow-md shadow-black px-2' onClick={()=>{
              setAddTodo(true)
              setToggleMenu(false)
            }}>Add Task</li>
            <li className='shadow-md shadow-black px-2' onClick={()=>{
              const todo = document.getElementById('todo')
              const todoCom = document.getElementById('todo-complete')
              todoCom.style.display ="none"
                   setFilteredTask( tasks.filter(task=>!task.is_completed))
                   todo.style.display ="flex"
            }}>Incompleted Task</li>
            <ul className='hidden text-yellow-500 text-[16px] list-disc ml-8 -mt-5 w-[70%] ' id='todo'>
              { filteredTask.map((filteredtask)=><li key={filteredtask.id} className=' px-4 tracking-wider shadow-md shadow-black w-[80%]'>{filteredtask.title}</li>)}
                                                     
            </ul>
            <li className='shadow-md shadow-black px-2' onClick={()=>{
                const todoCom = document.getElementById('todo-complete')
                const todo = document.getElementById('todo')
                   setFilteredTask( tasks.filter(task=>task.is_completed))
                   todoCom.style.display ="flex"
                    todo.style.display = "none"
            }}>Completed Task</li>
            <ul className='hidden text-yellow-500 text-[16px] list-disc ml-8 -mt-5 w-[70%] ' id='todo-complete'>
              { filteredTask.map((filteredtask)=><li key={filteredtask.id} className=' px-4 tracking-wider shadow-md shadow-black w-[80%]'>{filteredtask.title}</li>)}
                                     
            </ul>
            <li className='shadow-md shadow-black px-2'>Contact Support</li>
            <li className='shadow-md shadow-black px-2' onClick={()=>{
              navigate('/')
            }}>Logout</li>
          </ul>
          <span className="bg-white px-2 ml-4 text-red-500 font-bold w-[80%]" onClick={handleAccountDelete}>Delete Account</span>
        </div>
      </div>

      {/*user profile imge */}
      <div className="mr-4 border-4 border-red-800 rounded-full shadow-md">
        <img src={profile} alt="user profile"  className="rounded-full w-[80px] h-[80px]  object-cover"/>
      </div>
    </div>

  {/*main content */}
    <div className={`${!toggleAddTodo ? 'flex':'hidden'} flex-col items-center gap-4 w-screen`}>
      <h1 className="text-3xl font-bold">ToDo Manager</h1>
      <span className='flex shadow-md shadow-black rounded-full mb-[9px]'>
        <input type="text" className="border-2 border-emerald-800 w-[70vw] text-2xl rounded-l-full px-4 outline-none  " placeholder="Search for a todo..."/>
        <img src="assets/searchbtn.svg" alt="" className='border-2 border-emerald-800 px-2 bg-emerald-500 rounded-r-full' width={50}/>
      </span>
      {/*todo display area! */}
      <ul className='flex flex-col gap-4 h-[60vh] overflow-y-auto outline-none py-4'>
        {tasks.length === 0 ? <p className='text-gray-300'>No tasks yet..</p>: tasks.map((task)=>
            <li key={task.id} className='flex flex-col bg-yellow-100 shadow-md shadow-black p-2 min-w-[90vw] max-w-[95vw]'>
              <div className='flex justify-between mb-2'>
                <span className='bg-gray-300 border-2 shadow shadow-black text-emerald-800 font-bold text-2xl'>{task.title} </span>
                <span className='text-orange-600 text-sm'>{task.is_completed ? '✅Completed':" ❌Incomplete"}</span>
              </div>
              <span className='text-gray-800 font-bold'>{task.description ? task.description :"No todo's found"}</span>
              <span className={`text-sm ${task.is_completed ? 'line-through':''}`}>Due: {new Date(task.due_date).toLocaleDateString("en-US",{
                weekday:"short",
                year:"numeric",
                month:"short",
                day:"numeric"
              })}</span>
              
              <span className='flex justify-between mt-4'>
                <div className='bg-green-500 px-2 shadow shadow-black rounded-md text-white font-bold'>
                  <input type="checkbox"  checked={task.is_completed} value={isComplete} onChange={()=>{handleTaskComplete(task.id)}}/>
                <span>{task.is_completed ? " Completed" :"Complete Task"}</span>
                </div>
                <button className='bg-[red] px-2 font-bold text-white rounded-md shadow shadow-black' onClick={()=>{handleDelete(task.id)}}>Delete Task</button>
              </span>
            </li>)}
            
      </ul>
    </div>

            {/*addTodo section */}
            {toggleAddTodo ?  <div className='w-[90vw]  bg-gray-300 rounded-md' style={{
               position:'relative',
            zIndex:10,
            bottom:'-10px'
            }}>

        {/*adding a todo */}
        <form className='flex flex-col gap-2 p-2'>
            <div className='flex justify-evenly text-2xl font-bold'>
              <h2>Add a task</h2> 
              <span className='-mr-[5rem] shadow-md' onClick={()=>
                setAddTodo(false)
              }>
                <img src="assets/close.svg" alt="close icon" width={30}/>
              </span>
              </div>
            <label htmlFor="title"><span className='text-[red] text-2xl mr-1'>*</span>Title of task</label>
            <input type="text" id='title' className=' py-2 rounded-md outline-none border-2 border-[#ccc]' value={title} onChange={(e)=>{
              setTitle(e.target.value)
            }}/>
            <label htmlFor="description" ><span className='text-[red] text-2xl mr-1'>*</span>Description</label>
            <input type="text" id='description' className='py-2 rounded-md outline-none border-2 border-[#ccc]' value={description} onChange={(e)=>{
              setDescription(e.target.value)
            }}/>
            <label htmlFor="due_date" className='text-xl'><span className='text-[red] text-2xl mr-1'>*</span>Due Date</label>
            <input type="date" id='due_date' className='py-2 rounded-md outline-none border-2 border-[#ccc]' value={dueDate} onChange={(e)=>{
              setDueDate(e.target.value)
            }}/>
            <button type='button' onClick={handleAddTodo} className='bg-emerald-600 text-white rounded-md p-2'>Add Task</button>
        </form>
    </div> :""}


  {/*footer */}
    <footer className="flex justify-end w-screen ">
  <button className="bg-green-600  text-center mr-4 hover:scale-95 mb-4 p-4  rounded-full " onClick={()=>{
    setAddTodo(true)
    setToggleMenu(false)
  }}><img src="assets/addIcon.svg" alt="" width={40}/></button>
    </footer>
 </div>
}

export default TodoDashboard
