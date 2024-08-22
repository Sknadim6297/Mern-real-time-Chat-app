import React, { useEffect, useRef, useState } from 'react';
import Avatar from './Avatar';
import uploadFile from '../helpers/uploadFiles';
import Divider from './Divider';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/userSlice';

const EditUserDetails = ({ onClose, user }) => {
    const [data, setData] = useState({
        name: user?.user,
        profile_pic: user?.profile_pic
    });
    const uploadPhotoRef = useRef();
    const dispatch = useDispatch();

    useEffect(() => {
        setData((prev) => ({
            ...prev,
            ...user
        }));
    }, [user]);

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleOpenUploadPhoto = (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadPhotoRef.current.click();
    };

    const handleUploadPhoto = async (e) => {
        const file = e.target.files[0];
        const uploadPhoto = await uploadFile(file);
        setData((prev) => ({
            ...prev,
            profile_pic: uploadPhoto?.url
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const URL = `${import.meta.env.VITE_BACKEND_URL}/api/update-user`;
            const updatedData = {
                name: data.name,
                profile_pic: data.profile_pic
            };

            const response = await axios.post(URL, updatedData, { withCredentials: true });
            toast.success(response?.data?.message);

            if (response.data.success) {
                dispatch(setUser(response.data.data));
                onClose();
            }

        } catch (error) {
            console.log(error);
            toast.error("Error updating user details");
        }
    };

    return (
        <div className='fixed top-0 bottom-0 left-0 right-0 bg-gray-700 bg-opacity-40 dark:bg-gray-900 dark:bg-opacity-70 flex justify-center items-center z-10'>
            <div className='bg-white dark:bg-gray-800 p-4 py-6 m-1 rounded w-full max-w-sm'>
                <h2 className='font-semibold text-gray-900 dark:text-gray-100'>Profile Details</h2>
                <p className='text-sm text-gray-700 dark:text-gray-300'>Edit user details</p>

                <form className='grid gap-3 mt-3' onSubmit={handleSubmit}>
                    <div className='flex flex-col gap-1'>
                        <label htmlFor='name' className='text-gray-900 dark:text-gray-100'>Name:</label>
                        <input
                            type='text'
                            name='name'
                            id='name'
                            value={data.name}
                            onChange={handleOnChange}
                            className='w-full py-2 px-2 outline-none bg-slate-100 dark:bg-gray-700 rounded text-gray-900 dark:text-gray-100'
                        />
                    </div>

                    <div>
                        <div className='text-gray-900 dark:text-gray-100'>Photo:</div>
                        <div className='my-1 flex items-center gap-4'>
                            <Avatar
                                width={40}
                                height={40}
                                imageUrl={data?.profile_pic}
                                name={data?.name}
                            />
                            <label htmlFor='profile_pic'>
                                <button
                                    className='font-semibold text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-500'
                                    onClick={handleOpenUploadPhoto}
                                >
                                    Change Photo
                                </button>
                                <input
                                    type='file'
                                    id='profile_pic'
                                    className='hidden'
                                    onChange={handleUploadPhoto}
                                    ref={uploadPhotoRef}
                                />
                            </label>
                        </div>
                    </div>

                    <Divider />
                    <div className='flex gap-2 w-fit ml-auto'>
                        <button
                            onClick={onClose}
                            className='border text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 px-4 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700'
                        >
                            Cancel
                        </button>
                        <button
                            type='submit'
                            className='bg-red-500 text-white border border-red-500 px-4 py-1 rounded hover:bg-red-400 dark:bg-red-600 dark:hover:bg-red-500'
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default React.memo(EditUserDetails);
