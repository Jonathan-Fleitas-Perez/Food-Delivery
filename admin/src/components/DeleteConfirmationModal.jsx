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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-tertiary/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-[2rem] shadow-2xl border border-secondary/10">
        <h2 className="mb-6 text-2xl font-black text-tertiary">Confirmar Eliminación</h2>
        
        <div className="mb-8">
          <p className="text-tertiary font-bold">
            ¿Estás seguro de que quieres realizar esta acción?
          </p>
          <div className="p-4 mt-4 border border-red-100 rounded-2xl bg-red-50/50">
            <span className="font-black text-red-600 uppercase text-xs tracking-widest">{productName}</span>
          </div>
          <p className="mt-4 text-xs font-medium text-tertiary/40 leading-relaxed">
            Esta acción no se puede deshacer y el registro se eliminará de forma permanente de la base de datos.
          </p>
        </div>
        
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 transition-all border border-primary rounded-xl hover:bg-primary font-black text-[10px] uppercase tracking-widest text-tertiary/40"
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white rounded-xl transition-all shadow-lg ${
              isDeleting ? 'bg-tertiary/20' : 'bg-red-500 hover:bg-red-600 shadow-red-100'
            }`}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <span className="flex items-center justify-center">
                <span className="inline-block w-3 h-3 border-t-2 border-white rounded-full animate-spin"></span>
              </span>
            ) : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;