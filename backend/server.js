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


//middlewares
app.use(express.json());
app.use(cors());

//api endPoints
app.use('/api/user',userRouter) 
app.use('/api/product',productRouter)
app.use('/api/cart',cartRouter)
app.use('/api/order',orderRouter)

app.get('/',(req,res)=>{res.send("Api conectada");});

app.listen(port,()=> console.log("Server is running en puerto : "+ port));