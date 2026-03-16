# 🤖 Instrucciones y Guía de Implementación para Gemini (Frontend)

## 📌 Contexto del Sistema
Es el Single Page Application (SPA) para los clientes finales de la plataforma Food Delivery.
**Stack:** React, Vite, TailwindCSS.

---

## 🗺 Resumen de Navegación (Rutas)
- `/`: Inicio (`Home.jsx`). Muestra Hero y popular foods.
- `/menu`: Catálogo completo de comida (`Menu.jsx`).
- `/cart`: Resumen de la compra actual.
- `/order`: Finalizar pedido y pago.
- `/myorders`: Listado de pedidos previos y estado actual.

---

## 🛠 Prioridades de Mejora Codebase

### 1. Refactor de Formularios
**El Problema:** El componente de `Login` maneja estados en local (`useState`), y validaciones propias. En PlaceOrder también.
**La Solución:** Introducir la combinación **React Hook Form + Zod**. El Backend ya usa Zod, así que podemos (y debemos) compartir schemas de validación o al menos la estructura. Es fundamental estandarizar el manejo de errores de validación.

### 2. Optimizaciones de Rendimiento
**El Problema:** Archivos como `index.css` y las imágenes cargadas no están del todo optimizados, posible repetición en código de listados (`Item.jsx` a veces renderiza de más).
**La Solución:** 
- Usar `React.memo` para listados que no cambian (menú de comidas si no se filtra).
- Implementar Paginación / Infinite Scrolling o *Lazy loading* en imágenes de Cloudinary para no cargar todo de golpe. Vemos que en admin sí está instalada una librería para Lazy Load, se podría portar aquí.

### 3. Feedback Visual (UX)
**El Problema:** Si una llamada falla (ej. agregar al carrito) hay toasts pero a veces falta sincronización UI.
**La Solución:** Implementar estados *Optimistic UI* al añadir/quitar cosas del carrito. El número del carrito debe reaccionar de inmediato, y si la llamada al backend falla, revertir el cambio silenciosamente informando al usuario.

---

## 🎯 Instrucciones de Actuación para la IA
- Como agente productivo Gemini, cuando toques React aquí:
1. Extrae componentes masivos en pequeños funcionales de < 100 líneas.
2. Promueve el uso de TypeScript paulatinamente (actualmente JSX), validando Props usando PropTypes al menos, o sugiriendo paso a TS si hay reescrituras mayores.
3. Asegura diseño dinámico: efectos hover, transiciones de botones y sombras consistentes que den "Feeling" Premium.
