import userModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"


//Crear token
const createToken = (id)=> jwt.sign({id},process.env.JWT_SECRET);


//Ruta de registro de usuario
const registerUser = async(req,res)=>{
   try {
    const {name,email,password} = req.body;
    const exist = await userModel.findOne({email}); //para vereficar si el usuario existe o no

    //validaciones para verificar datos de usuario
    if(exist) return res.json({success:false , message:"El usuario ya existe"});
    if(!validator.isEmail(email)) return res.json({success:false , message:"Email invalido , por favor introduzca un email valido"});
    if(password.length < 8) return res.json({success:false , message:"Por favor introduzca una contraseña mas fuerte con mas de 8 caracteres"});

    //hashing la contraseña del usuario
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);

    //Crear el usuario despues de validadas las propiedades
    const newUser = new userModel({
        name,
        email,
        password:hashedPassword
    });

    const user = await newUser.save();
    const token = createToken(user._id);
    res.json({success:true,token});

   } catch (error) {
    console.log(error);
    res.json({success:false,message:error.message});
   }
}

//Ruta de login de usuario
const loginUser = async(req,res)=>{
    try {
    
        const {email,password} = req.body;
        const user = await userModel.findOne({email});

        if(!user) return res.json({success:false , message:"El usuario no existe"});
        const isValidPassword = await bcrypt.compare(password,user.password);


        if(isValidPassword){
             const token = createToken(user._id);
             res.json({success:true,token});
        }else
             res.json({success:false , message:"Credenciales incorrectas"});
    
   
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message});
    }
}


//Ruta de login de administrador
const adminLogin = async (req,res) => {
    try {
        const {email,password}=req.body      
        if(email === process.env.ADMIN_EMAIL && process.env.ADMIN_PASS === password){
            const token = jwt.sign(email+password,process.env.JWT_SECRET)
            res.json({success:true,token})
        }else{
            res.json({success:false,message:"Credenciales incorrectas"})
        }

    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message});
    }
}

export {registerUser,loginUser,adminLogin};