import { useEffect, useState } from "react"
import toast from 'react-hot-toast'
import { Link } from "react-router-dom"
import { API_URL } from "./api.js"
function Admin() {
  const [usernames,setUsernames] = useState([])
  let [totalTask,setTotalTask] = useState()
  const [totalUsers,setTotalUsers] = useState()
 
  
  const token = localStorage.getItem('token')

      const fetchData = async()=>{
      try {
        const res = await fetch(`${API_URL}/api/auth/getusers`,
          {
            method:'GET',
            headers:{"Authorization":`Bearer ${token}`}
          }
        )
        const data = await res.json()
        if(!res.ok){
          toast.error(data.error)
        }
        
        
       
         if (Array.isArray(data)) {
          setUsernames(data)
          
        } else if (Array.isArray(data.data)) {
          setUsernames(data.data)
          
        } else {
          // unexpected shape — clear tasks and log
          setUsernames([])
          
          console.error('Unexpected /task response shape:', data)
        }
         //setIds(data.id)
         
         //setPictures(data.profile_picture)
      } catch (error) {
        console.error(error.message);
        toast.error("Network Error")
        
      }
    }
    const getTotalUsers = async()=>{
     
      try {
        const res = await fetch(`${API_URL}/api/auth/totalusers`,
          {
            method:'GET',
            headers:{"Authorization":`Bearer ${token}`}
          })
          const data = await res.json()
          setTotalUsers(data[0].count)
      } catch (error) {
        toast.error("Network Error")
        console.error(error.message);
        
      }
    }
    const getTotalTask = async()=>{
      try {
        const res = await fetch(`${API_URL}/api/auth/totaltask`,
          {
            method:'GET',
            headers:{"Authorization":`Bearer ${token}`}
          })
          const data = await res.json()
          setTotalTask(data[0].count)
      } catch (error) {
        toast.error("Network Error")
        console.error(error.message);
        
      }
    }




    //deleting a users account as admin
    const handleDeleteUser = async(id)=>{
       if(!window.confirm("Are you sure you want to delete this task?")) return;
      
          try {
        const res = await fetch(`${API_URL}/api/auth/admindelete/${id}`,
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
          fetchData()
          getTotalTask()
          getTotalUsers()
      } catch (error) {
        console.error(error.message);
        toast.error("Network Error")
      }
      }
    
  useEffect(()=>{
    fetchData()
    getTotalTask()
    getTotalUsers()
       
  },[])
  
  return <div className="bg-[url('assets/background.svg')] bg-cover  h-screen text-xl p-4">
      <div className="flex flex-col justify-between gap-4 items-center h-full">
        <h2 className="bg-emerald-800 w-[60%] rounded-md text-center mt-4 text-white font-bold  py-2">Welcome Admin</h2>
       <div className="-mt-19 h-[80%] py-4 overflow-y-auto">
            <div className="flex flex-col w-[90vw] bg-gray-300  p-2 shadow-md shadow-black">
          <span>Total Users:<span className="font-bold text-2xl ml-2">{totalUsers}</span></span>
          <span>Total Created Tasks:<span className="font-bold text-2xl ml-2">{totalTask}</span></span>
          
        </div>
        <div className="flex flex-col gap-4 justify-center items-center mt-8">
          <h2>More Details</h2>
          <ul className="flex flex-col gap-4 w-[90vw]">
              {usernames.map((username)=><li className="flex gap-8 items-center shadow shadow-black"> 
                
                <span>
                  <img src={`${API_URL}/${username.profile_picture}`} alt="profile picture"  className="rounded-full object-cover w-[80px] h-[80px]"/>
                </span>
                <div className="flex flex-col">
                  <span>{username.username}</span>
                  <div>
                     <span>Total Tasks: {username.todo_count}</span>
                  </div>
                  <button type="button" className="text-[red]" onClick={()=>{
                    handleDeleteUser(username.id)
                  }}>Delete User</button>
                </div>
                
          </li>
            )}
              
          </ul>
          </div>
      
       </div>
        <Link to='/' className="text-blue-900">Logout</Link>
      </div>
    </div>
  
}

export default Admin