import express from 'express';
import { 
  placeOrder, 
  placeOrderStripe, 
  allOrders, 
  userOrders, 
  orderStatus, 
  verifyStripe,
  deleteOrder // Importar nuevo controlador
} from '../controllers/orderController.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

const orderRouter = express.Router();

// Para administrador
orderRouter.post('/list', adminAuth, allOrders);
orderRouter.post('/status', adminAuth, orderStatus);
orderRouter.delete('/:orderId', adminAuth, deleteOrder); 

// Para métodos de pago
orderRouter.post('/place', authUser, placeOrder);
orderRouter.post('/stripe', authUser, placeOrderStripe);

// Para usuario
orderRouter.post('/userorders', authUser, userOrders);
orderRouter.post('/verify', authUser, verifyStripe);

export default orderRouter;