// backend/controllers/productController.js
import { v2 as cloudinary } from "cloudinary";
import productModel from '../models/productModel.js';
import { 
    createProductSchema, 
    updateProductSchema,
    objectIdSchema,
    idParamSchema
} from '../schemas/productSchema.js';
import mongoose from 'mongoose';

// Middleware de validación mejorado
export const validateSchema = (schema) => async (req, res, next) => {
  try {
    // Combinar body, params, query y files
    const bodyAsObject = {}
    for (const [key, value] of Object.entries(req.body)) {
      // Manejar arrays (ej: prices[0][size])
     if (key.match(/\[\d+\]\[.+\]/)) {
        const [_, field, index, subfield] = key.match(/(\w+)\[(\d+)\]\[(\w+)\]/);
  
        if (!bodyAsObject[field]) bodyAsObject[field] = [];
        if (!bodyAsObject[field][index]) bodyAsObject[field][index] = {};
  
        bodyAsObject[field][index][subfield] = value;

      } else {
        bodyAsObject[key] = value
      }
    }
    const dataToValidate = {
      ...bodyAsObject,
      ...req.params,    
      ...req.query,
      ...(req.file ? { file: req.file } : {})
    };

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

// Middleware para manejo de operaciones de base de datos
const handleDBOperation = (operation) => async (req, res) => {
    try {
        const result = await operation(req);
        res.json(result);
    } catch (error) {
        console.error('Error en operación DB:', error);
        
        // Manejo específico de errores
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
            return res.status(400).json({
                success: false,
                message: `El valor '${error.keyValue.name}' ya existe para el campo 'name'`
            });
        }
        
        res.status(500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};


// Controlador para añadir producto
// backend/controllers/productController.js
export const addProduct = 
    handleDBOperation(async (req) => {
        const { name, description, category, prices, popular } = req.body;
        const file = req.file;
        
        if (!file) {
            throw new Error("Debe subir una imagen");
        }

        // 1. Subir imagen a Cloudinary
        const imageResult = await cloudinary.uploader.upload(file.path, {
            folder: 'productos'
        });
        
        // 2. Procesar precios (similar a updateProduct)
        const priceObj = {};
        const sizes = [];
        
        // Manejar diferentes formatos de precios
        let pricesArray = [];
        
        if (Array.isArray(prices)) {
            pricesArray = prices;
        } else if (prices && typeof prices === 'object') {
            // Convertir objeto a array: {S:10} -> [{size:'S', price:10}]
            pricesArray = Object.entries(prices).map(([size, price]) => ({
                size,
                price: Number(price)
            }));
        } else {
            throw new Error('Formato de precios inválido. Se esperaba array u objeto.');
        }

        // Validar precios
        if (pricesArray.length === 0) {
            throw new Error('Debe proporcionar al menos un tamaño con precio');
        }

        // Construir objeto de precios y lista de tamaños
        pricesArray.forEach(item => {
            if (!item.size || item.price === undefined) {
                throw new Error('Cada precio debe tener "size" y "price"');
            }
            
            const priceValue = Number(item.price);
            if (isNaN(priceValue)) {
                throw new Error(`Precio inválido para tamaño ${item.size}`);
            }
            
            priceObj[item.size] = priceValue;
            sizes.push(item.size);
        });

        // 3. Crear producto
        const product = new productModel({
            name,
            description: description || '',
            category,
            price: priceObj,
            popular: popular || false,
            sizes,
            image: imageResult.secure_url,
            date: Date.now()
        });
        
        await product.save();
        
        return {
            success: true,
            message: 'Producto creado exitosamente',
            product: product.toObject()
        };
    });
// Listar TODOS los productos (sin paginación)
export const listAllProducts = handleDBOperation(async () => {
  try {
    const products = await productModel.find({});
    return {
      success: true,
      products
    };
  } catch (error) {
    console.error('Error fetching all products:', error);
    throw new Error('Error obteniendo todos los productos');
  }
});

// Controlador para actualizar producto
export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const updateData = req.body;
    const file = req.file;
    
    // Si hay nueva imagen
    if (file) {
      // Subir nueva imagen
      const imageResult = await cloudinary.uploader.upload(file.path);
      updateData.image = imageResult.secure_url;
      
      // Eliminar imagen anterior
      const oldProduct = await productModel.findById(productId);
      if (oldProduct.image) {
        const publicId = oldProduct.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }
    }
    

if (updateData.prices) {
  try {
    let parsedPrices = updateData.prices;

    //  Parsear si es string
    if (typeof parsedPrices === 'string') {
      try {
        parsedPrices = JSON.parse(parsedPrices);
      } catch (parseError) {
        throw new Error('JSON de precios inválido');
      }
    }

    //  Aceptar tanto arrays como objetos
    let pricesArray = [];
    if (Array.isArray(parsedPrices)) {
      pricesArray = parsedPrices;
    } else if (parsedPrices && typeof parsedPrices === 'object') {
      // Convertir objeto a array: {small:10} -> [{size:'small', price:10}]
      pricesArray = Object.entries(parsedPrices).map(([size, price]) => ({
        size,
        price: Number(price)
      }));
    } else {
      throw new Error('Formato de precios inválido. Se esperaba array u objeto.');
    }

    // 3. Validar precios (no vacíos y válidos)
    if (pricesArray.length === 0) {
      throw new Error('Debe proporcionar al menos un tamaño con precio');
    }

    updateData.price = {};
    updateData.sizes = [];

    pricesArray.forEach(item => {
      if (!item.size || item.price === undefined) {
        throw new Error('Cada precio debe tener "size" y "price"');
      }
      const priceValue = Number(item.price);
      if (isNaN(priceValue)) throw new Error(`Precio inválido para tamaño ${item.size}`);
      
      updateData.price[item.size] = priceValue;
      updateData.sizes.push(item.size);
    });

    delete updateData.prices; // Eliminar campo temporal

  } catch (error) {
    console.error('Error procesando precios:', error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}
    
    // Actualizar producto
    const updatedProduct = await productModel.findByIdAndUpdate(
      productId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Producto actualizado',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

//Remover Producto
export const removeProduct = [
  validateSchema(idParamSchema), // Valida el ID en los parámetros
  handleDBOperation(async (req) => {
    const { productId } = req.validatedData;
    
    const result = await productModel.findByIdAndDelete(productId);
    
    if (!result) {
      throw new Error('Producto no encontrado');
    }
    
    // OPCIONAL: Eliminar imagen de Cloudinary
    if (result?.image) {
      const publicId = result.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`productos/${publicId}`);
    }
    
    return { message: 'Producto eliminado' };
  })
];

// Controlador para obtener un producto
export const singleProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await productModel.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    res.json({ 
      success: true,
      product 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error en el servidor'
    });
  }
};

// Controlador para listar productos
// Listar productos con paginación
export const listProduct = handleDBOperation(async (req) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const category = req.query.category;
    const filter = category && category !== 'all' ? { category } : {};
    
    const products = await productModel.find(filter)
      .skip(skip)
      .limit(limit);
    
    const total = await productModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    
    return {
      success: true,
      products,
      total,
      totalPages,
      currentPage: page
    };
  } catch (error) {
    console.error('Error listing products:', error);
    throw new Error('Error obteniendo la lista de productos');
  }
});

export const searchProducts = handleDBOperation(async (req) => {
    const { q } = req.query;
    
    if (!q || q.trim().length < 3) {
        return {
            success: true,
            products: [],
            message: 'Ingrese al menos 3 caracteres para buscar'
        };
    }
    
    try {
        // Realizar búsqueda full-text
        const products = await productModel.find(
            { $text: { $search: q } },
            { score: { $meta: "textScore" } }
        ).sort({ score: { $meta: "textScore" } }).limit(20);
        
        return {
            success: true,
            products: products.map(p => p.toObject())
        };
    } catch (error) {
        console.error('Error en búsqueda:', error);
        throw new Error('Error realizando la búsqueda');
    }
});


// Exporta todos los controladores
export default {
    addProduct,
    updateProduct,
    removeProduct,
    singleProduct,
    listProduct,
    searchProducts,
    listAllProducts  
};