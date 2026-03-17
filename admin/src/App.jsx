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
import Municipalities from './pages/Municipalities'
import Categories from './pages/Categories'
import Unauthorized from './components/Unauthorized'
import Offers from './pages/Offers'
import axios from 'axios'
import LoadingScreen from './components/LoadingScreen'

axios.defaults.withCredentials = true;

// eslint-disable-next-line react-refresh/only-export-components
export const backendUrl = import.meta.env.VITE_BACKEND_URL
export const currency = '$'

const ROLE_PERMISSIONS = { 
   admin: [
      'products:create', 'products:read', 'products:update', 'products:delete','products:view',
      'orders:create', 'orders:read', 'orders:update', 'orders:delete','orders:view',
      'users:create', 'users:read', 'users:update', 'users:delete','users:view',
      'categories:create', 'categories:read', 'categories:update', 'categories:delete',
      'dashboard:read'
    ],
    moderator: [
      'products:create', 'products:read', 'products:update', 'products:delete', 'products:view',
      'orders:create', 'orders:read', 'orders:update', 'orders:view',
      'users:create', 'users:read', 'users:update', 'users:view',
      'categories:create', 'categories:read', 'categories:update', 'categories:delete',
      'dashboard:read'
    ],
    customer: [
      'orders:create','orders:read',
      'products:read','products:view'
    ]
}

// Componente para validar rutas
const RouteValidator = ({ children, resource, action }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);
  
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token'); 
      
      if (!token) {
        setIsAuthorized(false);
        return;
      }
      
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        const permissions = ROLE_PERMISSIONS[payload.role] || [];
        const requiredPermission = `${resource}:${action}`;
        
        if (!permissions.includes(requiredPermission)) {
          setIsAuthorized('unauthorized');
        } else {
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        setIsAuthorized(false);
      }
    };
    checkAuth();
  }, [resource, action]);

  if (isAuthorized === null) return <div>Cargando...</div>;
  if (isAuthorized === false) return <Navigate to="/login" replace />;
  if (isAuthorized === 'unauthorized') return <Navigate to="/unauthorized" replace />;
  
  return children;
};

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '')
  const [userRole, setUserRole] = useState('customer')
  const [userPermissions, setUserPermissions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Configurar interceptor de Axios para refresco de token
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (originalRequest.url.includes('/api/user/refresh')) {
          setToken('');
          localStorage.removeItem('token');
          return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const response = await axios.post(`${backendUrl}/api/user/refresh`);
            if (response.data.success) {
              const newToken = response.data.token;
              setToken(newToken);
              localStorage.setItem('token', newToken);
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            setToken('');
            localStorage.removeItem('token');
            return Promise.reject(refreshError);
          }
        }

        if (error.response?.status === 401) {
          setToken('');
          localStorage.removeItem('token');
        }

        return Promise.reject(error);
      }
    );

    // Verificación inicial de sesión y carga progresiva
    if (token) {
      localStorage.setItem('token', token)
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        setUserRole(payload.role || 'customer');
        setUserPermissions(ROLE_PERMISSIONS[payload.role] || []);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    } else {
      localStorage.removeItem('token')
    }

    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => {
      axios.interceptors.response.eject(interceptor);
      clearTimeout(timer);
    };
  }, [token])

  return (
    <main>
      {isLoading && <LoadingScreen />}
      <ToastContainer />
      {token === '' ? (
        <Login settoken={setToken} />
      ) : (   
        <div className='bg-primary text-[#404040] min-h-screen'>
          <Header userRole={userRole}/>
          <div className='mx-auto max-w-[1440px] flex flex-col sm:flex-row pt-20 sm:pt-24'>
            <Sidebar 
              token={token} 
              setToken={setToken} 
              userRole={userRole}
              permissions={userPermissions}
            />
            <div className='flex-1 w-full p-2 sm:p-4 overflow-x-hidden'>
              <Routes>
                <Route path='/add' element={
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
                
                <Route path='/' element={
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
                <Route path='/municipalities' element={
                  <RouteValidator resource="users" action="read">
                    <Municipalities url={backendUrl} />
                  </RouteValidator>
                } />
                <Route path='/categories' element={
                  <RouteValidator resource="categories" action="read">
                    <Categories token={token} />
                  </RouteValidator>
                } />
                <Route path='/offers' element={
                  <RouteValidator resource="products" action="read">
                    <Offers token={token} />
                  </RouteValidator>
                } />
                <Route path='/unauthorized' element={<Unauthorized />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default App