import express from 'express';
import { getMunicipalities, addMunicipality, updateMunicipality, deleteMunicipality } from '../controllers/municipalityController.js';
import { authenticateUser, checkPermission } from '../middleware/authMiddleware.js';
import adminAuth from '../middleware/adminAuth.js';

const MunicipalityRouter = express.Router();

// Public route to get all regions
MunicipalityRouter.get('/list', getMunicipalities);

// Admin / Manager routes
MunicipalityRouter.post('/add', authenticateUser, addMunicipality); // Reusing users:create or a new permission if strictly needed, using existing
MunicipalityRouter.put('/:id', authenticateUser, updateMunicipality);
MunicipalityRouter.delete('/:id', authenticateUser, deleteMunicipality);

export default MunicipalityRouter;
