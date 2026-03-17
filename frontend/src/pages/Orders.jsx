import React, { useContext, useEffect, useState, useCallback } from 'react'
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
  const [filter, setFilter] = useState('7days') // default 1 week

  const loadOrderData = useCallback(async () => {
    try {
      setIsLoading(true)
      if (!token) {
        toast.info('Por favor inicia sesión para ver tus órdenes')
        return
      }

      // Calcular startDate basado en el filtro
      let startDate = null
      const now = Date.now()
      if (filter === '1day') {
        startDate = now - (24 * 60 * 60 * 1000)
      } else if (filter === '7days') {
        startDate = now - (7 * 24 * 60 * 60 * 1000)
      } else if (filter === '30days') {
        startDate = now - (30 * 24 * 60 * 60 * 1000)
      }
      
      const response = await axios.post(`${backendUrl}/api/order/userorders`,
        { startDate },
        { headers: {Authorization:`Bearer ${token}`} })
      
      if (response.data.success && response.data.orders) {
        const processedOrders = response.data.orders.map(order => ({
          ...order,
          formattedDate: new Date(order.date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }))
        
        setOrderData(processedOrders)
      } else {
        toast.error(response.data.message || 'Error al cargar las órdenes')
      }
    } catch (error) {
      console.error('Error al cargar las ordenes:', error)
      toast.error(error.response?.data?.message || 'Error al obtener las órdenes')
    } finally {
      setIsLoading(false)
    }
  }, [backendUrl, token, filter]);

  useEffect(() => {
    loadOrderData()
  }, [loadOrderData])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'Processing': 
      case 'Packing': 
      case 'Shipped': 
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
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
      </section>
    )
  }
   return (
    <section className='max-padd-container bg-primary min-h-screen'>
      <div className='pt-10 pb-20'>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <Tittle title1={'Mis '} title2={'Pedidos'} paraStyle={'h3'} />
          
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-secondary/10 self-end md:self-auto">
            <button 
              onClick={() => setFilter('1day')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === '1day' ? 'bg-secondary text-white shadow-md' : 'text-tertiary hover:bg-primary'}`}
            >
              1 Día
            </button>
            <button 
              onClick={() => setFilter('7days')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === '7days' ? 'bg-secondary text-white shadow-md' : 'text-tertiary hover:bg-primary'}`}
            >
              1 Semana
            </button>
            <button 
              onClick={() => setFilter('30days')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === '30days' ? 'bg-secondary text-white shadow-md' : 'text-tertiary hover:bg-primary'}`}
            >
              1 Mes
            </button>
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-secondary text-white shadow-md' : 'text-tertiary hover:bg-primary'}`}
            >
              Todos
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          {orderData.map((order, i) => (
            <div key={i} className='bg-white rounded-2xl shadow-sm border border-secondary/5 overflow-hidden hover:shadow-lg transition-all duration-300'>
              <div className='bg-white px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-primary'>
                <div className="flex items-center gap-3">
                  <div className="bg-secondary/10 p-2 rounded-lg">
                    <TfiPackage className='text-xl text-secondary' />
                  </div>
                  <div>
                    <h5 className='font-bold text-tertiary'>Orden #{order._id.slice(-8).toUpperCase()}</h5>
                    <p className='text-xs text-secondary/70'>{order.formattedDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <p className='text-sm font-semibold text-tertiary bg-primary px-2 py-1 rounded-md'>{order.paymentMethod}</p>
                </div>
              </div>

              <div className="p-6">
                <div className="divide-y divide-primary">
                  {order.items.map((item, j) => (
                    <div key={j} className='flex gap-4 py-4 first:pt-0 last:pb-0'>
                      <div className='w-16 h-16 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 border border-secondary/5'>
                         <TfiPackage className='text-2xl text-secondary/30' />
                      </div>
                      
                      <div className='flex-1'>
                        <div className="flex justify-between items-start">
                          <h6 className='font-bold text-tertiary text-base'>{item.name}</h6>
                          <p className='font-bold text-tertiary'>{currency}{item.price.toFixed(2)}</p>
                        </div>
                        <div className='flex flex-wrap gap-4 mt-2 text-sm text-tertiary/70'>
                          <p>Cantidad: <span className="text-tertiary font-medium">{item.quantity}</span></p>
                          {item.size && <p>Tamaño: <span className="text-tertiary font-medium">{item.size}</span></p>}
                          <p className="ml-auto">Subtotal: <span className="text-secondary font-bold">{currency}{(item.price * item.quantity).toFixed(2)}</span></p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className='mt-6 pt-6 border-t border-primary flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-secondary/[0.02] -mx-6 -mb-6 p-6'>
                  <div className='text-sm max-w-xs'>
                    <p className='text-secondary/60 font-medium mb-1'>Dirección de Entrega:</p>
                    <p className='text-tertiary leading-snug'>
                      {order.address?.firstName} {order.address?.lastName}<br/>
                      {order.address?.municipality}, {order.address?.exactAddress}
                    </p>
                  </div>
                  <div className='text-right w-full sm:w-auto'>
                    <p className='text-sm text-secondary/50 font-medium'>Monto Total</p>
                    <p className='text-3xl font-black text-tertiary tracking-tight'>{currency}{order.amount.toFixed(2)}</p>
                    <div className="mt-2 text-xs">
                       <span className={`px-2 py-0.5 rounded ${order.payment ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                         {order.payment ? 'Pago Completado' : 'Pago Pendiente'}
                       </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Orders;