// routes/orderRoutes.js
import express from 'express';
import { 
  placeOrder, 
  placeOrderStripe, 
  allOrders, 
  userOrders, 
  orderStatus, 
  verifyStripe,
  deleteOrder
} from '../controllers/orderController.js';
import { 
  authenticateUser,
  canViewOrders,
  canUpdateOrders,
  canDeleteOrders
} from '../middleware/authMiddleware.js';

const orderRouter = express.Router();

// Ruta para listar todas las órdenes (solo admin)
orderRouter.get('/list', 
  authenticateUser,
  canViewOrders, 
  allOrders
);

// Actualizar estado de la orden (solo admin)
orderRouter.post('/status', 
  authenticateUser,
  canUpdateOrders, 
  orderStatus
);

// Eliminar orden (solo admin)
orderRouter.delete('/:id', 
  authenticateUser,
  canDeleteOrders, 
  deleteOrder
);

// Crear orden con pago en efectivo
orderRouter.post('/place', 
  placeOrder
);

// Crear orden con pago por Stripe
orderRouter.post('/stripe', 
  placeOrderStripe);

// Obtener órdenes de usuario (propio usuario o admin)
orderRouter.post('/userorders',
  authenticateUser,
  userOrders
);

// Verificar pago de Stripe (solo admin)
orderRouter.post('/verify', 
  authenticateUser,
  canUpdateOrders,
  verifyStripe
);

export default orderRouter;