import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { setToken } from '../redux/userSlice';
import Avatar from '../Components/Avatar';

const CheckPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!location?.state?.name) {
      navigate('/email');
    }
  }, [location, navigate]);

  const handleOnChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { _id } = location?.state || {};

    if (!_id) {
      toast.error("User ID not found. Please try again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const URL = `${import.meta.env.VITE_BACKEND_URL}/api/password`;
      const response = await axios.post(URL, { userId: _id, password }, { withCredentials: true });

      toast.success(response.data.message);

      if (response.data.success) {
        dispatch(setToken(response.data.token));
        localStorage.setItem('token', response.data.token);
        navigate('/');
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'An error occurred. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='mt-5'>
      <div className='w-full max-w-md rounded overflow-hidden p-5 mx-auto px-10'>
        <div className='w-fit mx-auto mb-2 flex justify-center items-center flex-col'>
          <Avatar
            width={70}
            height={70}
            name={location?.state?.name}
            imageUrl={location?.state?.profile_pic || '/default-avatar.png'}
          />
          <h2 className='font-semibold text-lg mt-1'>{location?.state?.name}</h2>
        </div>

        <form className='grid gap-4 mt-3' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-1'>
            <label htmlFor='password'>Password:</label>
            <input
              type='password'
              id='password'
              name='password'
              placeholder='Enter your password'
              className='bg-slate-100 px-2 py-2 outline-none rounded-lg text-black'
              value={password}
              onChange={handleOnChange}
              required
              aria-label='Password'
            />
          </div>

          <div className='flex gap-1 w-fit mx-auto'>
            <button
              type='submit'
              disabled={isSubmitting}
              className={`bg-red-600 text-lg px-4 py-2 hover:bg-red-400 rounded-full mt-2 font-bold text-white w-40 flex justify-center items-center ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>

        <p className='my-3 text-center'>
          <Link to={"/forgot-password"} className='hover:text-red-600 font-semibold'>Forgot password?</Link>
        </p>
      </div>
    </div>
  );
};

export default CheckPasswordPage;
