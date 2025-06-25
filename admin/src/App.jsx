import  { useEffect, useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import { Route, Routes, Navigate } from 'react-router-dom'
import Add from './pages/Add'
import List from './pages/List'
import Order from './pages/Order'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Login from './components/Login'
import Dashboard from './pages/Dashboard'
import UserManagement from './pages/UserManagement'
import Unauthorized from './components/Unauthorized'

// eslint-disable-next-line react-refresh/only-export-components
export const backendUrl = import.meta.env.VITE_BACKEND_URL
export const currency = '$'
const ROLE_PERMISSIONS = { 
   admin: [
      'products:create', 'products:read', 'products:update', 'products:delete','products:view',
      'orders:create', 'orders:read', 'orders:update', 'orders:delete','orders:view',
      'users:create', 'users:read', 'users:update', 'users:delete','users:view',
      'dashboard:read'
    ],
    manager: [
      'products:create', 'products:read', 'products:update','products:view',
      'orders:create', 'orders:view', 'orders:update','orders:read',
      'users:read','users:view',
      'dashboard:read'
    ],
    customer: [
      'orders:create','orders:read',
      'products:read','products:view'
    ]
}

// Componente para validar rutas
const RouteValidator = ({ children, resource, action }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  try {
    // Decodificar el token para obtener información del usuario
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    // Obtener permisos basados en el rol
    const permissions = ROLE_PERMISSIONS[payload.role] || [];
    
    // Construir el permiso requerido
    const requiredPermission = `${resource}:${action}`;
    
    // Verificar si el usuario tiene el permiso requerido
    if (!permissions.includes(requiredPermission)) {
      return <Navigate to="/unauthorized" replace />;
    }
    
    return children;
  } catch (error) {
    console.error('Error decoding token:', error);
    return <Navigate to="/login" replace />;
  }
};

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '')
  const [userRole, setUserRole] = useState('customer')
  const [userPermissions, setUserPermissions] = useState([])

  useEffect(() => {
    localStorage.setItem('token', token)
    
    if (token) {
      try {
        // Decodificar el token para obtener información del usuario
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        setUserRole(payload.role || 'customer');
        setUserPermissions(ROLE_PERMISSIONS[payload.role] || []);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, [token])

  return (
    <main>
      <ToastContainer />
      {token === '' ? (
        <Login settoken={setToken} />
      ) : (   
        <div className='bg-primary text-[#404040]'>
          <Header userRole={userRole} />
          <div className='mx-auto max-w-[1440px] flex flex-col sm:flex-row mt-8 sm:mt-4'>
            <Sidebar 
              token={token} 
              setToken={setToken} 
              userRole={userRole}
              permissions={userPermissions}
            />
            <Routes>
              <Route path='/' element={
                <RouteValidator resource="products" action="create">
                  <Add token={token} permissions={userPermissions} />
                </RouteValidator>
              }/>
              
              <Route path='/list' element={
                <RouteValidator resource="products" action="read">
                  <List token={token} permissions={userPermissions} />
                </RouteValidator>
              }/>
              
              <Route path='/orders' element={
                <RouteValidator resource="orders" action="view">
                  <Order token={token} permissions={userPermissions} />
                </RouteValidator>
              }/>
              
              <Route path='/dashboard' element={
                <RouteValidator resource="dashboard" action="read">
                  <Dashboard token={token} permissions={userPermissions} />
                </RouteValidator>
              } />
              
              {/* Nuevas rutas para gestión de usuarios */}
              <Route path='/users' element={
                <RouteValidator resource="users" action="read">
                  <UserManagement token={token} />
                </RouteValidator>
              } />
                     
              {/* Ruta para acceso no autorizado */}
              <Route path='/unauthorized' element={<Unauthorized />} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      )}
    </main>
  )
}

export default App