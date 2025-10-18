import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchKitchenOrders,
  updateOrderStatus,
  markItemPrepared,
  setFilterStatus,
} from '../features/kitchen/kitchenSlice';
import KitchenOrderCard from '../features/kitchen/components/KitchenOrderCard';
import KitchenStats from '../features/kitchen/components/KitchenStats';
import KOTBadge from '../components/KOTBadge';
import toast from 'react-hot-toast';
import { RefreshCw, Filter } from 'lucide-react';

const KitchenDisplay = () => {
  const dispatch = useAppDispatch();
  const { orders, activeOrders, loading, filterStatus } = useAppSelector(
    (state) => state.kitchen
  );

  // Load orders on mount
  useEffect(() => {
    dispatch(fetchKitchenOrders());
  }, [dispatch]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchKitchenOrders());
    }, 10000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await dispatch(updateOrderStatus({ orderId, status })).unwrap();
      toast.success(`Order status updated to ${status}`);
      dispatch(fetchKitchenOrders());
    } catch (error: any) {
      toast.error(error.message || 'Error updating order status');
    }
  };

  const handleItemToggle = async (orderItemId: string, prepared: boolean) => {
    try {
      await dispatch(markItemPrepared({ orderItemId, prepared })).unwrap();
      toast.success(prepared ? 'Item marked as prepared' : 'Item unmarked');
      dispatch(fetchKitchenOrders());
    } catch (error: any) {
      toast.error(error.message || 'Error updating item status');
    }
  };

  const handleRefresh = () => {
    dispatch(fetchKitchenOrders());
    toast.success('Orders refreshed');
  };

  // Filter orders based on selected status
  const filteredOrders =
    filterStatus === 'ALL'
      ? activeOrders
      : activeOrders.filter((order) => order.status === filterStatus);

  // Calculate stats
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const preparingCount = orders.filter((o) => o.status === 'PREPARING').length;
  const servedCount = orders.filter((o) => o.status === 'SERVED').length;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Kitchen Display System</h1>
            <p className="text-gray-600 mt-1">Manage and track order preparation</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <KitchenStats
          pendingCount={pendingCount}
          preparingCount={preparingCount}
          servedCount={servedCount}
          totalOrders={orders.length}
        />
      </div>

      {/* Filter */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-semibold text-gray-700">Filter:</span>
        </div>
        <div className="flex gap-2">
          {['ALL', 'PENDING', 'PREPARING', 'SERVED'].map((status) => (
            <button
              key={status}
              onClick={() => dispatch(setFilterStatus(status as any))}
              className={`px-4 py-2 rounded-lg transition font-medium ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      {loading && orders.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">No orders to display</p>
          <p className="text-gray-400 mt-2">
            {filterStatus !== 'ALL'
              ? 'Try changing the filter'
              : 'Orders will appear here when customers place them'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className="relative">
              <KitchenOrderCard
                order={order}
                onStatusChange={handleStatusChange}
                onItemToggle={handleItemToggle}
              />
              
              {/* KOT Badge */}
              <div className="absolute top-2 right-2">
                <KOTBadge
                  kotPrinted={order.kotPrinted || false}
                  kotNumber={order.kotNumber}
                  size="sm"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KitchenDisplay;