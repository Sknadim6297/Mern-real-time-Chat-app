import React from 'react'


const AuthLayouts = ({children}) => {
  return (
    <>
        <header className='flex justify-center items-center py-3 h-20 shadow-md bg-white'>
          <h1 className='font-bold text-3xl'>Sk.Chats</h1>
        </header>

        { children }
    </>
  )
}

export default AuthLayouts

