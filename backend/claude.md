# 🤖 Instrucciones y Guía de Implementación para Claude (Backend)

## 📌 Contexto del Proyecto
Este es el backend de un sistema de Food Delivery. 
**Tecnologías:** Node.js, Express, MongoDB (Mongoose), JWT, Zod (validaciones), bcrypt, Cloudinary, Stripe.
**Arquitectura Actual:** MVC (Routes -> Controllers -> Models), con Middlewares para validación de schemas con Zod y Auth.

---

## 🏗 Arquitectura y Base de Datos

### 📦 Colecciones / Modelos principales:
1. **User (Usuarios):** `name`, `email`, `password`, `cartData`, `role` (customer, manager, admin), `lastLogin`, `createdAt`.
2. **Product (Productos):** `name`, `description`, `price`, `image` (Cloudinary URL), `category`, `subCategory`.
3. **Order (Pedidos):** `userId`, `items`, `amount`, `address`, `status`, `paymentMethod`, `payment`, `date`.

### 🔌 Endpoints Principales:
- `/api/user` : Registro, Login, Gestión de usuarios (CRUD roles admin).
- `/api/product` : CRUD de productos con subida de imágenes a Cloudinary.
- `/api/cart` : Gestión del carrito del usuario (añadir, remover, obtener).
- `/api/order` : Creación de pedidos, verificación de pagos con Stripe, actualización de estado.
- `/api/dashboard` : Estadísticas generales para el panel de administración.

---

## 🚨 Malas Prácticas Detectadas y Cómo Arreglarlas

1. **Lógica de Dominio en `server.js`:**
   - *Problema:* Existe una función `createInitialAdmin` dentro del archivo principal del servidor que se ejecuta en cada inicio.
   - *Solución:* Mover esta lógica a un script de *seeding* o migración independiente (ej. `npm run seed:admin`) para no sobrecargar el arranque de la API.

2. **Controladores Sobrecargados (Falta de Patrón Service):**
   - *Problema:* Archivos como `userController.js` (9KB), `productController.js` (12KB) mezclan extracción de `req`, validación, consultas directas de Mongoose, y respuestas HTTP.
   - *Solución:* Implementar el patrón **Controller-Service-Repository**. Los Controladores solo deben manejar las peticiones HTTP y llamar a Servicios. Los Servicios deben contener toda la lógica de negocio pura y acceder a los Modelos. 

3. **Manejo de Errores Genérico y Filtración de Detalles DB:**
   - *Problema:* El helper `handleDBOperation` es bueno para DRY, pero a veces devuelve errores exactos de Mongoose (`error.message`) exponiendo detalles internos.
   - *Solución:* Crear una clase `AppError` personalizada (ej. `new AppError('No encontrado', 404)`) y usar un middleware global de errores estandarizado para limpiar los mensajes hacia el cliente en base al entorno de producción o desarrollo.

4. **Archivos de Controladores Masivos:**
   - *Problema:* Muchos endpoints en el mismo controlador (10+ exportaciones en pedidos y productos).
   - *Solución:* Dividir en pequeños controladores enfocados por recurso o acción, o adoptar Clean Architecture.

---

## 🛠 Directivas de Implementación para Claude
- **Patrones de Diseño a Usar:** Service Pattern, Factory para instancias, DTOs (Data Transfer Objects) para limpiar los JSON devueltos.
- **Validaciones:** Sigue usando Zod en la capa de rutas/middlewares.
- **Clean Code:** Funciones de máximo 20-30 líneas. Evita repetir `try/catch` usando el `asyncHandler` global de forma consistente.
- Cuando vayas a refactorizar, extrae primero la capa Service y luego inyecta el servicio en el controlador sin romper la API (retrocompatibilidad).
