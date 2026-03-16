// controllers/orderController.js
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import { 
  createOrderSchema,
  updateOrderSchema,
  orderIdParamSchema,
  verifyStripeSchema,
  userOrdersSchema,
  updateOrderStatusSchema,
  listOrderSchema
} from '../schemas/orderSchema.js';
import mongoose from 'mongoose';

const currency = 'cup';
const Delivery_Charges = 0; // Se calcula dinámicamente por municipio

// Middleware de validación mejorado
export const validateSchema = (schema) => async (req, res, next) => {
  try {
    const dataToValidate = {
      ...req.body,
      ...req.params,
      ...req.query
    };

    // Conversión de tipos específica para esquemas de órdenes
    if (schema === createOrderSchema || schema === updateOrderSchema) {
      if (dataToValidate.amount) dataToValidate.amount = Number(dataToValidate.amount);
      if (dataToValidate.items && Array.isArray(dataToValidate.items)) {
        dataToValidate.items = dataToValidate.items.map(item => ({
          ...item,
          quantity: Number(item.quantity),
          price: Number(item.price)
        }));
      }
    }

    const parsedData = await schema.safeParseAsync(dataToValidate);
    
    if (!parsedData.success) {
      const errors = parsedData.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: "Error de validación",
        errors
      });
    }
    
    req.validatedData = parsedData.data;
    next();
  } catch (error) {
    console.error('Error en middleware de validación:', error);
    res.status(500).json({
      success: false,
      message: "Error interno de validación"
    });
  }
};

