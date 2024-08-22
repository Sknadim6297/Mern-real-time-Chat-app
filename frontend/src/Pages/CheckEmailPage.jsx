import React, { useState } from 'react'
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'
import toast from 'react-hot-toast';
import { PiUserCircle } from "react-icons/pi";

const CheckEmailPage = () => {
  const [data,setData] = useState({
    email : "",
  })
  const navigate = useNavigate()

  const handleOnChange = (e)=>{
    const { name, value} = e.target

    setData((preve)=>{
      return{
          ...preve,
          [name] : value
      }
    })
  }

  const handleSubmit = async(e)=>{
    e.preventDefault()
    e.stopPropagation()

    const URL = `${import.meta.env.VITE_BACKEND_URL}/api/email`

    try {
        const response = await axios.post(URL,data,{
          withCredentials : true
        })

        toast.success(response.data.message)

        if(response.data.success){
            setData({
              email : "",
            })
            navigate('/password',{
              state : response?.data?.data
            })
        }
    } catch (error) {
        toast.error(error?.response?.data?.message)
    }
  }


  return (
    <div className='mt-5'>
        <div className='bg-white w-full max-w-md  rounded overflow-hidden p-5 mx-auto px-10'>

            <div className='w-fit mx-auto mb-2'>
                <PiUserCircle
                  size={70}
                />
            </div>

          <form className='grid gap-4 mt-3' onSubmit={handleSubmit}>
              

              <div className='flex flex-col gap-1'>
                <label htmlFor='email'>Email :</label>
                <input
                  type='email'
                  id='email'
                  name='email'
                  placeholder='Enter your email' 
                  className='bg-slate-100 px-2 py-3 outline-none rounded-lg'
                  value={data.email}
                  onChange={handleOnChange}
                  required
                />
              </div>
             <div className='flex gap-1 w-fit mx-auto'>
              <button
               className='bg-red-600 text-lg  px-4 py-2 hover:bg-red-400 rounded-full mt-2 font-bold text-white w-40 flex justify-center items-center'
              >
                Let's Go
              </button>
              </div>
              

          </form>

          <p className='my-3 text-center'>New User ? <Link to={"/register"} className='hover:text-red-600 font-semibold'>Register</Link></p>
        </div>
    </div>
  )
}

export default CheckEmailPage
