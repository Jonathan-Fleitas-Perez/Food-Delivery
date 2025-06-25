import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const dashboardRouter = express.Router();

dashboardRouter.get('/stats', authenticateUser, getDashboardStats);

export default dashboardRouter;