import axios from 'axios';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { logout, setOnlineUser, setSocketConnection, setUser } from '../redux/userSlice';
import Sidebar from '../Components/Sidebar';
import io from 'socket.io-client';

const Home = () => {
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Function to fetch user details with retry logic
  const fetchUserDetails = async (retries = 3) => {
    try {
      const URL = `${import.meta.env.VITE_BACKEND_URL}/api/user-details`;
      const response = await axios({
        url: URL,
        withCredentials: true,
      });
  
      dispatch(setUser(response.data.data));
  
      if (response.data.data.logout) {
        dispatch(logout());
        navigate("/email");
      }
    } catch (error) {
      if (retries > 0) {
        console.log(`Retrying... (${3 - retries} attempts left)`);
        setTimeout(() => fetchUserDetails(retries - 1), 1000);
      } else {
        console.error("Failed to fetch user details after multiple attempts:", error);
        toast.error("Failed to fetch user details. Please try again later.");
      }
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [dispatch, navigate]);

  // Function to establish socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/email');
      return;
    }
  
    const socketConnection = io(import.meta.env.VITE_BACKEND_URL, {
      auth: {
        token
      },
      timeout: 5000,
      transports: ['websocket'],
    });
  
    socketConnection.on('onlineUser', (data) => {
      dispatch(setOnlineUser(data));
    });
  
    socketConnection.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err);
      toast.error('Unable to connect to WebSocket. Please try again later.');
    });
  
    dispatch(setSocketConnection(socketConnection));
  
    return () => {
      socketConnection.disconnect();
    };
  }, [dispatch, navigate]);
  

  const basePath = location.pathname === '/';
  return (
    <div className='grid lg:grid-cols-[300px,1fr] h-screen max-h-screen bg-white dark:bg-gray-900'>
      {/* Sidebar */}
      <section className={`bg-white dark:bg-gray-800 ${!basePath && "hidden"} lg:block`}>
        <Sidebar />
      </section>

      {/* Message component */}
      <section className={`${basePath && "hidden"} bg-white dark:bg-gray-900`}>
        <Outlet />
      </section>

      {/* Welcome Message */}
      <div className={`justify-center items-center flex-col gap-2 hidden ${!basePath ? "hidden" : "lg:flex"} bg-white dark:bg-gray-900`}>
        <div>
          <h1 className='font-bold text-4xl dark:text-white'>Sk.Chat</h1>
        </div>
        <p className='text-lg mt-2 text-slate-500 dark:text-slate-300'>Select user to send message</p>
      </div>
    </div>
  );
};

export default Home;
