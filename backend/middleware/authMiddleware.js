// authMiddleware.js
import jwt from 'jsonwebtoken';

export const authenticateUser = (req, res, next) => {
  // Manejar tanto 'Authorization: Bearer <token>', 'token: <token>' como cookies
  let token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    if (req.headers.token) {
      token = req.headers.token;
    } else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else {
      return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    }
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Ahora incluye permisos
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado', code: 'TOKEN_EXPIRED' });
    }
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Nuevo middleware de permisos mejorado
export const checkPermission = (resource, action) => {
  return (req, res, next) => {
    const requiredPermission = `${resource}:${action}`;
    
    // Asegurar que permissions sea siempre array
    const userPermissions = Array.isArray(req.user?.permissions) 
      ? req.user.permissions 
      : [];

    
    if (!userPermissions.includes(requiredPermission)) {
      return res.status(403).json({
        error: `Acción no autorizada: ${requiredPermission}`
      });
    }
    
    next();
  };
};

// Middlewares específicos para productos
export const canCreateProducts = checkPermission('products', 'create');
export const canReadProducts = checkPermission('products', 'read');
export const canViewProducts = checkPermission('products','view');
export const canUpdateProducts = checkPermission('products', 'update');
export const canDeleteProducts = checkPermission('products', 'delete');

// Middlewares específicos para órdenes
export const canCreateOrders = checkPermission('orders', 'create');
export const canReadOrders = checkPermission('orders','read')
export const canViewOrders = checkPermission('orders', 'view');
export const canUpdateOrders = checkPermission('orders', 'update');
export const canDeleteOrders = checkPermission('orders', 'delete');

// Middlewares específicos para usuarios
export const canCreateUsers = checkPermission('users', 'create');
export const canViewUsers = checkPermission('users','view')
export const canReadUsers = checkPermission('users', 'read');
export const canUpdateUsers = checkPermission('users', 'update');
export const canDeleteUsers = checkPermission('users', 'delete');

//Middlewares especificos para dashboard
export const canViewDashboard = checkPermission('dashboard','read')