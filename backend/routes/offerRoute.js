import express from "express";
import offerController from "../controllers/offerController.js";
import upload from "../middleware/multer.js";
import { authenticateUser, checkPermission } from "../middleware/authMiddleware.js";

const offerRouter = express.Router();

// Ruta pública para el frontend
offerRouter.get('/list', offerController.getOffers);

// Rutas protegidas para administración
offerRouter.post('/add', 
    authenticateUser, 
    checkPermission('products', 'create'), // Usamos permisos de productos por simplicidad o podríamos crear nuevos
    upload.single('image'), 
    offerController.addOffer
);

offerRouter.get('/admin/list', 
    authenticateUser, 
    checkPermission('products', 'read'), 
    offerController.listAllOffers
);

offerRouter.delete('/:id', 
    authenticateUser, 
    checkPermission('products', 'delete'), 
    offerController.removeOffer
);

offerRouter.put('/:id/toggle', 
    authenticateUser, 
    checkPermission('products', 'update'), 
    offerController.toggleOfferStatus
);

export default offerRouter;
