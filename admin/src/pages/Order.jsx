/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios';
import { useState, useEffect } from 'react';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { TfiPackage } from 'react-icons/tfi';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEdit, FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import StatusBadge from '../components/StatusBadge';

const Order = ({ token, permissions }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('1day'); // default 1 day
  const [deleteModalData, setDeleteModalData] = useState({
    isOpen: false,
    orderId: null,
    customerName: '',
    isDeleting: false
  });
  const [editingOrder, setEditingOrder] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const navigate = useNavigate();
  // Verificar permisos
  const canViewOrders = permissions.includes('orders:view');
  const canUpdateOrders = permissions.includes('orders:update');
  const canDeleteOrders = permissions.includes('orders:delete');

  const fetchAllOrders = async () => {
    if (!token) return null;
    setIsLoading(true);

    try {
      // Calcular startDate basado en el filtro
      let startDate = null;
      const now = Date.now();
      if (filter === '1day') {
        startDate = now - (24 * 60 * 60 * 1000);
      } else if (filter === '7days') {
        startDate = now - (7 * 24 * 60 * 60 * 1000);
      } else if (filter === '30days') {
        startDate = now - (30 * 24 * 60 * 60 * 1000);
      }

      const response = await axios.get(
        `${backendUrl}/api/order/list`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 100, startDate }
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

  const openDeleteModal = (order) => {
    setDeleteModalData({
      isOpen: true,
      orderId: order._id,
      customerName: `${order.address.firstName} ${order.address.lastName}`,
      isDeleting: false
    });
  };

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

  const closeDeleteModal = () => {
    setDeleteModalData({
      isOpen: false,
      orderId: null,
      customerName: '',
      isDeleting: false
    });
  };

  const startEditStatus = (order) => {
    setEditingOrder(order._id);
    setCurrentStatus(order.status);
  };

  const cancelEdit = () => {
    setEditingOrder(null);
    setCurrentStatus('');
  };

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
    if (!canViewOrders) {
      toast.error('No tienes permiso para ver esta página');
      navigate('/unauthorized');
      return;
    }
    fetchAllOrders();
  }, [token, filter]);

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

  // Modal de Detalles
  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tertiary/40 backdrop-blur-sm">
        <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-secondary/10">
          <div className="sticky top-0 bg-white px-8 py-6 border-b border-primary flex justify-between items-center z-10">
            <h3 className="text-2xl font-black text-tertiary">Detalles <span className="text-secondary">#{order._id.slice(-8).toUpperCase()}</span></h3>
            <button onClick={onClose} className="p-2 hover:bg-primary rounded-full transition-colors text-tertiary/40 hover:text-secondary">
              <FaTimes size={20} />
            </button>
          </div>
          
          <div className="p-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <h4 className="text-xs font-black text-secondary uppercase tracking-widest mb-4">Información del Cliente</h4>
                <div className="space-y-1.5">
                  <p className="text-tertiary font-bold text-lg">{order.address.firstName} {order.address.lastName}</p>
                  <p className="text-tertiary/60 font-medium">{order.address.phone}</p>
                  <div className="bg-primary p-4 rounded-2xl mt-4">
                    <p className="text-tertiary/80 text-sm leading-relaxed">
                      {order.address.municipality}, {order.address.exactAddress}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-black text-secondary uppercase tracking-widest mb-4">Estado de la Operación</h4>
                <div className="space-y-4">
                   <div className="flex items-center justify-between p-3 bg-primary rounded-xl">
                     <span className="text-sm font-bold text-tertiary/50">Estado:</span>
                     <StatusBadge status={order.status} />
                   </div>
                   <div className="flex items-center justify-between p-3 bg-primary rounded-xl">
                     <span className="text-sm font-bold text-tertiary/50">Pago:</span>
                     <span className={`px-3 py-1 rounded-full text-xs font-black ${order.payment ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                       {order.payment ? 'COMPLETADO' : 'PENDIENTE'}
                     </span>
                   </div>
                   <div className="flex items-center justify-between p-3 bg-primary rounded-xl">
                     <span className="text-sm font-bold text-tertiary/50">Método:</span>
                     <span className="text-sm font-black text-tertiary">{order.paymentMethod}</span>
                   </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black text-secondary uppercase tracking-widest mb-4">Productos en la Orden</h4>
              <div className="bg-white rounded-2xl overflow-hidden border border-primary">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-primary text-tertiary/40">
                      <th className="px-6 py-4 font-black text-[10px] uppercase tracking-widest">Producto</th>
                      <th className="px-6 py-4 font-black text-[10px] uppercase tracking-widest text-center">Cant.</th>
                      <th className="px-6 py-4 font-black text-[10px] uppercase tracking-widest text-right">Precio</th>
                      <th className="px-6 py-4 font-black text-[10px] uppercase tracking-widest text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary">
                    {order.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-primary/50 transition-colors">
                        <td className="px-6 py-5 font-bold text-tertiary">
                          {item.name} 
                          {item.size && <span className="ml-2 text-[10px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-md uppercase font-black">{item.size}</span>}
                        </td>
                        <td className="px-6 py-5 text-center font-bold text-tertiary/60">{item.quantity}</td>
                        <td className="px-6 py-5 text-right font-medium text-tertiary/60">{currency}{item.price.toFixed(2)}</td>
                        <td className="px-6 py-5 text-right font-black text-tertiary">{currency}{(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-primary/30">
                      <td colSpan="3" className="px-6 py-6 text-right font-bold text-tertiary/40 uppercase tracking-widest text-xs">Total del Pedido</td>
                      <td className="px-6 py-6 text-right font-black text-secondary text-2xl">{currency}{order.amount.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 border-t border-primary flex justify-end">
            <button onClick={onClose} className="px-8 py-3 bg-secondary text-white font-black rounded-2xl hover:bg-secondary/90 transition-all shadow-xl shadow-secondary/20 uppercase text-xs tracking-widest">
              Cerrar Detalle
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='px-4 sm:px-10 py-10 bg-primary min-h-screen'>
      {showDetails && <OrderDetailsModal order={selectedOrder} onClose={() => setShowDetails(false)} />}
      <DeleteConfirmationModal
        isOpen={deleteModalData.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        productName={deleteModalData.customerName}
        isDeleting={deleteModalData.isDeleting}
      />
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-black text-tertiary tracking-tight">Gestión de <span className="text-secondary">Órdenes</span></h2>
          <p className="text-tertiary/40 font-bold mt-2 uppercase text-xs tracking-[0.2em]">Panel de control operativo</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-secondary/10 overflow-x-auto w-full lg:w-auto">
          <button 
            onClick={() => setFilter('1day')}
            className={`flex-1 lg:flex-none px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === '1day' ? 'bg-secondary text-white shadow-xl shadow-secondary/20' : 'text-tertiary/40 hover:bg-primary'}`}
          >
            Hoy
          </button>
          <button 
            onClick={() => setFilter('7days')}
            className={`flex-1 lg:flex-none px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === '7days' ? 'bg-secondary text-white shadow-xl shadow-secondary/20' : 'text-tertiary/40 hover:bg-primary'}`}
          >
            7 Días
          </button>
          <button 
            onClick={() => setFilter('30days')}
            className={`flex-1 lg:flex-none px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === '30days' ? 'bg-secondary text-white shadow-xl shadow-secondary/20' : 'text-tertiary/40 hover:bg-primary'}`}
          >
            30 Días
          </button>
          <button 
            onClick={() => setFilter('all')}
            className={`flex-1 lg:flex-none px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === 'all' ? 'bg-secondary text-white shadow-xl shadow-secondary/20' : 'text-tertiary/40 hover:bg-primary'}`}
          >
            Todos
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white h-20 rounded-2xl animate-pulse border border-primary"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="p-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-secondary/10">
          <div className="bg-primary w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <TfiPackage className="text-5xl text-secondary/20" />
          </div>
          <h3 className="text-2xl font-black text-tertiary">No hay pedidos</h3>
          <p className="text-tertiary/40 font-bold mt-2">El radar está despejado para este periodo.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-xl shadow-secondary/5 border border-primary overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-primary/50 text-tertiary/30">
                  <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em]">ID Orden</th>
                  <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em]">Cliente</th>
                  <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em]">Fecha y Hora</th>
                  <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em]">Total</th>
                  <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em]">Estado</th>
                  <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-right">Gestión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-primary/30 transition-all group">
                    <td className="px-8 py-6">
                      <span className="font-black text-tertiary text-sm">#{order._id.slice(-6).toUpperCase()}</span>
                      <p className="text-[10px] font-black text-secondary mt-1 uppercase">{order.items.length} productos</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-bold text-tertiary">{order.address.firstName} {order.address.lastName}</p>
                      <p className="text-[10px] font-bold text-tertiary/40 mt-1">{order.address.phone}</p>
                    </td>
                    <td className="px-8 py-6 text-sm font-medium text-tertiary/60">
                      {formatDate(order.date)}
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-secondary text-lg">{currency}{order.amount.toFixed(2)}</p>
                      <p className="text-[9px] font-black text-tertiary/30 uppercase tracking-widest">{order.paymentMethod}</p>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                        {editingOrder === order._id ? (
                          <div className="flex items-center gap-1.5 bg-primary p-1 rounded-xl">
                            <select
                              value={currentStatus}
                              onChange={(e) => setCurrentStatus(e.target.value)}
                              className='p-2 text-[10px] font-black uppercase rounded-lg border-none focus:ring-0 outline-none bg-transparent text-secondary'
                            >
                              <option value="Order Placed">Recibida</option>
                              <option value="Processing">Proceso</option>
                              <option value="Shipped">Enviada</option>
                              <option value="Delivered">Entregada</option>
                              <option value="Cancelled">Cancelada</option>
                            </select>
                            <button onClick={() => saveStatusChange(order._id)} className="p-2 text-white bg-green-500 rounded-lg shadow-lg shadow-green-100 hover:scale-110 transition-transform"><FaCheck size={10} /></button>
                            <button onClick={cancelEdit} className="p-2 text-white bg-red-500 rounded-lg shadow-lg shadow-red-100 hover:scale-110 transition-transform"><FaTimes size={10} /></button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <StatusBadge status={order.status} />
                            {canUpdateOrders && (
                              <button 
                                onClick={() => startEditStatus(order)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-secondary bg-secondary/10 rounded-xl hover:bg-secondary hover:text-white transition-all transform hover:rotate-12"
                              >
                                <FaEdit size={12} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center gap-3 justify-end">
                        <button 
                          onClick={() => { setSelectedOrder(order); setShowDetails(true); }}
                          className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-secondary bg-white border border-secondary/20 rounded-xl hover:bg-secondary hover:text-white hover:border-secondary transition-all shadow-sm"
                        >
                          Ver Detalles
                        </button>
                        {canDeleteOrders && (
                          <button 
                            onClick={() => openDeleteModal(order)}
                            className="p-3 text-tertiary/20 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <FaTrash size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;