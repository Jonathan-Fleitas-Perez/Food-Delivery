// userController.js
import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
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
        const result = await operation(req, res);
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
  const userPermissions = rolePermissions[user.role] || [];
  
  const accessToken = jwt.sign(
    { 
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      avatar: user.avatar,
      permissions: userPermissions
    }, 
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // Token de acceso de corta duración
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '30d' } // Token de refresco de larga duración (1 mes)
  );

  return { accessToken, refreshToken };
};

// Función para establecer cookies seguras
const setAuthCookies = (res, tokens) => {
  const { accessToken, refreshToken } = tokens;
  
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 días para la de refresco
  };

  res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 }); // 15 min
  res.cookie('refreshToken', refreshToken, cookieOptions);
};

// Registro de usuario
const registerUser = [
  validateSchema(userRegisterSchema),
  handleDBOperation(async (req, res) => {
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
    const tokens = createToken(user);
    setAuthCookies(res, tokens);
    
    return { 
      success: true, 
      token: tokens.accessToken, // Mantener compatibilidad temporal
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
  handleDBOperation(async (req, res) => {
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
    const tokens = createToken(user);
    setAuthCookies(res, tokens);
    
    return { 
      success: true, 
      token: tokens.accessToken, // Mantener compatibilidad temporal
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
  handleDBOperation(async (req, res) => {
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
const getCurrentUser = handleDBOperation(async (req, res) => {
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
  handleDBOperation(async (req, res) => {
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

// Actualizar perfil de usuario (cliente o cualquier rol)
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Viene del authMiddleware (decoded JWT)
    const { name, password, address } = req.body;
    const imageFile = req.file;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    const updateData = {};
    if (name) updateData.name = name;

    if (password) {
      if(password.length < 8) {
         return res.json({ success: false, message: "La contraseña debe tener al menos 8 caracteres" })
      }
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    if (address) {
      try {
        const parsedAddress = typeof address === 'string' ? JSON.parse(address) : address;
        updateData.defaultDeliveryAddress = parsedAddress;
      } catch (e) {
        return res.status(400).json({ success: false, message: "Hubo un error al procesar la dirección" });
      }
    }

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
      updateData.avatar = imageUpload.secure_url;
    }

    await userModel.findByIdAndUpdate(userId, updateData);
    
    // Devolver el usuario actualizado pero sin la password
    const updatedUser = await userModel.findById(userId).select('-password');

    res.json({ success: true, message: "Perfil actualizado exitosamente", user: updatedUser });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Refrescar token
const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "Token de refresco no encontrado" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: "Usuario no encontrado" });
    }

    const tokens = createToken(user);
    setAuthCookies(res, tokens);

    res.json({ 
      success: true, 
      token: tokens.accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: userModel.schema.statics.getRolePermissions(user.role)
      }
    });
  } catch (error) {
    console.error('Error al refrescar token:', error);
    res.status(401).json({ success: false, message: "Token de refresco inválido o expirado" });
  }
};

// Cerrar sesión (limpiar cookies)
const logoutUser = (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ success: true, message: "Sesión cerrada exitosamente" });
};

export { 
  registerUser, 
  loginUser, 
  createUserByAdmin, 
  deleteUser, 
  getAllUsers, 
  updateUserRole,
  getCurrentUser,
  updateUserByAdmin,
  updateProfile,
  refreshToken,
  logoutUser
};