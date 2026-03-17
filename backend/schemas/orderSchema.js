import mongoose from 'mongoose';
import { z } from 'zod';

// Validación para ObjectId de MongoDB (mismo que en productSchema)
export const objectIdSchema = z.string().refine(value => {
    return /^[0-9a-fA-F]{24}$/.test(value);
}, {
    message: "ID inválido (debe ser un ObjectId de 24 caracteres hexadecimales)"
});

// Esquema para ítem de pedido
const orderItemSchema = z.object({
    productId: objectIdSchema,
    name: z.string().min(1, "Nombre del ítem requerido"),
    quantity: z.coerce.number().int().positive("Cantidad debe ser positiva"),
    size: z.enum(['S', 'M', 'L'], {
        errorMap: () => ({ message: "Tamaño inválido. Valores permitidos: S, M, L" })
    }).optional(),
    price: z.coerce.number().positive("Precio debe ser positivo")
});

// Esquema para dirección
const addressSchema = z.object({
    firstName: z.string().min(1, "Nombre requerido"),
    lastName: z.string().min(1, "Apellido requerido"),
    province: z.string().min(1, "Provincia requerida"),
    municipality: z.string().min(1, "Municipio requerido"),
    exactAddress: z.string().min(1, "Dirección exacta requerida")
});

// Esquema principal para crear pedido
// En tus schemas/orderSchema.js
export const createOrderSchema = z.object({
  userId: z.string().refine(val => mongoose.Types.ObjectId.isValid(val)), 
  items: z.array(orderItemSchema),
  amount: z.number().positive(),
  address: addressSchema,
  paymentMethod: z.enum(['COD', 'Stripe', 'WhatsApp'])
});

// Esquema para actualizar pedido
export const updateOrderSchema = z.object({
    status: z.enum([
        'Order Placed', 
        'Processing', 
        'Shipped', 
        'Delivered', 
        'Cancelled'
    ]).optional(),
    payment: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
    message: "Debe proporcionar al menos un campo para actualizar",
    path: ['general']
});

// Esquema para parámetros de URL (orderId)
export const orderIdParamSchema = z.object({
    orderId: objectIdSchema
});

// Esquema para respuesta de pedidos
export const orderResponseSchema = z.object({
    success: z.boolean(),
    message: z.string().optional(),
    order: z.object({
        _id: objectIdSchema,
        userId: objectIdSchema,
        items: z.array(orderItemSchema),
        amount: z.number(),
        address: addressSchema,
        status: z.string(),
        paymentMethod: z.string(),
        payment: z.boolean(),
        date: z.number()
    }).optional(),
    orders: z.array(z.object({})).optional()
});

// Esquema para listado paginado de pedidos
export const listOrderSchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
    status: z.string().optional(),
    userId: objectIdSchema.optional(),
    startDate: z.coerce.number().optional(),
    endDate: z.coerce.number().optional()
});
// Esquema para verificación de Stripe
export const verifyStripeSchema = z.object({
  orderId: objectIdSchema,
  success: z.union([
    z.boolean(),
    z.enum(['true', 'false']).transform(val => val === 'true')
  ])
});

// Esquema para órdenes de usuario
export const userOrdersSchema = z.object({
  userId: objectIdSchema
});

// Esquema para actualización de estado
export const updateOrderStatusSchema = z.object({
  orderId: objectIdSchema,
  status: z.enum([
    'Order Placed', 
    'Processing', 
    'Shipped', 
    'Delivered', 
    'Cancelled',
    'Packing', 
    'Out for Delivery'
  ], {
    errorMap: () => ({ message: "Estado inválido" })
  })
});



// Exporta todos los esquemas
export default {
    objectIdSchema,
    orderItemSchema,
    addressSchema,
    createOrderSchema,
    updateOrderSchema,
    orderIdParamSchema,
    orderResponseSchema,
    listOrderSchema
};