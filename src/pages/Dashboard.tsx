import { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, CheckCircle, TrendingUp } from 'lucide-react';
import { useAppSelector } from '../store/hooks';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

const StatCard = ({ title, value, icon, color, trend }: StatCardProps) => (
  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold mt-2">{value}</h3>
        {trend && (
          <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            {trend}
          </p>
        )}
      </div>
      <div className={`${color} w-14 h-14 rounded-full flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState({
    todaySales: 0,
    activeOrders: 0,
    completedOrders: 0,
    revenue: 0,
  });

  useEffect(() => {
    // TODO: Fetch real stats from database
    setStats({
      todaySales: 15420,
      activeOrders: 8,
      completedOrders: 42,
      revenue: 125000,
    });
  }, []);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {user?.username}! 👋
        </h1>
        <p className="text-gray-600 mt-2">Here's what's happening today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Today's Sales"
          value={`₹${stats.todaySales.toLocaleString()}`}
          icon={<DollarSign className="w-7 h-7 text-white" />}
          color="bg-blue-500"
          trend="+12.5% from yesterday"
        />
        <StatCard
          title="Active Orders"
          value={stats.activeOrders}
          icon={<ShoppingBag className="w-7 h-7 text-white" />}
          color="bg-orange-500"
        />
        <StatCard
          title="Completed Orders"
          value={stats.completedOrders}
          icon={<CheckCircle className="w-7 h-7 text-white" />}
          color="bg-green-500"
          trend="+8% from yesterday"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.revenue.toLocaleString()}`}
          icon={<TrendingUp className="w-7 h-7 text-white" />}
          color="bg-purple-500"
          trend="+15.3% this month"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
        <div className="text-gray-500 text-center py-8">
          No recent orders to display
        </div>
      </div>
    </div>
  );
};

export default Dashboard;