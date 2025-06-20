// backend/schemas/productSchema.js
import { z } from 'zod';

// Validación para ObjectId de MongoDB
export const objectIdSchema = z.string().refine(value => {
    return /^[0-9a-fA-F]{24}$/.test(value);
}, {
    message: "ID inválido (debe ser un ObjectId de 24 caracteres hexadecimales)"
});

// Esquema para ítem de precio (tamaño y precio)
const priceItemSchema = z.object({
    size: z.enum(['S', 'M', 'L'], {
        errorMap: () => ({ message: "Tamaño inválido. Valores permitidos: small, medium, large" })
    }),
    price: z.number().min(0, "El precio debe ser un número positivo")
});

// Esquema principal para crear producto
export const createProductSchema = z.object({
    name: z.string()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(100, "El nombre no puede exceder los 100 caracteres")
        .refine(value => !/<script>|<\/script>/i.test(value), {
            message: "El nombre contiene contenido no permitido"
        }),
    
    description: z.string()
        .min(10, "La descripción debe tener al menos 10 caracteres")
        .max(500, "La descripción no puede exceder los 500 caracteres")
        .optional(),
    
    category: z.string()
        .min(3, "La categoría debe tener al menos 3 caracteres")
        .max(50, "La categoría no puede exceder los 50 caracteres"),
    
      prices: z.union([
        z.array(z.object({
            size: z.enum(['S', 'M', 'L']),
            price: z.coerce.number().min(0)
        })),
        z.record(z.enum(['S', 'M', 'L']), z.coerce.number().min(0))
    ]).refine(data => Object.keys(data).length > 0, {
        message: "Debe proporcionar al menos un tamaño con precio"
    })
  ,
    
    popular: z.boolean().optional(),
    
    // La imagen se maneja como archivo en Multer, no se incluye en el body
});

// Esquema para actualizar producto (todos los campos opcionales, pero al menos uno requerido)
export const updateProductSchema = z.object({
    name: z.string()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(100, "El nombre no puede exceder los 100 caracteres")
        .optional(),
    
    description: z.string()
        .min(10, "La descripción debe tener al menos 10 caracteres")
        .max(500, "La descripción no puede exceder los 500 caracteres")
        .optional(),
    
    category: z.string()
        .min(3, "La categoría debe tener al menos 3 caracteres")
        .max(50, "La categoría no puede exceder los 50 caracteres")
        .optional(),
    
    prices: z.array(priceItemSchema)
        .min(1, "Debe proporcionar al menos un tamaño y precio")
        .optional(),
    
    popular: z.boolean().optional()
    
}).refine(data => Object.keys(data).length > 0, {
    message: "Debe proporcionar al menos un campo para actualizar",
    path: ['general']
});

// Esquema para parámetros de URL (productId)
export const idParamSchema = z.object({
    productId: objectIdSchema
});

// Esquema para body de eliminación (contiene id)
export const removeProductSchema = z.object({
    id: objectIdSchema
});

// Esquema para respuesta de productos
export const productResponseSchema = z.object({
    success: z.boolean(),
    message: z.string().optional(),
    product: z.object({
        _id: objectIdSchema,
        name: z.string(),
        description: z.string().optional(),
        category: z.string(),
        image: z.string().url(),
        price: z.record(z.string(), z.number()),
        date: z.number(),
        sizes: z.array(z.string()),
        popular: z.boolean().optional()
    }).optional(),
    products: z.array(z.object({})).optional()
});

// Función para validar imagen
export const validateImage = z.object({
    mimetype: z.string().refine(value => 
        ['image/jpeg', 'image/png', 'image/webp'].includes(value), 
        { message: "Tipo de archivo no permitido. Solo se aceptan JPEG, PNG y WebP" }
    ),
    size: z.number().max(5 * 1024 * 1024, "La imagen no puede exceder los 5MB")
});

// Esquema para listado paginado
export const listProductSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  category: z.string().optional()
});
// Exporta todos los esquemas
export default {
    objectIdSchema,
    createProductSchema,
    updateProductSchema,
    idParamSchema,
    removeProductSchema,
    productResponseSchema,
    validateImage
};