import 'dotenv/config'
import express from "express"
import cors from "cors"
import conectarBaseDatos from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from './routes/orderRoute.js';

const app = express();
const port = process.env.process || 4000;
conectarBaseDatos(); 
connectCloudinary();

const allowedOrigins = [
  'https://food-delivery-frontend-virid.vercel.app',
  'http://localhost:3000' // Para desarrollo local
];

//middlewares
app.use(express.json());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Origen no permitido por CORS'));
    }
  },
  credentials: true // Si usas cookies o autenticación
}));

app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://tu-frontend.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).send();
});
//api endPoints
app.use('/api/user',userRouter) 
app.use('/api/product',productRouter)
app.use('/api/cart',cartRouter)
app.use('/api/order',orderRouter)

app.get('/',(req,res)=>{res.send("Api conectada");});

app.listen(port,()=> console.log("Server is running en puerto : "+ port));