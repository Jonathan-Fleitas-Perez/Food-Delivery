import React, { useContext, useEffect, useState } from 'react'
import loginImg from '../assets/Login.png'
import { ShopConstest } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Login = () => {
  const [currState, setcurrState] = useState('Login')
  const {token,setToken,navigate,backendUrl} = useContext(ShopConstest)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmitHandler = async(event)=>{
    event.preventDefault()
    try {
      if(currState ==='Sign Up'){
        const response = await axios.post(backendUrl+'/api/user/register',{name,email,password})
        if(response.data.success){
          setToken(response.data.token)
          localStorage.setItem('token',response.data.token)
        }else
          toast.error(response.data.message)

      }else{
        const response = await axios.post(backendUrl+'/api/user/login',{email,password})
        if(response.data.success){
          setToken(response.data.token)
          localStorage.setItem('token',response.data.token)
        }else
          toast.error(response.data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }


  useEffect(()=>{
    if(token)
      navigate('/')
  },[token])
  return (
    <section className='absolute top-0 left-0 h-full w-full z-50 bg-white'>
      {/* Container */}
      <div className='flex h-full w-full'>
        {/* Image side */}
        <div className='w-1/2 hidden sm:block'>
          <img src={loginImg} alt="Tabla de comida" className='object-cover aspect-square h-full w-full'/>
        </div>

        {/* Form Side */}
        <div className='flex w-full sm:w-1/2 items-center justify-center'>
          <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-md m-auto gap-y-5 text-gray-800'>
            <div className='w-full mb-4'>
              <h3 className='bold-36'>{currState}</h3>
            </div>
            {currState === 'Sign Up'&&(
              <div className='w-full'>
                <label htmlFor="name" className='medium-14'>Name</label>
                <input onChange={(e)=>setName(e.target.value)} value={name} type="text" placeholder='Name' className='w-full px-3 py-1 ring-slate-900/10 rounded bg-primary mt-1' />
              </div>
            )}

            <div className='w-full'>
              <label htmlFor="email" className='medium-14'>Email</label>
              <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" placeholder='Email' className='w-full px-3 py-1 ring-slate-900/10 rounded bg-primary mt-1' />
            </div>
            <div className='w-full'>
              <label htmlFor="password" className='medium-14'>Password</label>
              <input onChange={(e)=>setPassword(e.target.value)} value={password} type="password" placeholder='Password' className='w-full px-3 py-1 ring-slate-900/10 rounded bg-primary mt-1' />
            </div>

            <button type='submit' className='btn-dark w-full mt-5 !py-[7px] !rounded'>{currState === 'Sign Up'?'Sign Up':'Login'}</button>
            <div className='w-full flex flex-col gap-y-3 medium-14'>
              <div className='underline'>Forgort your password?</div>
              {currState === 'Login'?(
                <div className='underline'>
                  Don't have acount?
                  <span onClick={()=>setcurrState('Sign Up')} className='cursor-pointer'>Create acount</span>
                </div>
              ):(
                <div className='underline'>
                  Already have an acount?
                  <span className='cursor-pointer' onClick={()=>setcurrState('Login')}>Login</span>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Login