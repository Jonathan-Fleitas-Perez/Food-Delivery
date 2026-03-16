import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuarios',
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
      // CAMBIAR DE OBJECT A NUMBER
      price: { type: Number, required: true }
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
      province: { type: String, required: [true, "Provincia requerida"] },
      municipality: { type: String, required: [true, "Municipio requerido"] },
      exactAddress: { type: String, required: [true, "Dirección exacta requerida"] }
    },
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: [
        'Order Placed', 
        'Processing', 
        'Packing', 
        'Shipped', 
        'Out for Delivery', 
        'Delivered',
        'Cancelled' 
      ],
      message: "Estado inválido. Valores permitidos: Order Placed, Processing, Packing, Shipped, Out for Delivery, Delivered, Cancelled"
    },
    default: 'Order Placed'
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['COD', 'Stripe', 'WhatsApp']
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