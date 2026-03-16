# 🤖 Instrucciones y Guía de Implementación para Claude (Frontend)

## 📌 Contexto del Proyecto
Frontend (App del Cliente) de un sistema de Food Delivery.
**Tecnologías:** React 19, Vite, TailwindCSS, React Router DOM, Axios, Context API para estado global.

---

## 🏗 Arquitectura
- **Componentes Basados en Funciones:** Uso intensivo de Hooks en la estructura.
- **Estado Global:** Manejado con `Context API` (presumiblemente `StoreContext.jsx`).
- **Páginas Principales:** `Home`, `Menu`, `Cart`, `PlaceOrder`, `Orders`, `Login`, `Verify` (stripe success/cancel).
- **Componentes Reutilizables:** `Header`, `Footer`, `Navbar`, `Item`, `Features`.

---

## 🚨 Malas Prácticas Detectadas y Oportunidades de Refactorización

1. **Estado Global con Context API para Todo:**
   - *Problema:* Todo el estado pesado (productos, carrito, token de usuario) reside en un gran Context Provider. Esto causa re-renderizados innecesarios en componentes que solo consumen una parte del estado.
   - *Solución:* Migrar gradualmente a **Zustand** o usar **Redux Toolkit** para gestionar estados asíncronos complejos, dividiendo los *slices* lógicamente (Auth, Cart, Products).

2. **Componentes "Bloated" (Gordos):**
   - *Problema:* Páginas como `PlaceOrder.jsx` (12KB) o `Login.jsx` (10KB) tienen demasiada responsabilidad (validaciones de formulario, llamadas a la API y lógica UI).
   - *Solución:* Implementar el **Patrón Container-Presenter**. Separar la lógica de negocio usando **Custom Hooks** (ej. `useAuth`, `useOrderForm`) y dejar que los componentes solo se preocupen de renderizar JSX.

3. **Data Fetching Básico con Axios:**
   - *Problema:* Las llamadas a la API se hacen con simples `useEffect` sin manejo de caché, *retry*, o estados de carga sofisticados (skeleton loaders compartidos).
   - *Solución:* Considerar fuertemente la adopción de **TanStack Query (React Query)** o **SWR** para manejar el estado de caché y fetching del lado del cliente, reduciendo drásticamente el código repetitivo de los `try...catch`, `isLoading`, `isError`.

4. **Falta de UI Components Estilosos y Consistentes:**
   - *Problema:* El diseño base es Tailwind a mano. Sin estandarizar botones, inputs modales.
   - *Solución:* Crear una carpeta `src/components/ui/` para tener una librería interna de componentes (Button, Input, Card) que sigan la misma línea de diseño y prevengan la repetición incesante de clases de Tailwind.

---

## 🛠 Directivas de Implementación para Claude
- Mantenimiento de código UI: Cuando agregues un componente, asegúrate de utilizar flex o grid layout, manejando bien la vista móvil (responsive design first).
- Si encuentras clases repetidas de Tailwind, extraclas a componentes base o const/vars en el mismo archivo.
- Al implementar nuevas características, piensa siempre si la lógica asíncrona puede aislarse en un Hook.
