import React from 'react'
import Header from './components/Header'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Cart from './pages/Cart'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Menu from './pages/Menu'
import Orders from './pages/Orders'
import PlaceOrder from './pages/PlaceOrder'
import Verify from './pages/Verify'
import {ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
    <main className='overflow-hidden text-[#404040] bg-primary'>
      <ToastContainer/>
      <Header />
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/menu' element={<Menu/>} />
        <Route path='/contact' element={<Contact/>} />
        <Route path='/cart' element={<Cart/>} />
        <Route path='/place-order' element={<PlaceOrder/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/orders' element={<Orders/>} />
        <Route path='/verify' element={<Verify/>} />
      </Routes>
    </main>
  )
}

export default App