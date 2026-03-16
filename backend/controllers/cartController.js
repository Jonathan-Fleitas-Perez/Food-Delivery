import userModel from "../models/userModel.js"

//Funcion para agregar al carrito
const addToCart = async(req,res)=>{
    try {
        const {userId,itemId} = req.body
        const userData = await userModel.findById(userId)
        let cartData = userData.cartData || {}

        if(cartData[itemId]){
            cartData[itemId] += 1
        }else{
            cartData[itemId] = 1
        }

        await userModel.findByIdAndUpdate(userId,{cartData})
        res.json({success:true,message:'Agregado al carrito'})

    } catch (error) {
        console.log(error.message)
        res.json({success:false,message:error.message})
    }
}

//Funcion para modificar el carrito
const updateCart = async(req,res)=>{
    try {
        const {userId,itemId,quantity} = req.body
        const userData = await userModel.findById(userId)
        let cartData = userData.cartData || {}

        if (quantity > 0) {
            cartData[itemId] = quantity
        } else {
            delete cartData[itemId]
        }
        
        await userModel.findByIdAndUpdate(userId,{cartData})
        res.json({success:true,message:'Carrito actualizado'})

    } catch (error) {
        console.log(error.message)
        res.json({success:false,message:error.message})
    }
}

//Funcion para obtener los productos del usuario del carrito
const getUserCart = async(req,res)=>{
    try {
        const {userId} = req.body
        const userData = await userModel.findById(userId)
        const cartData = userData.cartData || {}

        res.json({success:true,cartData})
    } catch (error) {
        console.log(error.message)
        res.json({success:false,message:error.message})
    }
}

export {addToCart,updateCart,getUserCart}