import orderModel from '../models/orderModel.js';
import productModel from '../models/productModel.js';
import userModel from '../models/userModel.js';

export const getDashboardStats = async (req, res) => {
  try {
    // Estadísticas de órdenes
    const ordersStats = await orderModel.aggregate([
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

    // Órdenes por estado
    const ordersByStatus = await orderModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Métodos de pago
    const paymentMethods = await orderModel.aggregate([
      { $group: { _id: "$paymentMethod", count: { $sum: 1 } } }
    ]);

    // Ventas por categoría de producto
    const salesByCategory = await orderModel.aggregate([
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
          count: { $sum: "$items.quantity" }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);

    // Productos más vendidos
    const topProducts = await orderModel.aggregate([
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

    // Usuarios con más compras
    const topCustomers = await orderModel.aggregate([
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
          from: "usuarios",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: "$user.name",
          email: "$user.email",
          totalOrders: 1,
          totalSpent: 1
        }
      }
    ]);

    // Tendencias de ventas (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const salesTrend = await orderModel.aggregate([
      { $match: { date: { $gte: thirtyDaysAgo.getTime() } } },
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