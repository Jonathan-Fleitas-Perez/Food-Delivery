import React, { useState } from 'react'
import loginImg from '../assets/Login.png'
import { backendUrl } from '../App'
import axios from 'axios'
import { toast } from 'react-toastify'

const Login = ({settoken}) => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmitHandler = async (e)=>{
    try {
      e.preventDefault()
      console.log(email)
      const response = await axios.post(backendUrl +'/api/user/admin',{email,password})
      
      if(response.data.success)
        settoken(response.data.token)
      else
        toast.error(response.data.message)

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  return (
    <section className='absolute top-0 left-0 h-full w-full z-50 bg-white'>
      {/*Container */}
      <div className='flex h-full w-full'>
        {/* Image a la derecha*/}
        <div className='w-1/2 hidden sm:block'>
          <img src={loginImg} alt="Image Login" className='object-cover h-full w-full' />
        </div>

        {/*Form side */}
        <div className='flexCenter w-full sm:w-1/2'>
          <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-md m-auto gap-y-5 text-gray-800'>
            <div className='w-full mb-4'>
              <h3 className='bold-36'>Login</h3>
            </div>
            
            <div className='w-full'>
              <label htmlFor="email" className='medium-15'>Email</label>
              <input type="email"  onChange={(e)=>setEmail(e.target.value)} value={email} placeholder='Email' className='w-full px-3 py-1 ring-1 ring-slate-900/10 rounded bg-primary mt-1'/>
            </div>

            <div className='w-full'>
              <label htmlFor="password"  className='medium-15'>Password</label>
              <input type="password" onChange={(e)=>setPassword(e.target.value)} value={password} placeholder='Password' className='w-full px-3 py-1 ring-1 ring-slate-900/10 rounded bg-primary mt-1'/>
            </div>

            <button type='submit' className='btn-dark w-full mt-5 !py-[7px] !rounded'>login</button>
          </form>
        </div>

      </div>
    </section>
  )
}

export default Login