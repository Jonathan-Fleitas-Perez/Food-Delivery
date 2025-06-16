import {v2 as cloudinary} from "cloudinary"
import productModel from '../models/productModel.js'

//Funcion para agregar productos
const addProduct = async (req,res)=>{
    try {   
        const {name,description, category,prices,popular} =req.body
        const image = req.file
        const imageURL = await cloudinary.uploader.upload(image.path,{resource_type:'image'}).then(res=> res.secure_url)

        const parsedPrice = JSON.parse(prices)
        const price = parsedPrice.reduce((acc,curr)=>{
            acc[curr.size]=Number(curr.price)
            return acc
        },{})

        const sizes = parsedPrice.map((item)=>item.size)
        const productData = {
            name,
            description,
            category,
            price,
            popular:popular ==='true',
            sizes,
            image:imageURL,
            date:Date.now()
        }

        console.log('Product data:',productData)
        const product = new productModel(productData)
        await product.save()
        res.json({success:true,message:'Food Added',product})
    } catch (error) {
        console.log('Error en add product: '+error)
        res.status(500).json({success:false,message:error.message||'Error en el servidor'})
    }
}

//Validar los productos

//Funcion para eliminar productos
const removeProduct = async (req,res)=>{
    try {
        const {id} = req.body
        await productModel.findByIdAndDelete({id})
        res.json({success:true,message:'Food Removed'})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//Funcion para obtener la informacion de un producto especifico
const singleProduct = async (req,res)=>{
    try {
        const {productId} = req.body
        const product = await productModel.findById(productId)
        res.json({success:true,product})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//Funcion para obtener la lista de todos los productos
const listProduct = async (req,res)=>{
    try {
        const products = await productModel.find({})
        res.json({success:true,products})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

export {addProduct,listProduct,removeProduct,singleProduct}