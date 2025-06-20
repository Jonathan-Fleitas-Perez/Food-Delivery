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
import adminAuth from "../middleware/adminAuth.js";

const productRouter = express.Router();


productRouter.post('/add', adminAuth, upload.single('image'), addProduct);
productRouter.delete('/:productId', adminAuth, removeProduct);
productRouter.put('/:productId', adminAuth, upload.single('image'), updateProduct);
productRouter.get('/list/all', listAllProducts);
productRouter.get('/list', listProduct);
productRouter.get('/:productId', singleProduct);
productRouter.get('/search', searchProducts);

export default productRouter;