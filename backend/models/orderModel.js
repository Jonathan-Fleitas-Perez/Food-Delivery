import mongoose from 'mongoose';
import { z } from 'zod';

// Esquema de validación con Zod
export const orderSchemaZod = z.object({
  userId: z.string().min(1, "ID de usuario requerido"),
  items: z.array(
    z.object({
      name: z.string().min(1, "Nombre del ítem requerido"),
      quantity: z.number().int().positive("Cantidad debe ser positiva"),
      size: z.string().optional(),
      price: z.record(z.string(), z.number()).optional()
    })
  ).nonempty("Debe haber al menos un ítem"),
  amount: z.number().positive("Monto debe ser positivo"),
  address: z.object({
    firstName: z.string().min(1, "Nombre requerido"),
    lastName: z.string().min(1, "Apellido requerido"),
    street: z.string().min(1, "Calle requerida"),
    city: z.string().min(1, "Ciudad requerida"),
    state: z.string().min(1, "Estado/provincia requerido"),
    country: z.string().min(1, "País requerido"),
    zipcode: z.string().min(1, "Código postal requerido"),
    phone: z.string().min(1, "Teléfono requerido")
  }),
  status: z.string().default('Order Placed'),
  paymentMethod: z.enum(['COD', 'Stripe'], {
    errorMap: () => ({ message: "Método de pago inválido" })
  }),
  payment: z.boolean().default(false),
  date: z.number().default(() => Date.now())
});

// Esquema Mongoose con validaciones mejoradas
const orderSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: [true, "ID de usuario requerido"] 
  },
  items: {
    type: [{
      name: { type: String, required: [true, "Nombre del ítem requerido"] },
      quantity: { 
        type: Number, 
        required: true,
        min: [1, "Cantidad debe ser al menos 1"]
      },
      size: String,
      price: Object
    }],
    validate: {
      validator: v => Array.isArray(v) && v.length > 0,
      message: "Debe haber al menos un ítem"
    }
  },
  amount: { 
    type: Number, 
    required: true,
    min: [0.01, "Monto debe ser positivo"]
  },
  address: {
    type: {
      firstName: { type: String, required: [true, "Nombre requerido"] },
      lastName: { type: String, required: [true, "Apellido requerido"] },
      street: { type: String, required: [true, "Calle requerida"] },
      city: { type: String, required: [true, "Ciudad requerida"] },
      state: { type: String, required: [true, "Estado/provincia requerido"] },
      country: { type: String, required: [true, "País requerido"] },
      zipcode: { type: String, required: [true, "Código postal requerido"] },
      phone: { type: String, required: [true, "Teléfono requerido"] }
    },
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: [
        'Order Placed', 
        'Packing', 
        'Shipped', 
        'Out for Delivery', 
        'Delivered'
      ],
      message: "Estado inválido"
    },
    default: 'Order Placed'
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['COD', 'Stripe']
  },
  payment: {
    type: Boolean,
    required: true,
    default: false
  },
  date: {
    type: Number,
    required: true,
    default: Date.now
  }
});

const orderModel = mongoose.models.order || mongoose.model('order', orderSchema);
export default orderModel;