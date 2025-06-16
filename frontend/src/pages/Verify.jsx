import React, { useContext, useEffect } from 'react'
import { ShopConstest } from '../context/ShopContext'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const Verify = () => {

  const {navigate,token,setCartItems,backendUrl} = useContext(ShopConstest)
  const [searchParams, setSearchParams] = useSearchParams()

  const success = searchParams.get('success')
  const orderId = searchParams.get('orderId')

  const verifyPayment = async() => {
    try {
      if(!token) return null
      const response = await axios.post(backendUrl+'/api/order/verify')
      
      if(response.data.success){
        setCartItems({})
        navigate('orders')
      }else 
        navigate('/cart')
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(()=>{
    verifyPayment()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[token])
  
  return (
    <div>Verify</div>
  )
}

export default Verify