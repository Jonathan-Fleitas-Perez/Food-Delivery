import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RouteValidator = ({ children, resource, action }) => {
  const { permissions, isLoading } = useAuth();
  
  // Si aún está cargando, mostrar un loader
  if (isLoading) {
    return <div>Cargando...</div>;
  }
  
  // Construir el permiso requerido
  const requiredPermission = `${resource}:${action}`;
  
  // Verificar si el usuario tiene el permiso requerido
  if (!permissions.includes(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

export default RouteValidator;