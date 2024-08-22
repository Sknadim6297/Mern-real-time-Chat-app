
import './App.css';
import { Outlet } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import Header from './Components/Header';

function App() {
  return (
   <> 
      <Toaster/>
       <main className='bg-white h-screen' >
       <Header/>
        <Outlet/>
       </main>
   </>
  );
}

export default App;
