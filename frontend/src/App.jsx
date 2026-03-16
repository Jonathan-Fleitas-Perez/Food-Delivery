import Header from './components/Header'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Cart from './pages/Cart'
import About from './pages/Contact'
import Login from './pages/Login'
import Menu from './pages/Menu'
import Orders from './pages/Orders'
import PlaceOrder from './pages/PlaceOrder'
import Verify from './pages/Verify'
import Profile from './pages/Profile'
import {ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'
import { ShopConstest } from './context/ShopContext'
import LoadingScreen from './components/LoadingScreen'
import { useContext } from 'react'

axios.defaults.withCredentials = true;



// eslint-disable-next-line react-refresh/only-export-components
export const backendUrl = import.meta.env.VITE_BACKEND_URL
const App = () => {
  const { isLoading } = useContext(ShopConstest);
  
  return (
    <>
      {isLoading && <LoadingScreen />}
    <main className='overflow-hidden text-[#404040] bg-primary pt-20'>
      <ToastContainer/>
      <Header />
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/menu' element={<Menu/>} />
        <Route path='/about' element={<About/>} />
        <Route path='/cart' element={<Cart/>} />
        <Route path='/place-order' element={<PlaceOrder/>} />
        <Route path='/orders' element={<Orders/>} />
        {/* <Route path='/offers' element={<Offers/>} /> */}
        <Route path='/login' element={<Login/>} />
        <Route path='/verify' element={<Verify/>} />
        <Route path='/profile' element={<Profile/>} />
      </Routes>
    </main>
    </>
  )
}

export default App