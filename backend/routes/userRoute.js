import express from 'express';
import { 
  createUserByAdmin,
  getAllUsers,
  deleteUser,
  loginUser,
  updateUserByAdmin,
  registerUser
} from '../controllers/userController.js';
import { authenticateUser, canCreateUsers, canDeleteUsers, canReadUsers, canUpdateUsers, checkPermission } from '../middleware/authMiddleware.js';

const UserRouter = express.Router();

// 1. Ruta pública para login
UserRouter.post('/login', loginUser);
UserRouter.post('/register',registerUser)

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

export default UserRouter;