import {Toaster} from 'react-hot-toast'
import Auth from "./auth";
import TodoDashboard from "./todoDashboard";
import {createHashRouter,RouterProvider} from 'react-router-dom'
import Admin from './Admin';
function App() {
  const router = createHashRouter([{
    path:"/",
    element:<Auth />
  },{
    path:'/todoPage',
    element:<TodoDashboard />
  },
{
  path:'admin',
  element:<Admin/>
}])
  return <div className="h-screen">  
   <RouterProvider router={router}/>
    <Toaster />
  </div>
   
}

export default App;
