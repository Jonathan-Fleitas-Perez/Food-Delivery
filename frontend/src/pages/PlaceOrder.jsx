import React, { useContext, useState } from 'react'
import CartTotal from '../components/CartTotal'
import Footer from '../components/Footer'
import Tittle from '../components/Tittle'
import { ShopConstest } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const PlaceOrder = () => {

  const {navigate,backendUrl,cartItems,setCartItems,getCartAmount,foods,token} = useContext(ShopConstest)
  const [method, setMethod] = useState('cod')
  const [formData, setFormData] = useState({
    firstName:'',
    lastName:'',
    email:'',
    street:'',
    state:'',
    city:'',
    zipcode:'',
    country:'',
    phone:'',
  })

  const onChangeHandler = (e) =>{
    const name = e.target.name
    const value = e.target.value
    setFormData(data=>({...data,[name]:value}))
  }

  const onSubmitHandler = async()=>{
    event.preventDefault()
    try {
      let orderItems =[]
      for(const items in cartItems){
        for(const item in cartItems[items]){
          if(cartItems[items][item]>0){
            const iteminfo = structuredClone(foods.find(food=>food._id===items))
            if(iteminfo){
              iteminfo.size=item
              iteminfo.quantity= cartItems[items][item]
              orderItems.push(iteminfo)
            }
          }
        }
      }

      let orderData ={
        address:formData,
        items:orderItems,
        amount:Number(getCartAmount())
      }

      switch(method){
        case 'cod':{
          const response = await axios.post(backendUrl+'/api/order/place',orderData,{headers:{token}})
          if(response.data.success){
            setCartItems({})
            navigate('/orders')
          }else
            toast.error(response.data.message)
          }
        break;

        case 'stripe':{
          const responseStripe = await axios.post(backendUrl+'/api/order/stripe',orderData,{headers:{token}})
          if(responseStripe.data.success){
            const {session_url} = responseStripe.data
            window.location.replace(session_url)
          }else
            toast.error(responseStripe.data.message)
          }
        break;

        default:
          break;
      }
    } catch (error) {
      console.log('Error a la hora de subir la orden',error.message)
    }
  }

  return (
    <section className='max-padd-container mt-24'>
      {/* container */}
      <form onSubmit={onSubmitHandler} className='py-6'>
        <div className='flex flex-col xl:flex-row gap-20 xl:gap-28'>
          <div className='flex flex-1 flex-col gap-3 text-[95%]'>
            {/* informacion Mensajeria */}
            <Tittle title1={'Delivery'} title2={'information'} titleStyles={'h3'}/>

            <div className='flex gap-3'>
              <input onChange={onChangeHandler} value={formData.firstName} type="text" name='firstName' placeholder='First Name' className='ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-primary outline-none'/>
              <input onChange={onChangeHandler} value={formData.lastName} type="text" name='lastName' placeholder='Last Name' className='ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-primary outline-none'/>
            </div>
            <input onChange={onChangeHandler} value={formData.email} type="email" name='email' placeholder='Email' className='ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-primary outline-none'/>
            <input onChange={onChangeHandler} value={formData.phone} type="text" name='phone' placeholder='Phone Number' className='ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-primary outline-none'/>
            <input onChange={onChangeHandler} value={formData.street} type="text" name='street' placeholder='Street' className='ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-primary outline-none'/>

            <div className='flex gap-3'>
              <input onChange={onChangeHandler} value={formData.city} type="text" name='city' placeholder='City' className='ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-primary outline-none'/>
              <input onChange={onChangeHandler} value={formData.state} type="text" name='state' placeholder='State' className='ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-primary outline-none'/>
            </div>

            <div className='flex gap-3'>
            <input onChange={onChangeHandler} value={formData.zipcode} type="text" name='zipcode' placeholder='Zip Code' className='ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-primary outline-none'/>
            <input onChange={onChangeHandler} value={formData.country} type="text" name='country' placeholder='Country' className='ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-primary outline-none'/>
            </div>
          </div>

          {/* Cart Total */}
          <div className='flex flex-1 flex-col'>
            <CartTotal/>
            {/* Metodos de Pago */}
            <div className='my-6'>
              <h3 className='bold-20 mb-5'>Payment <span className='text-secondary'>Method</span></h3>
              <div className='flex gap-3'>
                <div className={`${method === 'stripe' ?'btn-secondary':'btn-light'} !p-1  text-xs cursor-pointer`} onClick={()=>setMethod('stripe')}>Stripe</div>
                <div className={`${method === 'cod' ?'btn-secondary':'btn-light'} !p-1  !px-3 text-xs cursor-pointer`} onClick={()=>setMethod('cod')}>Cash on Delivery</div>
              </div>
            </div>
            <div>
              <button type='submit' className='btn-dark !rounded'>Placer Order</button>
            </div>
          </div>
        </div>
      </form>

      <Footer />
    </section>
  )
}

export default PlaceOrder