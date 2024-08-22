import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const URL=`${import.meta.env.VITE_BACKEND_URL}/api/forgot-password`
            const response = await axios.post(URL, { email });
            setMessage(response.data.message);
        } catch (error) {
            setMessage('Something went wrong, please try again later.');
        }
    };

    return (
      <div className='mt-5'>
        <div className=' w-full max-w-md  rounded overflow-hidden p-5 mx-auto px-10 flex flex-col gap-7'>
            <h2 className='font-bold text-2xl text-center shadow-md p-3 rounded-lg'>Forgot Password</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className='bg-slate-100 px-2 py-2 outline-none rounded-lg w-full mt-2 text-black'
                    required
                />
                <div className='flex gap-1 w-fit mx-auto'>
                <button type="submit" className='bg-red-600 text-lg  px-4 py-2 hover:bg-red-400 rounded-full mt-5 font-bold text-white w-40 flex justify-center items-center '>Submit</button>
                </div>
            </form>
            <div className='flex items-center justify-center'>
            {message && <p  className='text-green-600'>{message}</p>}
            </div>
        </div>
      </div>

    );
};

export default ForgotPassword;
