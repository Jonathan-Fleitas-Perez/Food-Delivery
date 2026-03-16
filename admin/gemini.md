# 🤖 Instrucciones y Guía de Implementación para Gemini (Admin)

## 📌 Contexto del Sistema
Panel de Administración del sistema. Control total de Productos, Órdenes, Análisis (Dashboard con Charts) y Roles.
**Stack:** React, TailwindCSS, Múltiples librerías de Charts (Chart.js + Recharts).

---

## 🛠 Reingeniería y Buenas Prácticas Requeridas

### 1. Duplicación de Librerías Chart
**El Problema:** Tienen `chart.js`, `react-chartjs-2`, y además `recharts` en el `package.json`.
**La Solución:** Estandarizar usando solo una (Recharts es usualmente más react-friendly) y eliminar la otra para reducir tamaño de bundle. Hay que unificar.

### 2. Optimización de Renderizado en Listas Masivas
**El Problema:** Tablas (Orders, Users, Foods) pueden volverse pesadas si el negocio escala. El DOM se llenará de rows.
**La Solución:** Si las listas superan los 50-100 items sin paginación desde backend, debes implementar `react-window` o tablas virtuales (o Forzar paginación server-side que es lo ideal). 

### 3. Seguridad Frontend (RBAC)
**El Problema:** `RouteValidator.jsx` controla acceso, pero los elementos UI de dentro de un componente pueden no ocultarse si el usuario es manager y no tiene permisos completos de admin.
**La Solución:** Implementar un hook/componente genérico `<Can do="orders:delete"> <BotonEliminar/> </Can>` que evalúe contra los permisos devueltos por el backend (vistos en JWT).

---

## 🎯 Instrucciones de Actuación para la IA
- **Modularidad Extrema:** Divide las grandes páginas como el Dashboard en widgets independientes que fetcheen sus propios datos aisladamente. Si uno falla, el resto del dashboard funciona. No cargues todos los stats en el componente padre.
- **Experiencia Premium Administrativa:** Un buen admin panel no es aburrido. Usa los micro-estados de botones (spinners internos mientras se guarda un cambio), toast notifications concretas de éxito, y modales de confirmación amigables y no estorbosos (sweet alerts tailwind-based).
- Todo código que manipules aquí debe acabar viéndose más simple y leyendo su componente principal en menos de 5 segundos de barrido visual.
