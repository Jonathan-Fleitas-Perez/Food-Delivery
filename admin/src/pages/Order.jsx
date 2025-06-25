/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios';
import { useState, useEffect } from 'react';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { TfiPackage } from 'react-icons/tfi';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import StatusBadge from '../components/StatusBadge';

const Order = ({ token, permissions }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalData, setDeleteModalData] = useState({
    isOpen: false,
    orderId: null,
    customerName: '',
    isDeleting: false
  });
  const [editingOrder, setEditingOrder] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('');

  const navigate = useNavigate();
  // Verificar permisos
  const canViewOrders = permissions.includes('orders:view');
  const canUpdateOrders = permissions.includes('orders:update');
  const canDeleteOrders = permissions.includes('orders:delete');

  const fetchAllOrders = async () => {
    if (!token) return null;
    setIsLoading(true);

    try {
      const response = await axios.get(
        `${backendUrl}/api/order/list`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 50 } // Aumentar límite para mostrar más órdenes
        }
      );
      
      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log('Error al obtener las ordenes:', error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const statusHandler = async (e, orderId) => {
    if (!canUpdateOrders) {
      toast.error('No tienes permiso para actualizar órdenes');
      return;
    }
    
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/status`,
        { orderId, status: e.target.value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        await fetchAllOrders();
        toast.success('Estado actualizado correctamente');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log('Error al modificar estado:', error);
      toast.error(error.response?.data?.message || error.message);
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
      setDeleteModalData(prev => ({ ...prev, isDeleting: true }));
      
      const response = await axios.delete(
        `${backendUrl}/api/order/${deleteModalData.orderId}`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          params: { orderId: deleteModalData.orderId } 
      }
      );
      
      if (response.data.success) {
        toast.success('Orden eliminada correctamente');
        setOrders(orders.filter(order => order._id !== deleteModalData.orderId));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log('Error al eliminar orden:', error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
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

  // Iniciar edición de estado
  const startEditStatus = (order) => {
    setEditingOrder(order._id);
    setCurrentStatus(order.status);
  };

  // Cancelar edición
  const cancelEdit = () => {
    setEditingOrder(null);
    setCurrentStatus('');
  };

  // Guardar cambios de estado
  const saveStatusChange = async (orderId) => {
    if (!canUpdateOrders) {
      toast.error('No tienes permiso para actualizar órdenes');
      return;
    }
    
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/status`,
        { orderId, status: currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        await fetchAllOrders();
        toast.success('Estado actualizado correctamente');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log('Error al modificar estado:', error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setEditingOrder(null);
      setCurrentStatus('');
    }
  };

  useEffect(() => {
    // Redirigir si no tiene permiso
    if (!canViewOrders) {
      toast.error('No tienes permiso para ver esta página');
      navigate('/unauthorized');
      return;
    }
    fetchAllOrders();
  }, [token]);

  // Componente Skeleton para órdenes
  const OrderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[0.5fr_2fr_1fr_0.5fr_1fr_0.5fr] gap-4 items-start p-3 text-gray-700 bg-white rounded-lg animate-pulse">
      {/* Ícono */}
      <div className="hidden bg-gray-200 rounded xl:block ring-1 ring-slate-900/5 p-7">
        <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
      </div>

      {/* Información principal */}
      <div className="space-y-3">
        <div className="flex gap-1 item-start">
          <div className="w-16 h-4 bg-gray-200 rounded"></div>
          <div className="space-y-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-40 h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="w-48 h-4 bg-gray-200 rounded"></div>
          <div className="w-56 h-4 bg-gray-200 rounded"></div>
          <div className="w-32 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Detalles */}
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded w-36"></div>
        ))}
      </div>

      {/* Precio */}
      <div className="w-20 h-4 bg-gray-200 rounded"></div>

      {/* Selector de estado */}
      <div className="h-8 bg-gray-200 rounded max-w-36"></div>
      
      {/* Botón eliminar */}
      <div className="w-8 h-8 p-2 bg-gray-200 rounded"></div>
    </div>
  );

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className='px-2 sm:px-8'>
      <DeleteConfirmationModal
        isOpen={deleteModalData.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        productName={deleteModalData.customerName}
        isDeleting={deleteModalData.isDeleting}
      />
      
      <h2 className="mb-4 text-2xl font-bold text-gray-800">Gestión de Órdenes</h2>
      
      <div className='flex flex-col gap-4'>
        {isLoading ? (
          // Mostrar skeletons durante la carga
          [...Array(5)].map((_, index) => (
            <OrderSkeleton key={index} />
          ))
        ) : orders.length === 0 ? (
          <div className="p-6 text-center bg-white rounded-lg">
            <p className="text-gray-500">No hay órdenes disponibles</p>
          </div>
        ) : (
          orders.map((order) => (
            <div 
              key={order._id} 
              className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[0.5fr_2fr_1fr_0.5fr_1fr_0.5fr] gap-4 items-start p-3 text-gray-700 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow'
            >
              <div className='hidden rounded xl:block ring-1 ring-slate-900/5 p-7 bg-indigo-50'>
                <TfiPackage className='text-3xl text-indigo-600' />
              </div>

              <div className="space-y-2">
                <div className='flex flex-col gap-1'>
                  <div className='font-medium text-gray-900'>Productos:</div>
                  <div className='flex flex-col'>
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-1 text-sm">
                        <span className="font-medium">{item.name}</span>
                        <span>× {item.quantity}</span>
                        {item.size && <span className="text-xs bg-gray-100 px-1 rounded">Talla: {item.size}</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-2">
                  <div className="flex items-start gap-1">
                    <span className='font-medium text-gray-900'>Cliente:</span>
                    <span>{order.address.firstName} {order.address.lastName}</span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className='font-medium text-gray-900'>Teléfono:</span>
                    <span>{order.address.phone}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-sm">
                <p>
                  <span className='font-medium text-gray-900'>Items: </span> 
                  {order.items.length}
                </p>
                <p>
                  <span className='font-medium text-gray-900'>Método: </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    order.paymentMethod === 'Stripe' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {order.paymentMethod}
                  </span>
                </p>
                <p>
                  <span className='font-medium text-gray-900'>Pago: </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    order.payment 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.payment ? 'Completado' : 'Pendiente'}
                  </span>
                </p>
                <p>
                  <span className='font-medium text-gray-900'>Fecha: </span>
                  {formatDate(order.date)}
                </p>
              </div>
              
              <div>
                <p className='font-medium text-gray-900'>Total:</p>
                <p className="text-lg font-semibold text-indigo-600">
                  {currency}{order.amount.toFixed(2)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {editingOrder === order._id ? (
                  <>
                    <select
                      value={currentStatus}
                      onChange={(e) => setCurrentStatus(e.target.value)}
                      className='p-1 text-xs font-semibold rounded ring-1 ring-sky-900/5 max-w-36 bg-white'
                    >
                      <option value="Order Placed">Orden Recibida</option>
                      <option value="Processing">En Proceso</option>
                      <option value="Shipped">Enviada</option>
                      <option value="Delivered">Entregada</option>
                      <option value="Cancelled">Cancelada</option>
                    </select>
                    <button 
                      onClick={() => saveStatusChange(order._id)}
                      className="p-1 text-green-600 hover:text-green-800"
                    >
                      <FaCheck />
                    </button>
                    <button 
                      onClick={cancelEdit}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <FaTimes />
                    </button>
                  </>
                ) : (
                  <>
                    <StatusBadge status={order.status} />
                    {canUpdateOrders && (
                      <button 
                        onClick={() => startEditStatus(order)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Editar estado"
                      >
                        <FaEdit />
                      </button>
                    )}
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {canDeleteOrders && (
                  <button 
                    onClick={() => openDeleteModal(order)}
                    className="flex items-center justify-center w-8 h-8 p-2 text-white transition-colors bg-red-500 rounded-full hover:bg-red-600 focus:outline-none"
                    title="Eliminar orden"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Order;