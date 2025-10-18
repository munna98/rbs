import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Edit,
  Trash2,
  CheckCircle,
  Search,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { Order } from '../types';

const ActiveOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    loadOrders();
    
    // Auto-refresh every 15 seconds
    const interval = setInterval(loadOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const result = await window.electronAPI.getOrders();
      if (result.success) {
        const activeOrders = result.data.filter(
          (order: Order) =>
            !['COMPLETED', 'CANCELLED'].includes(order.status)
        );
        setOrders(activeOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const result = await window.electronAPI.updateOrder({
        id: orderId,
        status: 'CANCELLED',
      });

      if (result.success) {
        toast.success('Order cancelled');
        loadOrders();
      } else {
        toast.error(result.error || 'Failed to cancel order');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error cancelling order');
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const result = await window.electronAPI.updateOrderStatus({
        orderId,
        status: newStatus,
      });

      if (result.success) {
        toast.success(`Order marked as ${newStatus.toLowerCase()}`);
        loadOrders();
      } else {
        toast.error(result.error || 'Failed to update status');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error updating status');
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.table?.tableNumber.toString().includes(searchQuery);

    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'PREPARING':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'READY':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'SERVED':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
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

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'PENDING':
        return 'PREPARING';
      case 'PREPARING':
        return 'READY';
      case 'READY':
        return 'SERVED';
      case 'SERVED':
        return 'COMPLETED';
      default:
        return null;
    }
  };

  const statusCounts = {
    ALL: orders.length,
    PENDING: orders.filter((o) => o.status === 'PENDING').length,
    PREPARING: orders.filter((o) => o.status === 'PREPARING').length,
    READY: orders.filter((o) => o.status === 'READY').length,
    SERVED: orders.filter((o) => o.status === 'SERVED').length,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Active Orders</h1>
          <p className="text-gray-600 mt-1">Manage and track ongoing orders</p>
        </div>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {['ALL', 'PENDING', 'PREPARING', 'READY', 'SERVED'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`p-4 rounded-lg border-2 transition ${
              statusFilter === status
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white border-gray-200 hover:border-blue-300'
            }`}
          >
            <p className="text-2xl font-bold">
              {statusCounts[status as keyof typeof statusCounts]}
            </p>
            <p className="text-sm">{status}</p>
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by order number, customer, or table..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Orders Grid */}
      {loading && orders.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg font-semibold">No active orders</p>
          <p className="text-gray-400 mt-2">
            {searchQuery || statusFilter !== 'ALL'
              ? 'Try adjusting your filters'
              : 'New orders will appear here'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => {
            const nextStatus = getNextStatus(order.status);
            
            return (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-lg border-l-4 hover:shadow-xl transition"
                style={{
                  borderLeftColor:
                    order.status === 'PENDING'
                      ? '#FCD34D'
                      : order.status === 'PREPARING'
                      ? '#60A5FA'
                      : order.status === 'READY'
                      ? '#A78BFA'
                      : '#34D399',
                }}
              >
                {/* Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getOrderTypeIcon(order.orderType)}</span>
                      <div>
                        <h3 className="font-bold text-lg">
                          {order.orderNumber || `#${order.id.slice(0, 8)}`}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {order.orderType === 'DINE_IN' && order.table
                            ? `Table ${order.table.tableNumber}`
                            : order.customerName || 'Walk-in'}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(order.createdAt), 'PPp')}
                  </p>
                </div>

                {/* Items */}
                <div className="p-4 border-b max-h-40 overflow-y-auto">
                  {order.orderItems && order.orderItems.length > 0 ? (
                    <div className="space-y-2">
                      {order.orderItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm"
                        >
                          <span>
                            {item.quantity}x {item.menuItem?.name}
                          </span>
                          <span className="font-semibold">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No items</p>
                  )}
                </div>

                {/* Total */}
                <div className="p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold">Total:</span>
                    <span className="text-xl font-bold text-blue-600">
                      ₹{order.total.toFixed(2)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/orders/edit/${order.id}`)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>

                    {nextStatus && (
                      <button
                        onClick={() => handleStatusChange(order.id, nextStatus)}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {nextStatus === 'COMPLETED' ? 'Complete' : nextStatus}
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="px-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActiveOrders;