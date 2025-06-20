import axios from 'axios';
import { useState, useEffect } from 'react';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { TfiPackage } from 'react-icons/tfi';
import { FaTrash } from 'react-icons/fa';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal'; // Importar tu componente

const Order = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [deleteModalData, setDeleteModalData] = useState({
    isOpen: false,
    orderId: null,
    customerName: '',
    isDeleting: false
  });

  const fetchAllOrders = async () => {
    if (!token) return null;

    try {
      const response = await axios.post(
        backendUrl + '/api/order/list',
        {},
        { headers: { token } }
      );
      if (response.data.success) setOrders(response.data.orders);
      else toast.error(response.data.message);
    } catch (error) {
      console.log('Error al obtener las ordenes:', error);
      toast.error(error.message);
    }
  };

  const statusHandler = async (e, orderId) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/order/status',
        { orderId, status: e.target.value },
        { headers: { token } }
      );
      if (response.data.success) await fetchAllOrders();
      else toast.error(response.data.message);
    } catch (error) {
      console.log('Error al modificar estado:', error);
      toast.error(error.message);
    }
  };

  // Abrir modal de confirmación
  const openDeleteModal = (order) => {
    setDeleteModalData({
      isOpen: true,
      orderId: order._id,
      customerName: `${order.address.firstName} ${order.address.lastName}`,
      isDeleting: false
    });
  };

  // Confirmar eliminación
  const confirmDelete = async () => {
    if (!deleteModalData.orderId) return;
    
    try {
      // Actualizar estado a "eliminando"
      setDeleteModalData(prev => ({ ...prev, isDeleting: true }));
      
      const response = await axios.delete(
        backendUrl + `/api/order/${deleteModalData.orderId}`,
        { headers: { token } }
      );
      
      if (response.data.success) {
        toast.success('Orden eliminada');
        setOrders(orders.filter(order => order._id !== deleteModalData.orderId));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log('Error al eliminar orden:', error);
      toast.error(error.message);
    } finally {
      // Cerrar modal después de la operación
      setDeleteModalData({
        isOpen: false,
        orderId: null,
        customerName: '',
        isDeleting: false
      });
    }
  };

  // Cerrar modal sin eliminar
  const closeDeleteModal = () => {
    setDeleteModalData({
      isOpen: false,
      orderId: null,
      customerName: '',
      isDeleting: false
    });
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  return (
    <div className='px-2 sm:px-8'>
      {/* Modal de confirmación personalizado */}
      <DeleteConfirmationModal
        isOpen={deleteModalData.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        productName={deleteModalData.customerName}
        isDeleting={deleteModalData.isDeleting}
      />
      
      <div className='flex flex-col gap-4'>
        {orders.map((order) => (
          <div 
            key={order._id} 
            className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[0.5fr_2fr_1fr_0.5fr_1fr_0.5fr] gap-4 items-start p-3 text-gray-700 bg-white rounded-lg'
          >
            <div className='hidden rounded xl:block ring-1 ring-slate-900/5 p-7 bg-primary'>
              <TfiPackage className='text-3xl text-secondary' />
            </div>

            <div>
              <div className='flex gap-1 item-start'>
                <div className='medium-14'>Items:</div>
                <div className='felx flex-col relative top-0.5'>
                  {order.items.map((item, index) => (
                    <p key={index}>
                      {item.name} X {item.quantity} <span>{item.size}</span>
                    </p>
                  ))}
                </div>
              </div>

              <p>
                <span className='text-tertiary medium-14'>Name: </span>
                {order.address.firstName + ' ' + order.address.lastName}
              </p>
              <p>
                <span className='text-tertiary medium-14'>Address: </span>
                <span>{order.address.street + ', '}</span>
                <span>
                  {order.address.city + ', ' + 
                   order.address.state + ', ' + 
                   order.address.country + ', ' + 
                   order.address.zipcode}
                </span>
              </p>
              <p>{order.address.phone}</p>
            </div>

            <div>
              <p>
                <span className='text-tertiary medium-14'>Items: </span> 
                {order.items.length}
              </p>
              <p>
                <span className='text-tertiary medium-14'>Method: </span>
                {order.paymentMethod}
              </p>
              <p>
                <span className='text-tertiary medium-14'>Payment: </span>
                {order.payment ? 'Done' : 'Pending'}
              </p>
              <p>
                <span className='text-tertiary medium-14'>Date: </span>
                {new Date(order.date).toLocaleDateString()}
              </p>
            </div>
            
            <p>
              <span className='text-tertiary medium-14'>Price: </span>
              {currency}{order.amount}
            </p>

            <select
              onChange={(e) => statusHandler(e, order._id)}
              value={order.status}
              className='p-1 text-xs font-semibold rounded ring-1 ring-sky-900/5 max-w-36 bg-primary'
            >
              <option value="Order Placed">Order Placed</option>
              <option value="Packing">Packing</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
            
            {/* Botón de eliminar */}
            <button 
              onClick={() => openDeleteModal(order)}
              className="p-2 text-white transition-colors bg-red-500 rounded hover:bg-red-600 focus:outline-none"
              title="Eliminar orden"
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Order;