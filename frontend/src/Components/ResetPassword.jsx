import React, { useState } from 'react';
import axios from 'axios';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const { token } = useParams();
    const Navigate=useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }
        try {
            const URL=`${import.meta.env.VITE_BACKEND_URL}/api/reset-password/${token}`
            const response = await axios.post(URL, { password });
            setMessage(response.data.message);
            toast.success(response.data.message);
            Navigate('/email');
        } catch (error) {
            setMessage('Something went wrong, please try again later.');
        }
    };

    return (
        <div className='mt-5'>
        <div className=' w-full max-w-md rounded overflow-hidden p-5 mx-auto px-10 flex flex-col gap-7'>
            <h2 className='font-bold text-2xl text-center shadow-md p-3 rounded-lg'>Reset Password</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className='bg-slate-100 px-2 py-2 outline-none rounded-lg w-full mt-2 text-black'
                    required
                />
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className='bg-slate-100 px-2 py-2 outline-none rounded-lg w-full mt-2 text-black'
                    required
                />
                <div className='flex gap-1 w-fit mx-auto'>
                    <button type="submit" className='bg-red-600 text-lg px-4 py-2 hover:bg-red-400 rounded-full mt-5 font-semibold text-white flex justify-center items-center'>
                        Reset Password
                    </button>
                </div>
            </form>
        </div>
      </div>
    );
};

export default ResetPassword;