// Manejador de operaciones de base de datos mejorado
const handleDBOperation = (operation) => async (req, res) => {
    try {
        const result = await operation(req);
        res.json(result);
    } catch (error) {
        console.error('Error en operación DB:', error);
        
        if (error instanceof mongoose.Error.ValidationError) {
            const errors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            
            return res.status(400).json({
                success: false,
                message: 'Error de validación de datos',
                errors
            });
        }
        
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({
                success: false,
                message: `El valor '${error.keyValue[field]}' ya existe para el campo ${field}`
            });
        }
        
        // Manejar errores específicos de Stripe
        if (error instanceof Stripe.errors.StripeError) {
            return res.status(400).json({
                success: false,
                message: `Error de Stripe: ${error.message}`
            });
        }
        
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

// Realizar el pago de la orden usando pago en efectivo
// Realizar el pago de la orden usando pago en efectivo
const placeOrder = [
  handleDBOperation(async (req) => {
    const { userId, items, amount, address, paymentMethod = 'COD' } = req.body;
    
    // Procesar los ítems para convertir precios a números
    const processedItems = items.map(item => {
      // Convertir precio de objeto a número si es necesario
      let itemPrice = item.price;
      
      if (typeof itemPrice === 'object') {
        // Usar el precio correspondiente al tamaño seleccionado
        if (item.size && itemPrice[item.size]) {
          itemPrice = itemPrice[item.size];
        } 
        // O usar el primer precio disponible si no hay tamaño
        else {
          const firstSize = Object.keys(itemPrice)[0];
          itemPrice = itemPrice[firstSize];
        }
      }
      
      return {
        ...item,
        price: Number(itemPrice)  // Asegurar que sea un número
      };
    });

    const orderData = {
      userId,
      items: processedItems,  // Usar los ítems procesados
      amount,
      address,
      paymentMethod,
      payment: paymentMethod === 'Stripe' ? false : true,
      status: 'Order Placed',
      date: Date.now()
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();
    
    // Vaciar carrito para COD o WhatsApp
    if (paymentMethod === 'COD' || paymentMethod === 'WhatsApp') {
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
    }

    return { 
      success: true, 
      message: 'Orden creada exitosamente',
      order: newOrder.toObject({ virtuals: true })
    };
  })
];

// Realizar el pago de la orden mediante stripe
const placeOrderStripe = [
  validateSchema(createOrderSchema),
  handleDBOperation(async (req) => {
    const { userId, items, amount, address, paymentMethod = 'Stripe' } = req.validatedData;
    const { origin } = req.headers;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Procesar los ítems para convertir precios a números
    const processedItems = items.map(item => {
      // Convertir precio de objeto a número si es necesario
      let itemPrice = item.price;
      
      if (typeof itemPrice === 'object') {
        // Usar el precio correspondiente al tamaño seleccionado
        if (item.size && itemPrice[item.size]) {
          itemPrice = itemPrice[item.size];
        } 
        // O usar el primer precio disponible si no hay tamaño
        else {
          const firstSize = Object.keys(itemPrice)[0];
          itemPrice = itemPrice[firstSize];
        }
      }
      
      return {
        ...item,
        price: Number(itemPrice)  // Asegurar que sea un número
      };
    });

    // Crear la orden en estado pendiente
    const orderData = {
      userId,
      items: processedItems,  // Usar los ítems procesados
      amount,
      address,
      paymentMethod,
      payment: false,
      status: 'Order Placed',
      date: Date.now()
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // Preparar los ítems para Stripe
    const line_items = processedItems.map((item) => ({
      price_data: {
        currency,
        product_data: {
          name: item.name,
          ...(item.size && { metadata: { size: item.size } })
        },
        unit_amount: Math.round(item.price * 100) // Convertir a centavos
      },
      quantity: item.quantity
    }));


  })
];

// Verificación de Stripe
const verifyStripe = [
  validateSchema(verifyStripeSchema),
  handleDBOperation(async (req) => {
    const { orderId, success } = req.validatedData;
    
    const order = await orderModel.findById(orderId);
    if (!order) {
      throw new Error('Orden no encontrada');
    }

    if (success) {
      // Actualizar orden y vaciar carrito
      order.payment = true;
      order.status = 'Processing';
      await order.save();
      
      await userModel.findByIdAndUpdate(order.userId, { cartData: {} });

      return { success: true, message: 'Pago verificado exitosamente' };
    } else {
      // Cancelar orden si el pago falló
      order.status = 'Cancelled';
      await order.save();
      return { success: false, message: 'Pago cancelado' };
    }
  })
];

// Eliminar orden
const deleteOrder = [
  validateSchema(orderIdParamSchema),
  handleDBOperation(async (req) => {
    const { orderId } = req.validatedData;
    
    const deletedOrder = await orderModel.findByIdAndDelete(orderId);
    
    if (!deletedOrder) {
      throw new Error('Orden no encontrada');
    }

    return { 
      success: true, 
      message: 'Orden eliminada exitosamente',
      orderId: deletedOrder._id
    };
  })
];

// Obtener todas las órdenes (panel admin) con paginación
const allOrders = [
  validateSchema(listOrderSchema),
  handleDBOperation(async (req) => {
    const { page = 1, limit = 10, status } = req.validatedData;
    const skip = (page - 1) * limit;

    // Construir query
    const query = {};
    if (status) query.status = status;

    const [orders, total] = await Promise.all([
      orderModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate('userId', 'name email')
        .lean(),
      orderModel.countDocuments(query)
    ]);

    return { 
      success: true, 
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  })
];

// Obtener órdenes de usuario
const userOrders = handleDBOperation(async (req) => {
  const userId = req.user.id; // Obtener del token
  
  const orders = await orderModel.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
  
  return { success: true, orders };
});

// Actualizar estado de orden
const orderStatus = [
  validateSchema(updateOrderStatusSchema),
  handleDBOperation(async (req) => {
    const { orderId, status } = req.validatedData;
    
       const validStatuses = [
      'Order Placed', 
      'Processing', 
      'Packing', 
      'Shipped', 
      'Out for Delivery', 
      'Delivered',
      'Cancelled'
    ];
    
    if (!validStatuses.includes(status)) {
      throw {
        statusCode: 400,
        message: `Estado inválido. Valores permitidos: ${validStatuses.join(', ')}`
      };
    }
    
    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId, 
      { status }, 
      { new: true, runValidators: true }
    );
    
    if (!updatedOrder) {
      throw new Error('Orden no encontrada');
    }
    
    return { 
      success: true, 
      message: 'Estado actualizado exitosamente',
      order: updatedOrder.toObject({ virtuals: true })
    };
  })
];

export {
  placeOrder,
  placeOrderStripe,
  verifyStripe,
  deleteOrder,
  allOrders,
  userOrders,
  orderStatus
};