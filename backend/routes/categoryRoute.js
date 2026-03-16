import express from 'express';
import { listCategories, addCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import upload from '../middleware/multer.js';

const categoryRouter = express.Router();

// Público: listar categorías  
categoryRouter.get('/list', listCategories);

// Admin: CRUD
categoryRouter.post('/add', authenticateUser, upload.single('image'), addCategory);
categoryRouter.put('/:id', authenticateUser, upload.single('image'), updateCategory);
categoryRouter.delete('/:id', authenticateUser, deleteCategory);

export default categoryRouter;
