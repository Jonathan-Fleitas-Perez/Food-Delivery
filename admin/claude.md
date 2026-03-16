# 🤖 Instrucciones y Guía de Implementación para Claude (Admin)

## 📌 Contexto del Proyecto
Frontend tipo Dashboard (Panel de Control) para administradores y managers.
**Tecnologías:** React 19, Vite, Tailwind, Chart.js, Recharts, React Router.

---

## 🏗 Arquitectura y Estructura
- Rutas clásicas de Backoffice: Dashboard principal, Listados (Productos, Usuarios, Pedidos), y Formularios (Añadir Producto, Crear Usuario).
- Gráficas y analíticas presentes en el Dashboard para el control del restaurante.
- `RouteValidator` protege rutas usando los permisos devueltos por la sesión del backend (RBAC - Role Based Access Control).

---

## 🚨 Deuda Técnica y Refactorizaciones Necesarias

1. **Gordura de Componentes de Gestión:**
   - *Problema:* `List.jsx` (24KB), `UserManagement.jsx` (20KB), `Dashboard.jsx` (14KB). Son *God Components*. Tienen fetches, mapeos de tablas largas, filtrado en cliente asíncrono y modales inline.
   - *Solución:* Romper las tablas en componentes `<DataTable />`, mover las lógicas a custom hooks `useTableData`, y sacar los modales (ej. `<EditProductModal />`) de adentro del `.map()`, levantando el estado (o usando contexto) para que exista un solo modal en la jerarquía que cambie sus datos en vez de 50 modales invisibles en el DOM.

2. **Inconsistencia de Estados Globales:**
   - *Problema:* Como es común, el contexto podría estar sobreusado en cosas que van en URL locales.
   - *Solución:* Para filtros de tablas y paginación, sincronizar el estado del filtro con la URL (`?page=2&status=delivered`). Esto permite compartir enlaces de vistas filtradas entre admins.

3. **Manejo de Formularios Bloated:**
   - *Problema:* `Add.jsx` (13KB). Mucho código manual para crear form data multipart e imágenes.
   - *Solución:* Componentizar `<ImageDropzone />` y partes del form. Mismo caso que el frontend cliente: adoptar `React Hook Form`.

---

## 🛠 Directivas de Implementación para Claude
- El objetivo aquí es una mantenibilidad impecable: el panel admin tiende a ser "feo por detrás" debido a la rapidez de entrega. Nuestro objetivo es **Excelencia de Ingeniería**.
- Cada vez que crees algo nuevo: separa vista, estado local asíncrono (Hook) y presentación pura.
- Asegúrate de implementar *skeletons* al cargar datos grandes mas que hacer el clásico `isLoading ? <p>Loading</p> : ...`. Mejora la UX enormemente.
