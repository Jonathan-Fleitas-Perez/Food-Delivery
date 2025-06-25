import 'dotenv/config'
import express from "express"
import cors from "cors"
import conectarBaseDatos from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from './routes/orderRoute.js';
import dashboardRouter from './routes/dashboardRoute.js';
import userModel from './models/userModel.js';
import bcrypt from 'bcrypt';

const app = express();
const port = process.env.PORT || 4000; // Cambié process.env.process por process.env.PORT

const allowedOrigins = [
  'https://food-delivery-frontend-virid.vercel.app',
  'https://food-delivery-ruby-alpha.vercel.app',
  'http://localhost:5173', // Para desarrollo local
  'http://localhost:5174'
];

app.use((err, req, res, next) => {
  console.error('Error global:', err);
  
  // Manejo específico para errores CORS
  if (err.message.includes('CORS')) {
    return res.status(403).json({ error: err.message });
  }
  
  res.status(500).json({ error: 'Error interno del servidor' });
});

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  next();
});

app.use((req, res, next) => {
  req.url = req.url.replace(/\/{2,}/g, '/');
  next();
});
// Middlewares
app.use(express.json());
app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

// API endpoints
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/dashboard', dashboardRouter);

app.get('/', (req, res) => {
  res.send("Api conectada");
});

// Función para crear el administrador inicial
const createInitialAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    // Verificar que las variables de entorno estén configuradas
    if (!adminEmail || !adminPassword) {
      console.warn('ADMIN_EMAIL o ADMIN_PASSWORD no configurados en .env. No se creará usuario administrador.');
      return;
    }
    
    // Verificar si ya existe un administrador
    const existingAdmin = await userModel.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log(`✅ Usuario administrador ya existe: ${adminEmail}`);
      return;
    }
    
    // Crear el nuevo administrador
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    
    const adminUser = new userModel({
      name: 'Administrador1',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin'
    });
    
    await adminUser.save();
    console.log(`✅ Usuario administrador creado: ${adminEmail}`);
  } catch (error) {
    console.error('❌ Error al crear el usuario administrador inicial:', error);
  }
};

// Conectar a la base de datos y luego crear el admin
const startServer = async () => {
  try {
    // Conectar a MongoDB
    await conectarBaseDatos();
    
    // Conectar a Cloudinary
    await connectCloudinary();
    
    // Crear administrador inicial
    await createInitialAdmin();
    
    // Iniciar servidor
    app.listen(port, () => console.log(`🚀 Servidor funcionando en puerto: ${port}`));
  } catch (error) {
    console.error('❌ Error al iniciar la aplicación:', error);
    process.exit(1); // Salir del proceso con error
  }
};

// Iniciar todo el sistema
startServer();