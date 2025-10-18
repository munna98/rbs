import { useEffect, useState } from 'react';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Clock,
  Users,
  Package,
} from 'lucide-react';
import { useAppSelector } from '../store/hooks';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  todaySales: number;
  activeOrders: number;
  completedOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  availableTables: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  orderType: string;
  total: number;
  status: string;
  createdAt: Date;
  table?: { tableNumber: number };
  customerName?: string;
}

const Dashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    availableTables: 0,
  });
  
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch orders
      const ordersResult = await window.electronAPI.getOrders();
      const tablesResult = await window.electronAPI.getAllTables();

      if (ordersResult.success && tablesResult.success) {
        const orders = ordersResult.data || [];
        const tables = tablesResult.data || [];

        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Filter today's orders
        const todayOrders = orders.filter(
          (order: any) => new Date(order.createdAt) >= today
        );

        // Calculate stats
        const completedToday = todayOrders.filter(
          (o: any) => o.status === 'COMPLETED'
        );
        
        const activeOrders = orders.filter((o: any) =>
          ['PENDING', 'PREPARING', 'READY', 'SERVED'].includes(o.status)
        );

        const todaySales = completedToday.reduce(
          (sum: number, order: any) => sum + order.total,
          0
        );

        const totalRevenue = orders
          .filter((o: any) => o.status === 'COMPLETED')
          .reduce((sum: number, order: any) => sum + order.total, 0);

        const availableTables = tables.filter(
          (t: any) => t.status === 'AVAILABLE'
        ).length;

        const pendingOrders = orders.filter(
          (o: any) => o.status === 'PENDING'
        ).length;

        setStats({
          todaySales,
          activeOrders: activeOrders.length,
          completedOrders: completedToday.length,
          totalRevenue,
          pendingOrders,
          availableTables,
        });

        // Get recent orders (last 10)
        const recent = orders
          .sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 10);

        setRecentOrders(recent);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PREPARING':
        return 'bg-blue-100 text-blue-800';
      case 'READY':
        return 'bg-purple-100 text-purple-800';
      case 'SERVED':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case 'DELIVERY':
        return '🚚';
      case 'TAKEAWAY':
        return '🥡';
      default:
        return '🍽️';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {user?.username}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening today - {format(new Date(), 'PPP')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Today's Sales</p>
              <h3 className="text-3xl font-bold mt-2">
                ₹{stats.todaySales.toLocaleString()}
              </h3>
              <p className="text-blue-100 text-sm mt-2">
                {stats.completedOrders} orders completed
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Active Orders</p>
              <h3 className="text-3xl font-bold mt-2">{stats.activeOrders}</h3>
              <p className="text-orange-100 text-sm mt-2">
                {stats.pendingOrders} pending
              </p>
            </div>
            <ShoppingBag className="w-12 h-12 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">
                Available Tables
              </p>
              <h3 className="text-3xl font-bold mt-2">{stats.availableTables}</h3>
              <p className="text-green-100 text-sm mt-2">Ready for customers</p>
            </div>
            <Users className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Revenue</p>
              <h3 className="text-3xl font-bold mt-2">
                ₹{stats.totalRevenue.toLocaleString()}
              </h3>
              <p className="text-purple-100 text-sm mt-2">All time</p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => navigate('/orders')}
          className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition border-2 border-blue-100 hover:border-blue-300"
        >
          <ShoppingBag className="w-10 h-10 text-blue-600 mb-3" />
          <h3 className="text-lg font-bold mb-1">New Order</h3>
          <p className="text-sm text-gray-600">Create a new order</p>
        </button>

        <button
          onClick={() => navigate('/kitchen')}
          className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition border-2 border-orange-100 hover:border-orange-300"
        >
          <Package className="w-10 h-10 text-orange-600 mb-3" />
          <h3 className="text-lg font-bold mb-1">Kitchen</h3>
          <p className="text-sm text-gray-600">View kitchen orders</p>
        </button>

        <button
          onClick={() => navigate('/tables')}
          className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition border-2 border-green-100 hover:border-green-300"
        >
          <Users className="w-10 h-10 text-green-600 mb-3" />
          <h3 className="text-lg font-bold mb-1">Tables</h3>
          <p className="text-sm text-gray-600">Manage tables</p>
        </button>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            Recent Orders
          </h2>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-semibold">No orders yet</p>
            <p className="text-sm">Orders will appear here when created</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                    Order #
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                    Customer/Table
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono font-semibold text-blue-600">
                        {order.orderNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-2xl">
                        {getOrderTypeIcon(order.orderType)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {order.table
                        ? `Table ${order.table.tableNumber}`
                        : order.customerName || 'Walk-in'}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      ₹{order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {format(new Date(order.createdAt), 'HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;