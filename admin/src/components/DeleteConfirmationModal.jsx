import React from 'react';

const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  productName,
  isDeleting 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg">
        <h2 className="mb-4 text-xl font-bold">Confirmar Eliminación</h2>
        
        <div className="mb-6">
          <p className="text-gray-700">
            ¿Estás seguro de que quieres realizar esta accion?
          </p>
          <div className="p-3 mt-2 border border-red-100 rounded-md bg-red-50">
            <span className="font-semibold text-red-700">{productName}</span>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Esta acción no se puede deshacer y el contenido se eliminará permanentemente.
          </p>
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 transition-colors border border-gray-300 rounded-md hover:bg-gray-100"
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-md transition-colors ${
              isDeleting ? 'bg-gray-500' : 'bg-red-500 hover:bg-red-600'
            }`}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <span className="flex items-center">
                <span className="mr-2">Eliminando...</span>
                <span className="inline-block w-4 h-4 border-t-2 border-white rounded-full animate-spin"></span>
              </span>
            ) : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;