import './App.css';
import { Outlet } from 'react-router-dom';
import  { Toaster } from 'react-hot-toast';
import Header from './layout/index';
import { useState, useEffect } from 'react';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });


  const toggleDarkMode = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      return newMode;
    });
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <>
      <Toaster/>
      <main className={`h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
       <Header toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
        <Outlet />
      </main>
    </>
  );
}

export default App;
