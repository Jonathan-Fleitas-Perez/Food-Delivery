import React from 'react';
import { Link } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';

const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md p-8 text-center bg-white rounded-lg shadow-lg">
        <div className="flex justify-center mb-4">
          <FaLock className="text-5xl text-red-500" />
        </div>
        
        <h1 className="mb-2 text-2xl font-bold text-gray-800">Acceso no autorizado</h1>
        <p className="mb-6 text-gray-600">
          No tienes permiso para acceder a esta página. 
          Por favor, contacta al administrador si necesitas acceso.
        </p>
        
        <Link 
          to="/" 
          className="px-6 py-3 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;