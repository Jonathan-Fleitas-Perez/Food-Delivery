import React, { useContext, useEffect, useState } from 'react'
import { ShopConstest } from '../context/ShopContext'
import { TfiPackage } from 'react-icons/tfi';
import axios from 'axios'
import { toast } from 'react-toastify'
import Tittle from '../components/Tittle'
import Footer from '../components/Footer'
import StatusBadge from '../components/StatusBadge'; // Asegúrate de importar este componente

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopConstest)
  const [orderData, setOrderData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const loadOrderData = async () => {
    try {
      setIsLoading(true)
      if (!token) {
        toast.info('Por favor inicia sesión para ver tus órdenes')
        return
      }
      
      const response = await axios.post(`${backendUrl}/api/order/userorders`,
        {},
        { headers: {Authorization:`Bearer ${token}`} })
      
      if (response.data.success && response.data.orders) {
        const processedOrders = response.data.orders.map(order => ({
          ...order,
          date: new Date(order.date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }))
        
        setOrderData(processedOrders.reverse())
      } else {
        toast.error(response.data.message || 'Error al cargar las órdenes')
      }
    } catch (error) {
      console.error('Error al cargar las ordenes:', error)
      toast.error(error.response?.data?.message || 'Error al obtener las órdenes')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOrderData()
  }, [token])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Processing': 
      case 'Packing': 
      case 'Shipped': 
        return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  }

  if (isLoading) {
    return (
      <section className='mt-24 max-padd-container'>
        <div className='pt-6 pb-20'>
          <Tittle title1={'Mis'} title2={'Pedidos'} paraStyle={'h3'} />
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </section>
    )
  }

  if (!orderData || orderData.length === 0) {
    return (
      <section className='mt-24 max-padd-container'>
        <div className='pt-6 pb-20'>
          <Tittle title1={'Mis '} title2={'Pedidos'} paraStyle={'h3'} />
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg">No tienes órdenes registradas</p>
            <button 
              onClick={loadOrderData}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Recargar
            </button>
          </div>
        </div>
        <Footer />
      </section>
    )
  }

  return (
    <section className='max-padd-container'>
      <div className='pt-6 pb-20'>
        <Tittle title1={'Mis '} title2={'Pedidos'} paraStyle={'h3'} />

        {orderData.map((order, i) => (
          <div key={i} className='p-4 mt-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow'>
            <div className='flex flex-col gap-4 text-gray-700'>
              <div className='flex justify-between items-center border-b pb-2'>
                <div>
                  <h5 className='font-semibold text-sm sm:text-base'>Orden #: {order._id.slice(-8).toUpperCase()}</h5>
                  <p className='text-sm text-gray-500'>Fecha: {order.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge 
                    status={order.status} 
                    customClass={getStatusColor(order.status)}
                  />
                  <p className='text-sm font-medium'>{order.paymentMethod}</p>
                </div>
              </div>

              {order.items.map((item, j) => (
                <div key={j} className='flex gap-4 py-2 border-b'>
                  <div className='flex-shrink-0'>
                    <TfiPackage className='text-2xl text-blue-500' />
                  </div>
                  
                  <div className='flex-1'>
                    <h6 className='font-medium line-clamp-1'>{item.name}</h6>
                    <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1 text-sm'>
                      <div>
                        <span className='text-gray-500'>Precio:</span>
                        <span className='ml-1 font-medium'>{currency} {item.price.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className='text-gray-500'>Cantidad:</span>
                        <span className='ml-1 font-medium'>{item.quantity}</span>
                      </div>
                      <div>
                        <span className='text-gray-500'>Tamaño:</span>
                        <span className='ml-1 font-medium'>{item.size}</span>
                      </div>
                      <div>
                        <span className='text-gray-500'>Total:</span>
                        <span className='ml-1 font-medium'>
                          {currency} {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className='flex justify-between items-center pt-2'>
                <div className='text-sm'>
                  <p className='font-medium'>Dirección:</p>
                  <p className='text-gray-600 text-sm'>
                    {order.address?.municipality || order.address?.city || ''}{order.address?.exactAddress ? `, ${order.address.exactAddress}` : order.address?.street ? `, ${order.address.street}` : ''}
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-sm text-gray-500'>Total de la orden:</p>
                  <p className='text-lg font-bold'>{currency} {order.amount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Orders