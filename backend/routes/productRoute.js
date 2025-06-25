import express from "express";
import { 
  addProduct, 
  listProduct, 
  removeProduct, 
  searchProducts, 
  singleProduct, 
  updateProduct,
  listAllProducts  
} from "../controllers/productController.js";
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

// Listado público para el frontend
productRouter.get('/list/all', listAllProducts);

// Listado para panel admin (requiere permiso de lectura)
productRouter.get('/list',  listProduct);

productRouter.get('/:productId', singleProduct);
productRouter.get('/search', searchProducts);

export default productRouter;