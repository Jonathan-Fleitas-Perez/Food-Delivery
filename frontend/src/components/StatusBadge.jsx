// components/StatusBadge.jsx
import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'Order Placed':
        return { text: 'Recibida', color: 'bg-blue-100 text-blue-800' };
      case 'Processing':
        return { text: 'En Proceso', color: 'bg-yellow-100 text-yellow-800' };
      case 'Shipped':
        return { text: 'Enviada', color: 'bg-purple-100 text-purple-800' };
      case 'Delivered':
        return { text: 'Entregada', color: 'bg-green-100 text-green-800' };
      case 'Cancelled':
        return { text: 'Cancelada', color: 'bg-red-100 text-red-800' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
      {statusInfo.text}
    </span>
  );
};

export default StatusBadge;