import mongoose from "mongoose";

const conectarBaseDatos = async ()=>{
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI,{
            serverSelectionTimeoutMS:100000,
            socketTimeoutMS:1000000,
            connectTimeoutMS:1000000,
            maxConnecting:20,
            wtimeoutMS:45000
        });
        
        console.log("Base de datos conectada con exito");
    } catch (error) {
        console.log("Error al conectar base de datos",error.message);
    }
}

export default conectarBaseDatos;