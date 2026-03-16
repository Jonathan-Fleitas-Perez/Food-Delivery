import express from 'express';
import { 
  createUserByAdmin,
  getAllUsers,
  deleteUser,
  loginUser,
  updateUserByAdmin,
  registerUser,
  updateProfile,
  refreshToken,
  logoutUser,
  getProfile
} from '../controllers/userController.js';
import { authenticateUser, canCreateUsers, canDeleteUsers, canReadUsers, canUpdateUsers, checkPermission } from '../middleware/authMiddleware.js';
import upload from '../middleware/multer.js';

const UserRouter = express.Router();

// 1. Ruta pública para login
UserRouter.post('/login', loginUser);
UserRouter.post('/register',registerUser);
UserRouter.post('/refresh', refreshToken);
UserRouter.post('/logout', logoutUser);
UserRouter.get('/profile', authenticateUser, getProfile);

// Rutas específicas con permisos
UserRouter.get('/list',
  authenticateUser, 
  canReadUsers,
  getAllUsers
);



UserRouter.post('/createUser',
  authenticateUser, 
  canCreateUsers,
  createUserByAdmin
);

UserRouter.put('/:id', 
  authenticateUser,
  canUpdateUsers,
  updateUserByAdmin
);

UserRouter.delete('/:id', 
  authenticateUser,
  canDeleteUsers,
  deleteUser
);

UserRouter.put('/profile/update',
  authenticateUser,
  upload.single('image'),
  updateProfile
);

export default UserRouter;