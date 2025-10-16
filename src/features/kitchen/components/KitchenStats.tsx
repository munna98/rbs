import { Clock, ChefHat, CheckCircle, AlertCircle } from 'lucide-react';

interface KitchenStatsProps {
  pendingCount: number;
  preparingCount: number;
  servedCount: number;
  totalOrders: number;
}

const KitchenStats = ({
  pendingCount,
  preparingCount,
  servedCount,
  totalOrders,
}: KitchenStatsProps) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-gray-500">
        <div className="flex items-center gap-3">
          <Clock className="w-8 h-8 text-gray-600" />
          <div>
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-gray-800">{totalOrders}</p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg shadow border-l-4 border-yellow-500">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-8 h-8 text-yellow-600" />
          <div>
            <p className="text-sm text-yellow-800 font-semibold">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg shadow border-l-4 border-blue-500">
        <div className="flex items-center gap-3">
          <ChefHat className="w-8 h-8 text-blue-600" />
          <div>
            <p className="text-sm text-blue-800 font-semibold">Preparing</p>
            <p className="text-2xl font-bold text-blue-600">{preparingCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded-lg shadow border-l-4 border-green-500">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <div>
            <p className="text-sm text-green-800 font-semibold">Served</p>
            <p className="text-2xl font-bold text-green-600">{servedCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenStats;