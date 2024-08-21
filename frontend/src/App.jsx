
import './App.css';
import { Outlet } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

function App() {
  return (
   <> 
      <Toaster/>
       <main className='bg-white h-screen' >
        <Outlet/>
       </main>
   </>
  );
}

export default App;
