import orderModel from '../models/orderModel.js';
import productModel from '../models/productModel.js';
import userModel from '../models/userModel.js';

export const getDashboardStats = async (req, res) => {
  try {
    const range = req.query.range || '30days';
    let daysToSubtract = 30;
    if (range === '1day') daysToSubtract = 1;
    else if (range === '7days') daysToSubtract = 7;
    else if (range === '90days') daysToSubtract = 90;
    
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0); // Inicio del día actual
    if (range !== '1day') {
      startDate.setDate(startDate.getDate() - daysToSubtract);
    }
    const startTime = startDate.getTime();

    const dateMatch = { date: { $gte: startTime } };

    // Estadísticas de órdenes (Filtrado)
    const ordersStats = await orderModel.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$amount" },
          avgOrderValue: { $avg: "$amount" },
          minOrder: { $min: "$amount" },
          maxOrder: { $max: "$amount" }
        }
      }
    ]);

    // Órdenes por estado (Filtrado)
    const ordersByStatus = await orderModel.aggregate([
      { $match: dateMatch },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Métodos de pago (Filtrado)
    const paymentMethods = await orderModel.aggregate([
      { $match: dateMatch },
      { $group: { _id: "$paymentMethod", count: { $sum: 1 } } }
    ]);

    // Ventas por categoría de producto (Filtrado)
    const salesByCategory = await orderModel.aggregate([
      { $match: dateMatch },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.name",
          foreignField: "name",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.category",
          totalSales: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", { $ifNull: ["$items.price", 0] }] } },
          count: { $sum: "$items.quantity" }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);

    // Productos más vendidos (Filtrado)
    const topProducts = await orderModel.aggregate([
      { $match: dateMatch },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    // Usuarios con más compras (Filtrado)
    const topCustomers = await orderModel.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: "$userId",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$amount" }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "usuarios", // Ajustar según el nombre real de la colección si es necesario
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: { $ifNull: ["$user.name", "Usuario Desconocido"] },
          email: { $ifNull: ["$user.email", "N/A"] },
          totalOrders: 1,
          totalSpent: 1
        }
      }
    ]);

    // Tendencias de ventas
    const salesTrend = await orderModel.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$date" } } },
          totalSales: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Resumen de datos
    const stats = {
      orders: ordersStats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
        minOrder: 0,
        maxOrder: 0
      },
      ordersByStatus: ordersByStatus.map(item => ({
        status: item._id,
        count: item.count
      })),
      paymentMethods: paymentMethods.map(item => ({
        method: item._id,
        count: item.count
      })),
      salesByCategory,
      topProducts,
      topCustomers,
      salesTrend
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};