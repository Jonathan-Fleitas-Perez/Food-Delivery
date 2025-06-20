import React, { useContext, useEffect, useState } from 'react'
import { ShopConstest } from '../context/ShopContext'
import { TfiPackage } from 'react-icons/tfi';
import axios from 'axios'
import { toast } from 'react-toastify'
import Tittle from '../components/Tittle'
import Footer from '../components/Footer'

const Orders = () => {

  const {backendUrl,token,currency} = useContext(ShopConstest)
  const [orderData,setOrderData] = useState([])

  const loadOrderData = async()=>{
    try {
      if(!token) return null
      const response = await axios.post(backendUrl+'/api/order/userorders',{},{headers:{token}})
      
      if(response.data.success){
        let allOrderItem = []

        response.data.orders.map((order)=>{
          order.items.map((item)=>{
            item['status']=order.status
            item['payment']=order.payment
            item['paymentMethod']=order.paymentMethod
            item['date']=order.date
            allOrderItem.push(item)
          })
        })
        setOrderData(allOrderItem.reverse())
      }     
    } catch (error) {
      console.log('Error al cargar las ordenes del cliente desde el frontend: ',error)
      toast.error('Error al obtener las ordenes del cliente')
    }
  }


  useEffect(()=>{
    loadOrderData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[token])


  return (
    <section className='mt-24 max-padd-container'>
      <div className='pt-6 pb-20'>
        {/*Tittle*/}
        <Tittle title1={'Order'} title2={'List'} paraStyle={'h3'}/>

        {/*Container*/}
        {orderData.map((item,i)=>(
          <div key={i} className='p-2 mt-2 bg-white rounded-xl'>
            <div className='flex flex-col gap-4 text-gray-700'>
              <div className='flex w-full gap-x-3'>
                {/*Image*/}
                <div className='hidden rounded xl:block ring-1 ring-slate-900/5 p-7 bg-primary'>
                    <TfiPackage className='text-3xl text-secondary' />
                </div>

                {/*Order Info*/}
                <div className='block w-full'>
                  <h5 className='capitalize h5 line-clamp-1'>{item.name}</h5>
                  <div className='flex gap-x-2 sm:flex-row sm:justify-between'>
                    <div className='text-xs'>
                      <div className='flex items-center gap-x-2 sm:gap-x-3'>
                      <div className='flexCenter gap-x-2'>
                          <h5 className='medium-14' >Price:</h5>
                          <p>{currency} {item.price[item.size]}</p>
                        </div>
                        
                        <div className='flexCenter gap-x-2'>
                          <h5 className='medium-14' >Quantity:</h5>
                          <p>{item.quantity}</p>
                        </div>
                        
                        <div className='flexCenter gap-x-2'>
                          <h5 className='medium-14' >Size:</h5>
                          <p>{item.size}</p>
                        </div>

                         <div className='flexCenter gap-x-2'>
                          <h5 className='medium-14' >Name:</h5>
                          <p>{item.name}</p>
                        </div>
                      </div>

                      <div className='flex items-center gap-x-2'>
                        <h5 className='medium-14'>Date:</h5>
                        <p className='text-gray-400'>{new Date(item.date).toString()}</p>
                      </div>
                      <div className='flex items-center gap-x-2'>
                        <h5 className='medium-14'>Payment:</h5>
                        <p className='text-gray-400'>{item.paymentMethod}</p>
                      </div>
                    </div>

                    {/*Status and button*/}
                    <div className='flex flex-col gap-2 sm:pr-4'>
                      <div className='flex items-center gap-2'>
                        <p className='h-2 bg-green-500 rounded-full min-w-2'></p>
                        <p className='max-sm:text-xs'>{item.status}</p>
                      </div>
                      <button onClick={loadOrderData} className='btn-secondary !p-1 !px-3 !text-xs'>Track Order</button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        ))}
      </div>

      <Footer/>
    </section>
  )
}

export default Orders