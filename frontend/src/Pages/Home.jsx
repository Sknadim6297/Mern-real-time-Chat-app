import axios from 'axios';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
  import { Outlet, useLocation, useNavigate } from 'react-router-dom';
  import { logout, setOnlineUser, setSocketConnection, setUser } from '../redux/userSlice';
  import Sidebar from '../Components/Sidebar';
  import io from 'socket.io-client';
  import toast from 'react-hot-toast'; // Ensure toast is imported

  const Home = () => {
    const user = useSelector(state => state.user)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
  
    console.log('user',user)
    const fetchUserDetails = async()=>{
      try {
          const URL = `${import.meta.env.VITE_BACKEND_URL}/api/user-details`
          const response = await axios({
            url : URL,
            withCredentials : true
          })
  
          dispatch(setUser(response.data.data))
  
          if(response.data.data.logout){
              dispatch(logout())
              navigate("/email")
          }
          console.log("current user Details",response)
      } catch (error) {
          console.log("error",error)
      }
    }
  
    useEffect(()=>{
      fetchUserDetails()
    },[])
  
    /***socket connection */
    useEffect(()=>{
      const socketConnection = io(import.meta.env.VITE_BACKEND_URL,{
        auth : {
          token : localStorage.getItem('token')
        },
      })
  
      socketConnection.on('onlineUser',(data)=>{
        console.log(data)
        dispatch(setOnlineUser(data))
      })
  
      dispatch(setSocketConnection(socketConnection))
  
      return ()=>{
        socketConnection.disconnect()
      }
    },[])

  const basePath = location.pathname === '/';

  return (
    <div className='grid lg:grid-cols-[300px,1fr] h-screen max-h-screen bg-white dark:bg-gray-900'>
      {/* Sidebar */}
      <section className={`bg-white dark:bg-gray-800 ${!basePath ? "hidden" : ""} lg:block`}>
        <Sidebar />
      </section>

      {/* Message component */}
      <section className={`${basePath ? "hidden" : ""} bg-white dark:bg-gray-900`}>
        <Outlet />
      </section>

      {/* Welcome Message */}
      <div className={`justify-center items-center flex-col gap-2 hidden ${basePath ? "lg:flex" : ""} bg-white dark:bg-gray-900`}>
        <div>
          <h1 className='font-bold text-4xl dark:text-white'>Sk.Chat</h1>
        </div>
        <p className='text-lg mt-2 text-slate-500 dark:text-slate-300'>Select user to send message</p>
      </div>
    </div>
  );
};

export default Home;
