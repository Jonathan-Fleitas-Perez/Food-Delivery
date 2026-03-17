// components/StatusBadge.jsx
import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'Order Placed':
        return { text: 'Recibida', color: 'bg-orange-50 text-secondary border-orange-100' };
      case 'Processing':
        return { text: 'En Proceso', color: 'bg-amber-50 text-amber-600 border-amber-100' };
      case 'Shipped':
        return { text: 'Enviada', color: 'bg-white text-secondary border-secondary/20' };
      case 'Delivered':
        return { text: 'Entregada', color: 'bg-green-50 text-green-600 border-green-100' };
      case 'Cancelled':
        return { text: 'Cancelada', color: 'bg-red-50 text-red-600 border-red-100' };
      default:
        return { text: status, color: 'bg-primary text-tertiary/40 border-primary' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${statusInfo.color}`}>
      {statusInfo.text}
    </span>
  );
};

export default StatusBadge;