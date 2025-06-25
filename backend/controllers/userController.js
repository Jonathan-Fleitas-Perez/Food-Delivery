// userController.js
import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from 'mongoose';
import { 
  userRegisterSchema, 
  userLoginSchema, 
  userCreateByAdminSchema, 
  userUpdateRoleSchema,
  userIdParamSchema,
  userUpdateByAdminSchema
} from '../schemas/userSchema.js';

// Middleware de validación
export const validateSchema = (schema) => async (req, res, next) => {
  try {
    const dataToValidate = {
      ...req.body,
      ...req.params,
      ...req.query
    };

    const parsedData = await schema.safeParseAsync(dataToValidate);
    
    if (!parsedData.success) {
      const errors = parsedData.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: "Error de validación",
        errors
      });
    }
    
    req.validatedData = parsedData.data;
    next();
  } catch (error) {
    console.error('Error en middleware de validación:', error);
    res.status(500).json({
      success: false,
      message: "Error interno de validación"
    });
  }
};

// Manejador de operaciones de base de datos
const handleDBOperation = (operation) => async (req, res) => {
    try {
        const result = await operation(req);
        res.json(result);
    } catch (error) {
        console.error('Error en operación DB:', error);
        
        if (error instanceof mongoose.Error.ValidationError) {
            const errors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            
            return res.status(400).json({
                success: false,
                message: 'Error de validación de datos',
                errors
            });
        }
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: `El email '${error.keyValue.email}' ya está registrado`
            });
        }
        
        res.status(500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

// Función para crear token con permisos
const createToken = (user) => {
  // Obtener permisos basados en rol
  const rolePermissions = userModel.schema.statics.getRolePermissions();
  console.log(rolePermissions)
  const userPermissions = rolePermissions[user.role] || [];
  console.log(userPermissions)
  
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      permissions:userPermissions
    }, 
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// Registro de usuario
const registerUser = [
  validateSchema(userRegisterSchema),
  handleDBOperation(async (req) => {
    const { name, email, password } = req.validatedData;
    
    // Verificar si el usuario ya existe
    const exist = await userModel.findOne({ email });
    if (exist) {
      throw new Error('El usuario ya existe');
    }

    // Hashing de contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      role: 'customer'
    });

    const user = await newUser.save();
    const token = createToken(user);
    
    return { 
      success: true, 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: userModel.schema.statics.getRolePermissions(user.role)
      }
    };
  })
];

// Login de usuario
const loginUser = [
  validateSchema(userLoginSchema),
  handleDBOperation(async (req) => {
    const { email, password } = req.validatedData;
    const user = await userModel.findOne({ email });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new Error('Credenciales incorrectas');
    }

    // Actualizar último login
    await userModel.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    const token = createToken(user);
    
    return { 
      success: true, 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: userModel.schema.statics.getRolePermissions(user.role)
      }
    };
  })
];

// Crear usuario (solo admin)
const createUserByAdmin = [
  validateSchema(userCreateByAdminSchema),
  handleDBOperation(async (req) => {
    const { name, email, password, role } = req.validatedData;

    // Verificar si el usuario ya existe
    const exist = await userModel.findOne({ email });
    if (exist) {
      throw new Error('El usuario ya existe');
    }

    // Hashing de contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear nuevo usuario
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      role,
      permissions: userModel.schema.statics.getRolePermissions(role)
    });

    const user = await newUser.save();
    
    return {
      success: true, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    };
  })
];

// Obtener todos los usuarios (solo admin)
const getAllUsers = handleDBOperation(async () => {
  // Excluir campos sensibles
  const users = await userModel.find({}).select('-password -__v');
  return { success: true, users };
});

// Actualizar rol y permisos de usuario (solo admin)
const updateUserRole = [
  validateSchema(userIdParamSchema),
  validateSchema(userUpdateRoleSchema),
  handleDBOperation(async (req) => {
    const { id } = req.validatedData; // Del esquema de parámetros
    const { role } = req.validatedData; // Del esquema del body

    // No permitir cambiar el propio rol
    if (req.user.id === id) {
      throw new Error('No puedes cambiar tu propio rol');
    }

    // Obtener permisos para el nuevo rol
    const permissions = userModel.getRolePermissions(role);
    
    const user = await userModel.findByIdAndUpdate(
      id, 
      { role, permissions },
      { new: true, select: '-password -__v' }
    );

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return { 
      success: true, 
      user,
      message: 'Rol y permisos actualizados exitosamente'
    };
  })
];

// Eliminar usuario (solo admin)
const deleteUser = [
  validateSchema(userIdParamSchema),
  handleDBOperation(async (req) => {
    const { id } = req.validatedData;

    // No permitir eliminarse a sí mismo
    if (req.user.id === id) {
      throw new Error('No puedes eliminar tu propia cuenta');
    }

    const user = await userModel.findByIdAndDelete(id);

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return { 
      success: true, 
      message: 'Usuario eliminado correctamente' 
    };
  })
];

// Obtener usuario actual
const getCurrentUser = handleDBOperation(async (req) => {
  const user = await userModel.findById(req.validatedData.id).select('-password -__v');
  
  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  
  return { 
    success: true, 
    user: {
      ...user.toObject(),
      permissions: user.permissions || []
    }
  };
});

// Actualizar perfil de usuario
const updateUserByAdmin = 
  handleDBOperation(async (req) => {
    const { id ,updateData} = req.body; 

    // No permitir cambiar el propio rol
    if (req.user.id === id) {
      throw new Error('No puedes modificar tu propio usuario');
    }

    // Si se actualiza la contraseña, hashearla
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    // Si se actualiza el rol, actualizar los permisos
    if (updateData.role) {
      updateData.permissions = userModel.schema.statics.getRolePermissions(updateData.role);
    }

    const user = await userModel.findByIdAndUpdate(
      id, 
      updateData,
      { new: true, select: '-password -__v' }
    );

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return { 
      success: true, 
      user,
      message: 'Usuario actualizado exitosamente'
    };
  })


export { 
  registerUser, 
  loginUser, 
  createUserByAdmin, 
  deleteUser, 
  getAllUsers, 
  updateUserRole,
  getCurrentUser,
  updateUserByAdmin
};