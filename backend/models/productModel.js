import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
    maxlength: [100, 'El nombre no puede exceder los 100 caracteres'],
    trim: true,
    // Sanitización básica contra XSS
    validate: {
      validator: (value) => !/<script>|<\/script>/i.test(value),
      message: 'El nombre contiene contenido no permitido'
    }
  },
  
  description: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    minlength: [10, 'La descripción debe tener al menos 10 caracteres'],
    maxlength: [500, 'La descripción no puede exceder los 500 caracteres'],
    trim: true,
    validate: {
      validator: (value) => !/<script>|<\/script>/i.test(value),
      message: 'La descripción contiene contenido no permitido'
    }
  },
  
  category: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    trim: true,
  },
  
  image: {
    type: String,
    required: [true, 'La imagen es obligatoria'],
    validate: {
      validator: (value) => {
        // Validar formato de URL y dominio de Cloudinary
        const urlPattern = /^(https?):\/\/[^\s/$.?#].[^\s]*$/i;
        const cloudinaryPattern = /res\.cloudinary\.com/;
        return urlPattern.test(value) && cloudinaryPattern.test(value);
      },
      message: 'URL de imagen inválida. Debe ser una URL válida de Cloudinary'
    }
  },
  
  price: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio debe ser un número positivo']
  },
  
  date: {
    type: Number,
    required: true,
    default: Date.now,
    validate: {
      validator: (value) => value > 0 && value <= Date.now(),
      message: 'Fecha inválida. Debe ser un timestamp válido'
    }
  },
  
  salesCount: {
    type: Number,
    default: 0
  },  
  popular: {
    type: Boolean,
    default: false
  },
  averageRating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  ratings: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuarios' },
    userName: String,
    rating: { type: Number, required: true, min: 0, max: 5 },
    comment: String,
    date: { type: Date, default: Date.now }
  }]
}, {
  timestamps: false, // Deshabilitamos los timestamps automáticos porque tenemos date
  versionKey: false // No necesitamos __v
});

// Crear índice para búsquedas eficientes
productSchema.index({ name: 'text', category: 1 }, { 
  weights: { name: 3, category: 1 } 
});

const productModel = mongoose.models.product || mongoose.model('product', productSchema);
export default productModel;