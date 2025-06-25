import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { backendUrl } from '../App';
import axios from 'axios';

const UserForm = ({ token, user, onClose, onUserUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer'
  });
   const [currentUserId, setCurrentUserId] = useState(null);

  // Cargar datos si estamos editando
  useEffect(() => {

    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        setCurrentUserId(payload.id);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }

    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        password: ''
      });
    } else {
      // Resetear formulario para creación
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'customer'
      });
    }
  }, [user,token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name || !formData.email) {
        toast.error('Nombre y email son obligatorios');
        return;
      }

      if (!user && !formData.password) {
        toast.error('La contraseña es obligatoria para nuevos usuarios');
        return;
      }
      let response;
      if (user) {
        // Actualizar usuario existente
        response = await axios.put(
          `${backendUrl}/api/user/${user._id}`,
          {
          updateData:formData,
          id:user._id
        },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          }
        );
      } else {
        // Crear nuevo usuario
        response = await axios.post(
          `${backendUrl}/api/user/createUser`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      if (response.data.success) {
        toast.success(user ? 'Usuario actualizado' : 'Usuario creado');
        onUserUpdated(response.data.user, !!user);
      } else {
        toast.error(response.data.message || 'Error en la operación');
      }
    } catch (error) {
      console.error('Error en UserForm:', error);
      toast.error(error.response?.data?.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

   const isCurrentUser = user && currentUserId && user._id === currentUserId;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-w-2xl w-full p-6 mx-4 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{user ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {user ? 'Nueva Contraseña (dejar vacío para mantener)' : 'Contraseña'}
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              minLength={8}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <p className="mt-1 text-sm text-gray-500">Mínimo 8 caracteres</p>
          </div>
          
        <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Rol</label>
        <select
          name="role"
          id="role"
          value={formData.role}
          onChange={handleChange}
          required
          disabled={isCurrentUser}  // Deshabilitar si es el usuario actual
          className={`block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
            isCurrentUser ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        >
          <option value="customer">Cliente</option>
          <option value="manager">Manager</option>
          <option value="admin">Administrador</option>
        </select>
        {isCurrentUser && (
          <p className="mt-2 text-sm text-red-600">
            No puedes modificar tu propio rol
          </p>
        )}
      </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Guardando...' : (user ? 'Actualizar Usuario' : 'Crear Usuario')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;