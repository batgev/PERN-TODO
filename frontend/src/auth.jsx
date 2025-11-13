import { useState } from "react"
import toast from "react-hot-toast"
import {useNavigate} from 'react-router-dom'
import { API_URL } from "./api.js"
const  Auth =()=> {
    const [username,setUsername] = useState('')
    const [email,setEmail] = useState('')
    const [password,setPassword] = useState('')
    const [picture,setPicture] = useState(null)
    const [isLogin,setIsLogin] = useState(false)

    const navigate = useNavigate()
    //handling registeration
    // store File instead of base64
    const handleFileChange = (e)=>{
        const file = e.target.files && e.target.files[0]
        if(!file) return setPicture(null)
        if (file.size > 5 * 1024 * 1024) return toast.error('Image too large (max 5MB)')
        if (!file.type.startsWith('image/')) return toast.error('Only images allowed')
        setPicture(file) // store File object
    }

    const handleFormSubmit = async(e)=>{
        e.preventDefault()
        // validate minimal fields client-side
        if(!username || !email || !password){
            return toast.error('username, email and password are required')
        }

        try {
            const formData = new FormData()
            formData.append('username', username)
            formData.append('email', email)
            formData.append('password', password)
            if (picture) formData.append('picture', picture) // File

            const res = await fetch(`${API_URL}/api/auth/register`,{
                method:'POST',
                body: formData // browser sets Content-Type with boundary
            })
            const data = await res.json()

            if(!res.ok){
                return toast.error(data.error || 'Registration failed')
            }

            toast.success(data.message || 'Registered')
            // switch to login view only on success
            setIsLogin(true)
        } catch (error) {
            console.log(error)
            toast.error('Network error')
        }
    }
    //login function
    const handleLoginSubmit = async(e)=>{
        e.preventDefault()
        if(!username || !password) return toast.error('username and password required')

        try {
            const res = await fetch(`${API_URL}/api/auth/login`,
                {
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body:JSON.stringify({username,password})
                }
            )
            const data = await res.json()
            if(!res.ok){
                return toast.error(data.error || 'Login failed')
            }
            if(!data.token){
                 return toast.error("No token received")
            }
            
           localStorage.setItem('token',data.token)
           toast.success(data.message || 'Logged in')
           setTimeout(()=>{
            if(username ==="superadmin"){
              navigate('/admin')
            }else{
              navigate('/todoPage')
            }
                
           },800)
        } catch (error) {
            console.log(error.message);
            toast.error('Network error')
        }
    }

    // file input helper
   

  return (
    <div className="flex flex-col  items-center  h-[100%] w-screen">
      <div className=" md:hidden h-[25vh]  w-screen flex flex-col justify-center  mb-4" style={{
          background:'linear-gradient(135deg,#007bff,#00c6fb)',
          borderBottomLeftRadius:'35%',
          borderBottomRightRadius:'35%'
      }}>
           <h2 className=" text-center text-white text-4xl">{isLogin ? 'Log into your account' :'Create an account'}</h2>
      </div>

      { /* Signup */ }
      {!isLogin && (
        <div className="w-[100%] md:w-1/3 p-4 flex flex-col">
          <form className="flex flex-col gap-2 mt-4 mb-4 w-[100%]" onSubmit={handleFormSubmit}>
              <label htmlFor="username" className="text-xl">*Username</label>
              <input type="text" id="username" value={username} onChange={(e)=> setUsername(e.target.value)} className="border-2 border-[#ccc] p-[10px] rounded-[10px ] outline-none"/>
              <label htmlFor="email" className="text-xl">*Email</label>
              <input type="email" id="email" value={email} onChange={(e)=> setEmail(e.target.value)} className="border-2 border-[#ccc] p-[10px] rounded-[10px ] outline-none"/>
              <label htmlFor="password" className="text-xl">*Password</label>
              <input type="password" id="password" value={password} onChange={(e)=> setPassword(e.target.value)} className="border-2 border-[#ccc] p-[10px] rounded-[10px ] outline-none"/>
              <label htmlFor="pic" className="text-xl">Profile Picture</label>
              <input type="file" name="picture" onChange={handleFileChange} className="border-2 border-[#ccc] p-[10px] rounded-[10px ] outline-none"/>
              <button type="submit" className="bg-blue-400 text-white py-1 text-xl rounded-md mt-4" style={{
                  background:'linear-gradient(135deg,#007bff,#00c6fb)'
              }}>Register</button>
          </form>
          <div className="flex gap-2 text-xl">Already have an account?
            <button className="underline text-blue-400 font-bold" onClick={()=> setIsLogin(true)}>Login</button>
          </div>
        </div>
      )}

      { /* Login */ }
      {isLogin && (
        <div className="w-screen h-[60vh] md:w-1/3 p-4 flex-col items-center justify-center">
          <h2 className=" text-center text-2xl">Login</h2>
          <form className="flex flex-col  mb-4 w-[90%]" onSubmit={handleLoginSubmit}>
              <label htmlFor="login-username" className="text-2xl">*Username</label>
              <input id="login-username" type="text" className="border-2 border-[#ccc] rounded-[5px] outline-none p-[10px]  mb-4" value={username} onChange={(e)=> setUsername(e.target.value)}/>
              <label htmlFor="login-password" className="text-2xl">*Password</label>
               <input id="login-password" type="password" className="border-2 border-[#ccc] rounded-[5px] outline-none p-[10px] mb-4"  value={password} onChange={(e)=> setPassword(e.target.value)}/>
               <button type="submit" className="text-white py-1 text-xl font-bold rounded-[5px] p-[5px]" style={{background:'linear-gradient(135deg,#007bff,#00c6fb)'}}>Login</button>
          </form>
          <span className="text-xl">Dont have an account?
            <button className="underline text-blue-400 font-bold" onClick={()=> setIsLogin(false)}>Register</button>
          </span>
        </div>
      )}
    </div>
  )
}

export default Auth