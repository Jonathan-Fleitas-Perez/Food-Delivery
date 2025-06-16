import React, { useEffect, useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import { Route, Routes } from 'react-router-dom'
import Add from './pages/Add'
import List from './pages/List'
import Order from './pages/Order'
import {ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Login from './components/Login'

export const backendUrl = import.meta.env.VITE_BACKEND_URL
export const currency = '$'

const App = () => {
  //localStorage.getItem('token') ? localStorage.getItem('token'):''
  const [token, settoken] = useState(localStorage.getItem('token') ? localStorage.getItem('token'):'')

  useEffect(()=>{
    localStorage.setItem('token',token)
  },[token])

  return (
    <main>
      <ToastContainer/>
      {token ===''?(
        <Login  settoken={settoken}/>
      ):(   
      <div className='bg-primary text-[#404040]'>
        <Header/>
        <div className='mx-auto max-w-[1440px] flex flex-col sm:flex-row mt-8 sm:mt-4'>
          <Sidebar token={token} settoken={settoken}/>
          <Routes>
            <Route path='/' element={<Add token={token}/>}/>
            <Route path='/list' element={<List token={token}/>}/>
            <Route path='/orders' element={<Order token={token}/>}/>
          </Routes>
        </div>
      </div>
    )}
    </main>
  )
}

export default App