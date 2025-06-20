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
    minlength: [3, 'La categoría debe tener al menos 3 caracteres'],
    maxlength: [50, 'La categoría no puede exceder los 50 caracteres'],
    trim: true,
    enum: {
      values: ['Curry', 'Pizza', 'Rice', 'Deserts','Drinks','Fruits'],
      message: 'Categoría inválida. Valores permitidos: bebidas, comida, postres, ensaladas'
    }
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
  type: Object,
  required: [true, 'Los precios son obligatorios'],
  validate: {
    validator: function(value) {
      const sizes = Object.keys(value);
      
      // Validación 1: Debe tener al menos un tamaño definido
      if (sizes.length === 0) return false;
      
      // Validación 2: Todos los precios deben ser números positivos
      const allPricesValid = sizes.every(size => {
        return typeof value[size] === 'number' && value[size] > 0;
      });
      
      return allPricesValid;
    },
    message: 'Debe tener al menos un tamaño con un precio numérico positivo'
  }
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
  
  sizes: {
    type: [String],
    required: [true, 'Los tamaños son obligatorios'],
    validate: {
      validator: (value) => {
        // Validar que haya al menos un tamaño
        if (value.length === 0) return false;
        
        // Validar que todos los tamaños sean válidos
        const validSizes = ['S', 'M', 'L'];
        return value.every(size => validSizes.includes(size));
      },
      message: 'Debe tener al menos un tamaño válido (small, medium, large)'
    }
  },
  
  popular: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: false, // Deshabilitamos los timestamps automáticos porque tenemos date
  versionKey: false // No necesitamos __v
});

// Middleware para validar consistencia entre precios y tamaños
productSchema.pre('validate', function(next) {
  const priceSizes = Object.keys(this.price || {});
  const definedSizes = this.sizes || [];
  
  // Verificar que todos los tamaños en price estén en sizes
  const missingInSizes = priceSizes.filter(size => !definedSizes.includes(size));
  
  if (missingInSizes.length > 0) {
    this.invalidate(
      'price', 
      `Los tamaños en precio (${missingInSizes.join(', ')}) no están definidos en la lista de tamaños`,
      this.price
    );
  }
  
  next();
});

// Crear índice para búsquedas eficientes
productSchema.index({ name: 'text', category: 1 }, { 
  weights: { name: 3, category: 1 } 
});

const productModel = mongoose.models.product || mongoose.model('product', productSchema);
export default productModel;