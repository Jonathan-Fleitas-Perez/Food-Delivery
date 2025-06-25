import mongoose from 'mongoose';
import orderModel from './models/orderModel.js';
import productModel from './models/productModel.js'; // Importar el modelo de producto
import dotenv from 'dotenv';

dotenv.config();

const migrateOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado a MongoDB");
    
    // Cargar todos los productos en un mapa para búsqueda rápida
    const products = await productModel.find({});
    const productMap = new Map();
    products.forEach(product => {
      productMap.set(product.name.toLowerCase(), product);
    });
    
    const orders = await orderModel.find({});
    let updatedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const order of orders) {
      const updatedItems = [];
      let hasErrors = false;

      for (const item of order.items) {
        try {
          let priceValue = item.price;
          
          // Caso 1: El precio ya es un número
          if (typeof priceValue === 'number') {
            updatedItems.push({
              ...item.toObject(),
              price: priceValue
            });
            continue;
          }
          
          // Caso 2: El precio es un objeto (formato antiguo)
          if (typeof priceValue === 'object') {
            // Intentar obtener precio por tamaño
            if (item.size && priceValue[item.size]) {
              priceValue = priceValue[item.size];
            } 
            // Usar el primer precio disponible
            else {
              const sizes = Object.keys(priceValue);
              if (sizes.length > 0) {
                priceValue = priceValue[sizes[0]];
              }
            }
          }
          
          // Caso 3: Precio indefinido - buscar en productos
          if (priceValue === undefined || priceValue === null) {
            const productName = item.name.toLowerCase();
            const product = productMap.get(productName);
            
            if (product) {
              // Intentar obtener precio por tamaño
              if (item.size && product.price[item.size]) {
                priceValue = product.price[item.size];
              } 
              // Usar el primer precio disponible del producto
              else {
                const sizes = Object.keys(product.price);
                if (sizes.length > 0) {
                  priceValue = product.price[sizes[0]];
                }
              }
            }
          }
          
          // Validación final del precio
          if (priceValue === undefined || priceValue === null) {
            throw new Error(`Precio no encontrado para '${item.name}'`);
          }
          
          const numericPrice = Number(priceValue);
          if (isNaN(numericPrice)) {
            throw new Error(`Precio no válido: ${priceValue}`);
          }
          
          updatedItems.push({
            ...item.toObject(),
            price: numericPrice
          });
          
        } catch (error) {
          console.error(`❌ Error en orden ${order._id}, ítem '${item.name}': ${error.message}`);
          
          // Conservar el ítem original pero marcando el error
          updatedItems.push({
            ...item.toObject(),
            price: 0, // Establecer un valor por defecto
            migrationError: error.message
          });
          
          hasErrors = true;
          errorCount++;
        }
      }

      try {
        await orderModel.updateOne(
          { _id: order._id },
          { $set: { items: updatedItems } }
        );
        updatedCount++;
        
        if (hasErrors) {
          console.log(`⚠️ Orden actualizada con errores: ${order._id}`);
        } else {
          console.log(`🔄 Orden actualizada correctamente: ${order._id}`);
        }
      } catch (updateError) {
        console.error(`❌ Error al actualizar orden ${order._id}: ${updateError.message}`);
        skippedCount++;
      }
    }

    console.log("\n✅ Resumen de migración:");
    console.log(`- Órdenes actualizadas: ${updatedCount}`);
    console.log(`- Ítems con errores: ${errorCount}`);
    console.log(`- Órdenes omitidas: ${skippedCount}`);
    console.log(`- Total de órdenes procesadas: ${orders.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fatal en la migración:', error);
    process.exit(1);
  }
};

migrateOrders();