import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    role: { 
        type: String, 
        enum: ['customer','manager' ,'admin'], 
        default: 'customer'
    },
    lastLogin: { type: Date },
    createdAt: { 
      type: Date, 
      default: Date.now 
    }
}, { minimize: false });

userSchema.statics.getRolePermissions = function() {
  return {
    admin: [
      'products:create', 'products:read', 'products:update', 'products:delete','products:view',
      'orders:create', 'orders:read', 'orders:update', 'orders:delete','orders:view',
      'users:create', 'users:read', 'users:update', 'users:delete','users:view',
      'dashboard:read'
    ],
    manager: [
      'products:create', 'products:read', 'products:update','products:view',
      'orders:create', 'orders:view', 'orders:update','orders:read',
      'users:read','users:view',
      'dashboard:read'
    ],
    customer: [
      'orders:create','orders:read',
      'products:read','products:view'
    ]
  };
};

const userModel = mongoose.models.Usuarios || mongoose.model('Usuarios', userSchema);
export default userModel;