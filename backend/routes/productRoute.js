import express from "express";
import productController from "../controllers/productController.js";
const {
  addProduct,
  listProduct,
  removeProduct,
  searchProducts,
  singleProduct,
  updateProduct,
  listAllProducts,
  rateProduct,
  totalReviewsCount
} = productController;
import upload from "../middleware/multer.js";
import {
  authenticateUser,
  canCreateProducts,
  canReadProducts,
  canUpdateProducts,
  canDeleteProducts
} from "../middleware/authMiddleware.js";

const productRouter = express.Router();

// Protección de rutas con permisos específicos
productRouter.post('/add', 
  authenticateUser, 
  canCreateProducts, 
  upload.single('image'), 
  addProduct
);

productRouter.delete('/:productId', 
  authenticateUser, 
  canDeleteProducts, 
  removeProduct
);

productRouter.put('/:productId', 
  authenticateUser, 
  canUpdateProducts, 
  upload.single('image'), 
  updateProduct
);

// Ruta pública: total de reseñas
productRouter.get('/reviews/count', totalReviewsCount);

// Listado público para el frontend
productRouter.get('/list/all', listAllProducts);

// Listado para panel admin (requiere permiso de lectura)
productRouter.get('/list',  listProduct);

productRouter.get('/:productId', singleProduct);
productRouter.get('/search', searchProducts);

// Ruta para calificar (requiere auth)
productRouter.post('/:productId/rate', authenticateUser, rateProduct);

export default productRouter;