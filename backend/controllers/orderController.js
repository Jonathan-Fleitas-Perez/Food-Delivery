import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
import Stripe from "stripe"
import { orderSchemaZod } from '../schemas/orderSchema.js';

const currency = 'pkr'
const Delivery_Charges = 10
const validateOrderData = (data) => {
  const result = orderSchemaZod.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map(err => err.message);
    return { valid: false, errors };
  }
  return { valid: true, data: result.data };
};


//const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

//Realizar el pago de la orden usando pago en efectivo
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    // Validar con Zod
    const validation = validateOrderData({ userId, items, amount, address, paymentMethod: 'COD' });
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false, 
        message: validation.errors.join(', ') 
      });
    }

    const orderData = {
      userId,
      items,
      amount,
      address,
      paymentMethod: 'COD',
      payment: false,
      date: Date.now()
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ success: true, message: 'Order Placed' });
  } catch (error) {
    console.log('Error en pago en efectivo:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Error al procesar la orden: ' + error.message 
    });
  }
};

//Realizar el pago de la orden mediante stripe
const placeOrderStripe = async(req,res)=>{
    try {
       const { userId, items, amount, address } = req.body;
     const { origin } = req.headers;

    // Validar con Zod
    const validation = validateOrderData({ userId, items, amount, address, paymentMethod: 'Stripe' });
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false, 
        message: validation.errors.join(', ') 
      });
    }

    const orderData = {
      userId,
      items,
      amount,
      address,
      paymentMethod: 'Stripe',
      payment: false,
      date: Date.now()
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

        const line_items = items.map((item)=>({
            price_data:{
                currency:currency,
                product_data:{
                    name:item.name,
                },
                unit_amount:item.price[item.size]*100*277
            },
            quantity:item.quantity
        }))

        line_items.push({
            price_data:{
                currency:currency,
                product_data:{
                    name:'Delivery_Charges',
                },
                unit_amount:Delivery_Charges*100*277
            },
            quantity:1
        })

        const session = await stripe.checkout.sessions.create({
            success_url:`${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url:`${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode:'payment'
        })

        res.json({success:true,session_url:session.url})
    } catch (error) {
        console.log('Error en pago en stripe: ',error.message)
        res.json({success:false,message:'Error a la hora de realizar el pago por Stripe:'+error.message})
    }
}

// Eliminar orden
export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const deletedOrder = await orderModel.findByIdAndDelete(orderId);
    
    if (!deletedOrder) {
      return res.status(404).json({ 
        success: false, 
        message: 'Orden no encontrada' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Orden eliminada exitosamente' 
    });
  } catch (error) {
    console.log('Error al eliminar orden:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar orden: ' + error.message 
    });
  }
};

//Verificacion de Stripe
const verifyStripe = async(req,res)=>{
    const {orderId,success,userId} = req.body

    try {
        if(success === 'true'){
            await orderModel.findByIdAndUpdate(orderId,{payment:true})
            await userModel.findByIdAndUpdate(userId,{cartData:{}})
            res.json({success:true})
        }else{
            await orderModel.findByIdAndDelete(orderId)
            res.json({success:false})
        }
    } catch (error) {
        console.log('Error en verificar en stripe: ',error.message)
        res.json({success:false,message:'Error a la hora de verificar por Stripe:'+error.message})
    }
}

//Obtener todas las ordenes mediante el panel de administrador
const allOrders = async(req,res)=>{
    try {
        const orders = await orderModel.find({})
        res.json({success:true,orders})
    } catch (error) {
        console.log('Error en obtener todas las ordenes: ',error.message)
        res.json({success:false,message:error.message})
    }
}

//Obtener las ordenes que tiene cada usuario
const userOrders = async(req,res)=>{
    try {
        const {userId} = req.body
        const orders = await orderModel.find({userId})
        res.json({success:true,orders})
    } catch (error) {
        console.log('Error al obtener las ordenes del usuario desde el backend',error.message)
        res.json({success:false,message:'Error al obtener las ordenes del usuario'+error.message})
    }
}

//Actualizar el estado de cada orden
const orderStatus = async(req,res)=>{
    try {
        const {orderId,status}= req.body
        await orderModel.findByIdAndUpdate(orderId,{status})
        res.json({success:true,message:'Status Update'})
    } catch (error) {
        console.log('Error en modificar el estado de una orden',error.message)
        res.json({success:false,message:'Error en modificar el estado de una orden'+error.message})
    }
}

export {placeOrder,placeOrderStripe,allOrders,userOrders,orderStatus,verifyStripe}