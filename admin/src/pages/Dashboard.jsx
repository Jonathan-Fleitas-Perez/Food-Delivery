import  { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { 
  TbShoppingCart, TbCurrencyDollar, TbPackage, 
  TbUser, TbChartBar, TbCalendarStats, TbRefresh
} from 'react-icons/tb';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, 
  CategoryScale, LinearScale, BarElement, 
  Title, Tooltip, Legend, PointElement, 
  LineElement, ArcElement 
} from 'chart.js';
import { toast } from 'react-toastify';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, PointElement,
  LineElement, ArcElement
);

const Dashboard = ({ token, permissions }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('1day');
  
  // Verificar permisos
  const canViewDashboard = permissions.includes('dashboard:read');

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/dashboard/stats?range=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error(error.response?.data?.message || 'Error cargando el dashboard');
    } finally {
      setLoading(false);
    }
  }, [token, timeRange]);

  useEffect(() => {
    if (!canViewDashboard) {
      setLoading(false);
      return;
    }

    fetchDashboardData();
  }, [canViewDashboard, fetchDashboardData]);

  // Preparar datos para gráficos
  const prepareChartData = () => {
    if (!dashboardData) return {};
    
    // Gráfico de barras: Ventas por categoría
    const salesByCategoryData = {
      labels: dashboardData.salesByCategory.map(item => item._id),
      datasets: [
        {
          label: 'Ventas por categoría',
          data: dashboardData.salesByCategory.map(item => item.totalSales),
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };

    // Gráfico de líneas: Tendencias de ventas
    const salesTrendData = {
      labels: dashboardData.salesTrend.map(item => item._id),
      datasets: [
        {
          label: 'Ventas diarias',
          data: dashboardData.salesTrend.map(item => item.totalSales),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.3,
        },
      ],
    };

    // Gráfico circular: Órdenes por estado
    const ordersByStatusData = {
      labels: dashboardData.ordersByStatus.map(item => item.status),
      datasets: [
        {
          data: dashboardData.ordersByStatus.map(item => item.count),
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(199, 199, 199, 0.7)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(199, 199, 199, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };

    return { salesByCategoryData, salesTrendData, ordersByStatusData };
  };

  const { salesByCategoryData, salesTrendData, ordersByStatusData } = prepareChartData();

  if (!canViewDashboard) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="max-w-md p-6 text-center bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-red-600">Acceso no autorizado</h2>
          <p className="mt-3 text-gray-700">
            No tienes permiso para ver el dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Cargando datos del dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="text-xl text-center text-gray-600">
          No se pudieron cargar los datos del dashboard
        </div>
        <button 
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2 mt-4 text-white bg-blue-500 rounded-md hover:bg-blue-600"
        >
          <TbRefresh className="text-xl" />
          Intentar de nuevo
        </button>
      </div>
    );
  }

  // Estadísticas principales
  const stats = dashboardData.orders;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col justify-between mb-6 md:flex-row md:items-center">
        <h1 className="text-2xl font-bold">Dashboard Empresarial</h1>
        <div className="flex gap-2 mt-4 md:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="1day">Último día</option>
            <option value="7days">Últimos 7 días</option>
            <option value="30days">Últimos 30 días</option>
          </select>
          <button 
            onClick={fetchDashboardData}
            className="p-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
            title="Actualizar datos"
          >
            <TbRefresh className="text-xl" />
          </button>
        </div>
      </div>

      {/* Resumen de métricas */}
      <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total de Órdenes</h3>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </div>
            <div className="p-3 text-white bg-blue-500 rounded-full">
              <TbShoppingCart className="text-2xl" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            <span className="font-semibold">+5.2%</span> desde el último mes
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Ingresos Totales</h3>
              <p className="text-2xl font-bold">{currency}{stats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="p-3 text-white bg-green-500 rounded-full">
              <TbCurrencyDollar className="text-2xl" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            <span className="font-semibold">+12.7%</span> desde el último mes
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Valor Promedio</h3>
              <p className="text-2xl font-bold">{currency}{stats.avgOrderValue.toFixed(2)}</p>
            </div>
            <div className="p-3 text-white bg-purple-500 rounded-full">
              <TbChartBar className="text-2xl" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            <span className="font-semibold">+2.3%</span> desde el último mes
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Productos Activos</h3>
              <p className="text-2xl font-bold">{dashboardData.salesByCategory.reduce((acc, cat) => acc + cat.count, 0)}</p>
            </div>
            <div className="p-3 text-white bg-orange-500 rounded-full">
              <TbPackage className="text-2xl" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            <span className="font-semibold">+3.1%</span> nuevos productos
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Tendencias de Ventas</h2>
          <div className="h-72">
            <Line 
              data={salesTrendData} 
              options={{ 
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `${currency}${context.parsed.y.toFixed(2)}`;
                      }
                    }
                  }
                }
              }} 
            />
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Ventas por Categoría</h2>
          <div className="h-72">
            <Bar 
              data={salesByCategoryData} 
              options={{ 
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `${currency}${context.parsed.y.toFixed(2)}`;
                      }
                    }
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Tablas y detalles */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Distribución de Órdenes</h2>
          <div className="flex items-center justify-center h-72">
            <Pie 
              data={ordersByStatusData} 
              options={{ 
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  }
                }
              }} 
            />
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Mejores Clientes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Cliente</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Órdenes</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Total Gastado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dashboardData.topCustomers.map((customer, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">{customer.totalOrders}</td>
                    <td className="px-4 py-3 text-sm font-medium text-right">{currency}{customer.totalSpent.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Productos más vendidos */}
      <div className="p-4 mt-8 bg-white rounded-lg shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Productos Más Vendidos</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Producto</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Unidades Vendidas</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Ingresos Generados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dashboardData.topProducts.map((product, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 font-medium">{product._id}</td>
                  <td className="px-4 py-3 text-right">{product.totalSold}</td>
                  <td className="px-4 py-3 font-medium text-right">{currency}{product.totalRevenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;