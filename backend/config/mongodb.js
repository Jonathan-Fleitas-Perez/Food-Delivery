import mongoose from "mongoose";

const conectarBaseDatos = async ()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Base de datos conectada con exito");
    } catch (error) {
        console.log("Error al conectar base de datos",error.message);
    }
}

export default conectarBaseDatos;