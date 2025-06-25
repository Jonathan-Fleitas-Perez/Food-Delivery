// schemas/userSchema.js
import { z } from 'zod';
import mongoose from 'mongoose';

// Validación para ObjectId de MongoDB
export const objectIdSchema = z.string().refine(value => {
    return /^[0-9a-fA-F]{24}$/.test(value);
}, {
    message: "ID inválido (debe ser un ObjectId de 24 caracteres hexadecimales)"
});

export const userRegisterSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
});

export const userLoginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(1, { message: "La contraseña es requerida" })
});

export const userCreateByAdminSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres" }),
  role: z.enum(['customer', 'manager', 'admin'], {
    message: "Rol inválido. Debe ser customer, manager o admin"
  })
});

export const userUpdateRoleSchema = z.object({
  role: z.enum(['customer', 'manager', 'admin'], {
    message: "Rol inválido. Debe ser customer, manager o admin"
  })
});

export const userUpdateByAdminSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }).optional(),
  email: z.string().email({ message: "Email inválido" }).optional(),
  password: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres" }).optional(),
  role: z.enum(['customer', 'manager', 'admin'], {
    message: "Rol inválido. Debe ser customer, manager o admin"
  }).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "Debe proporcionar al menos un campo para actualizar"
});

export const userIdParamSchema = z.object({
  id: objectIdSchema
});

export const userProfileSchema = userRegisterSchema.partial();