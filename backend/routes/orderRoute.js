import express from 'express'
import { allOrders, orderStatus, placeOrder, placeOrderStripe, userOrders, verifyStripe } from '../controllers/orderController.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'

const orderRouter = express.Router()

//For admin
orderRouter.post('/list',adminAuth,allOrders)
orderRouter.post('/status',adminAuth,orderStatus)
//For method payment
orderRouter.post('/place',authUser,placeOrder)
orderRouter.post('/stripe',authUser,placeOrderStripe) 
//For user
orderRouter.post('/userorders',authUser,userOrders)
orderRouter.post('/verify',authUser,verifyStripe)

export default orderRouter