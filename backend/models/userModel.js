import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    role: { 
        type: String, 
        enum: ['customer','moderator' ,'admin'], 
        default: 'customer'
    },
    avatar: { 
        type: String, 
        default: "" 
    },
    defaultDeliveryAddress: {
        province: { type: String, default: "La Habana" },
        municipality: { type: String, default: "" },
        municipalityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Municipality' },
        exactAddress: { type: String, default: "" }
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
      'categories:create', 'categories:read', 'categories:update', 'categories:delete',
      'dashboard:read'
    ],
    moderator: [
      'products:create', 'products:read', 'products:update', 'products:delete', 'products:view',
      'orders:create', 'orders:read', 'orders:update', 'orders:view',
      'users:create', 'users:read', 'users:update', 'users:view',
      'categories:create', 'categories:read', 'categories:update', 'categories:delete',
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