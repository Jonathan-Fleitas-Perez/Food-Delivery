# 🤖 Instrucciones y Guía de Implementación para Gemini (Backend)

## 📌 Contexto del Sistema
Backend API RESTful para plataforma de Food Delivery.
**Stack Tecnológico:** Node.js, Express, MongoDB (Mongoose), JWT para Auth, Zod para schemas, Stripe (pagos), Cloudinary (archivos).

---

## 🗄 Estructura de Base de Datos
- **Usuarios (`userModel.js`):** Gestiona clientes, managers y admins. Controla roles y array de permisos dinámicos. Contiene historial de carrito (`cartData`).
- **Productos (`productModel.js`):** Catálogo de comida.
- **Pedidos (`orderModel.js`):** Rastrea la pasarela de pagos, estado del pedido (Food Processing, Out for delivery, Delivered) y dirección del cliente.

**Rutas Base:**
- `GET/POST /api/user/*`
- `GET/POST /api/product/*`
- `GET/POST /api/cart/*`
- `GET/POST /api/order/*`
- `GET/POST /api/dashboard/*`

---

## 🛠 Problemas Actuales y Mejoras Necesarias

### 1. Acoplamiento Fuerte en Controladores
**El Problema:** El código de la base de datos (Mongoose) vive directamente dentro del controlador. Si cambiamos la base de datos o necesitamos testear la lógica de negocio de manera unitaria (sin DB), es un dolor de cabeza.
**La Solución:** Refactorizar hacia una arquitectura en capas.
- `Rutas` -> Delegan al `Controlador`
- `Controlador` -> Procesa req/res y llama al `Servicio`
- `Servicio` -> Contiene la lógica profunda y hace las llamadas a BD.

### 2. Responsabilidades Mezcladas en `server.js`
**El Problema:** La inicialización del admin está hardcodeada dentro de la función `startServer()`.
**La Solución:** Remover `createInitialAdmin` de `server.js`. Crear una carpeta `scripts/` y hacer un script ejecutable CLI (`node scripts/seedAdmin.js`).

### 3. Código Repetitivo (DRY)
**El Problema:** Se ven validaciones recurrentes de comprobación de existencia antes de insertar.
**La Solución:** Optimizar las consultas usando métodos de Mongoose como `findOneAndUpdate` con opción `upsert` donde sea aplicable, para ahorrar llamadas de red a MongoDB.

### 4. Caché Inexistente
**El Problema:** El endpoint de `/api/dashboard` y listar productos hace queries pesadas directas a BD en cada recarga.
**La Solución:** Implementar Redis o memoria en caché (node-cache) temporal para estadísticas del dashboard y lista pública de productos, invalidando el caché cuando se crea un pedido o producto nuevo.

---

## 🎯 Instrucciones de Actuación para la IA
Como Gemini, tu objetivo al modificar este backend es:
1. **Aislar la complejidad:** Mueve el código Mongoose fuera de las rutas/controladores siempre que puedas.
2. **Robustez ante fallos:** Asegúrate de que las APIs de terceros (Stripe, Cloudinary) tengan un fallback o envuelvan sus llamadas en bloques robustos de retry/catch.
3. **Optimización de Consultas:** Sugiere usar `.lean()` en Mongoose al buscar listas grandes donde no se editen documentos, para mejorar el rendimiento de lectura.
