import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { backendUrl } from '../App';
import axios from 'axios';
import UserForm from '../components/UserForm'; // Importamos el formulario modal

const UserManagement = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);

  // Obtener permisos del usuario actual
  useEffect(() => {
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        setUserPermissions(payload.permissions || []);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, [token]);

  // Cargar usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${backendUrl}/api/user/list`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          setUsers(response.data.users);
        } else {
          setError(response.data.message || 'Error al cargar usuarios');
          toast.error(response.data.message || 'Error al cargar usuarios');
        }
      } catch (error) {
        console.error(error);
        setError(error.response?.data?.message || 'Error de conexión');
        toast.error(error.response?.data?.message || 'Error de conexión');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [token]);

  // Filtrar usuarios basado en el término de búsqueda
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = pageNumber => setCurrentPage(pageNumber);

  // Abrir modal en modo creación
  const openCreateModal = () => {
    setCurrentUser(null);
    setShowModal(true);
  };

  // Abrir modal en modo edición
  const openEditModal = (user) => {
    setCurrentUser(user);
    setShowModal(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setShowModal(false);
    setCurrentUser(null);
  };

  // Manejar eliminación de usuario
  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        const response = await axios.delete(`${backendUrl}/api/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          toast.success('Usuario eliminado');
          // Actualizar lista de usuarios
          const updatedUsers = users.filter(user => user._id !== userId);
          setUsers(updatedUsers);
        } else {
          toast.error(response.data.message || 'Error al eliminar usuario');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error de conexión');
      }
    }
  };

  // Actualizar lista después de crear/editar
  const handleUserUpdated = (newUser, isEdit) => {
    if (isEdit) {
      setUsers(users.map(u => u._id === newUser._id ? newUser : u));
    } else {
      setUsers([...users, newUser]);
    }
    closeModal();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-t-2 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl p-4 mx-auto">
        <div className="p-6 text-center bg-red-100 rounded-lg">
          <h3 className="text-xl font-bold text-red-700">Error</h3>
          <p className="mt-2 text-red-600">{error}</p>
          <p className="mt-4 text-sm text-gray-600">
            Verifica tus permisos o intenta recargar la página
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl p-4 mx-auto">
      {/* Modal para crear/editar usuarios */}
      {showModal && (
        <UserForm 
          token={token} 
          user={currentUser} 
          onClose={closeModal} 
          onUserUpdated={handleUserUpdated} 
        />
      )}

      <div className="flex flex-col items-start justify-between mb-6 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
          <p className="mt-1 text-sm text-gray-600">
            {users.length} usuario{users.length !== 1 ? 's' : ''} en el sistema
          </p>
        </div>
        
        <div className="flex flex-col w-full mt-4 space-y-3 md:mt-0 md:flex-row md:items-center md:space-y-0 md:space-x-3 md:w-auto">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Buscar usuarios..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchTerm && (
              <button 
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                onClick={() => setSearchTerm('')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          
          <button 
            onClick={openCreateModal}
            className="flex items-center justify-center px-4 py-2 space-x-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            disabled={!userPermissions.includes('users:create')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            <span>Crear Usuario</span>
          </button>
        </div>
      </div>

      {/* Vista de escritorio - Tabla */}
      <div className="hidden overflow-x-auto bg-white rounded-lg shadow md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Rol</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentUsers.map(user => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 mr-3 bg-indigo-100 rounded-full">
                      <span className="font-semibold text-indigo-800">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' : 
                    user.role === 'moderator' ? 'bg-blue-100 text-blue-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role === 'moderator' ? 'Moderador' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="flex items-center px-3 py-1 text-sm text-indigo-600 rounded-md hover:bg-indigo-50"
                      disabled={!userPermissions.includes('users:update')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Editar
                    </button>
                    
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="flex items-center px-3 py-1 text-sm text-red-600 rounded-md hover:bg-red-50"
                      disabled={!userPermissions.includes('users:delete')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 sm:px-6">
            <div className="flex justify-between flex-1 sm:hidden">
              <button
                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  currentPage === 1 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                Anterior
              </button>
              <button
                onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  currentPage === totalPages 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{indexOfFirstUser + 1}</span> a 
                  <span className="font-medium"> {Math.min(indexOfLastUser, filteredUsers.length)}</span> de 
                  <span className="font-medium"> {filteredUsers.length}</span> usuarios
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-l-md ${
                      currentPage === 1 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Anterior</span>
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                        currentPage === number
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-r-md ${
                      currentPage === totalPages 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Siguiente</span>
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vista móvil - Cards */}
      <div className="space-y-4 md:hidden">
        {currentUsers.length === 0 ? (
          <div className="p-4 text-center rounded-lg bg-gray-50">
            <p className="text-gray-500">No se encontraron usuarios</p>
          </div>
        ) : (
          currentUsers.map(user => (
            <div key={user._id} className="p-4 bg-white rounded-lg shadow">
              <div className="flex items-start">
                <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mr-3 bg-indigo-100 rounded-full">
                  <span className="font-semibold text-indigo-800">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline">
                    <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                    <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' : 
                      user.role === 'moderator' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role === 'moderator' ? 'Moderador' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-600 truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex justify-end mt-3 space-x-2">
                <button 
                  onClick={() => openEditModal(user)}
                  className="flex items-center px-3 py-1 text-sm text-indigo-600 rounded-md hover:bg-indigo-50"
                  disabled={!userPermissions.includes('users:update')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Editar
                </button>
                
                <button 
                  onClick={() => handleDeleteUser(user._id)}
                  className="flex items-center px-3 py-1 text-sm text-red-600 rounded-md hover:bg-red-50"
                  disabled={!userPermissions.includes('users:delete')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
        
        {/* Paginación móvil */}
        {totalPages > 1 && (
          <div className="flex justify-between">
            <button
              onClick={() => currentPage > 1 && paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md ${
                currentPage === 1 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              Anterior
            </button>
            
            <div className="flex items-center">
              <span className="text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </span>
            </div>
            
            <button
              onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md ${
                currentPage === totalPages 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;