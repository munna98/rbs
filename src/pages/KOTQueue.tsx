import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Printer, Eye, Check, RefreshCw, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Order } from '../types';

const KOTQueue = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueue();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(loadQueue, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadQueue = async () => {
    try {
      const result = await window.electronAPI.getKOTQueue();
      if (result.success) {
        setOrders(result.data || []);
      }
    } catch (error) {
      console.error('Error loading KOT queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintKOT = async (order: Order) => {
    try {
      const printerResult = await window.electronAPI.getPrinterSettings();
      
      const kotData = {
        orderId: order.id,
        kotNumber: order.kotNumber,
        orderNumber: order.orderNumber,
        tableNumber: order.table?.tableNumber,
        orderType: order.orderType,
        customerName: order.customerName,
        items: order.orderItems?.map((item) => ({
          name: item.menuItem?.name,
          quantity: item.quantity,
          notes: item.notes,
          category: item.menuItem?.category?.name,
        })) || [],
        notes: order.notes,
        createdAt: order.createdAt,
        waiterName: order.user?.username,
      };

      const result = await window.electronAPI.printKOT({
        kotData,
        printerSettings: printerResult.data,
      });

      if (result.success) {
        toast.success('KOT printed successfully');
        loadQueue();
      } else {
        toast.error(result.error || 'Print failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error printing KOT');
    }
  };

  const handlePreviewKOT = async (order: Order) => {
    try {
      const printerResult = await window.electronAPI.getPrinterSettings();
      
      const kotData = {
        orderId: order.id,
        kotNumber: order.kotNumber,
        orderNumber: order.orderNumber,
        tableNumber: order.table?.tableNumber,
        orderType: order.orderType,
        customerName: order.customerName,
        items: order.orderItems?.map((item) => ({
          name: item.menuItem?.name,
          quantity: item.quantity,
          notes: item.notes,
          category: item.menuItem?.category?.name,
        })) || [],
        notes: order.notes,
        createdAt: order.createdAt,
        waiterName: order.user?.username,
      };

      await window.electronAPI.previewKOT({
        kotData,
        printerSettings: printerResult.data,
      });
    } catch (error: any) {
      toast.error(error.message || 'Error previewing KOT');
    }
  };

  const handleMarkPrinted = async (orderId: string) => {
    try {
      const result = await window.electronAPI.markKOTPrinted(orderId);
      if (result.success) {
        toast.success('Marked as printed');
        loadQueue();
      } else {
        toast.error(result.error || 'Failed to mark as printed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error marking as printed');
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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">KOT Queue</h1>
          <p className="text-gray-600 mt-1">
            Kitchen Order Tickets waiting to be printed
          </p>
        </div>
        <button
          onClick={loadQueue}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-orange-50 p-4 rounded-lg shadow border-l-4 border-orange-500">
          <p className="text-orange-800 text-sm font-semibold">Pending KOTs</p>
          <p className="text-3xl font-bold text-orange-600">{orders.length}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow border-l-4 border-blue-500">
          <p className="text-blue-800 text-sm font-semibold">Total Items</p>
          <p className="text-3xl font-bold text-blue-600">
            {orders.reduce(
              (sum, order) =>
                sum +
                (order.orderItems?.reduce(
                  (itemSum, item) => itemSum + item.quantity,
                  0
                ) || 0),
              0
            )}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg shadow border-l-4 border-purple-500">
          <p className="text-purple-800 text-sm font-semibold">Oldest Order</p>
          <p className="text-lg font-bold text-purple-600">
            {orders.length > 0
              ? format(new Date(orders[0].createdAt), 'HH:mm')
              : '-'}
          </p>
        </div>
      </div>

      {/* Orders Grid */}
      {loading && orders.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Check className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <p className="text-gray-500 text-lg font-semibold">All caught up!</p>
          <p className="text-gray-400 mt-2">No pending KOTs in queue</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-lg border-l-4 border-orange-500 hover:shadow-xl transition"
            >
              {/* Header */}
              <div className="p-4 border-b bg-orange-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getOrderTypeIcon(order.orderType)}</span>
                    <div>
                      <h3 className="font-bold text-lg">{order.kotNumber}</h3>
                      <p className="text-sm text-gray-600">
                        Order: {order.orderNumber}
                      </p>
                    </div>
                  </div>
                  <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    PENDING
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(order.createdAt), 'HH:mm')}
                  </span>
                  {order.orderType === 'DINE_IN' && order.table && (
                    <span className="font-semibold">
                      Table {order.table.tableNumber}
                    </span>
                  )}
                  {order.customerName && (
                    <span>{order.customerName}</span>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="p-4 max-h-48 overflow-y-auto">
                {order.orderItems && order.orderItems.length > 0 ? (
                  <div className="space-y-2">
                    {order.orderItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm border-b pb-2"
                      >
                        <div>
                          <span className="font-semibold">{item.quantity}x</span>{' '}
                          {item.menuItem?.name}
                          {item.notes && (
                            <p className="text-xs text-gray-500 italic mt-1">
                              Note: {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No items</p>
                )}
              </div>

              {/* Special Instructions */}
              {order.notes && (
                <div className="px-4 pb-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                    <p className="text-xs font-semibold text-yellow-800">
                      Special Instructions:
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">{order.notes}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="p-4 bg-gray-50 border-t flex gap-2">
                <button
                  onClick={() => handlePreviewKOT(order)}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition text-sm"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <button
                  onClick={() => handlePrintKOT(order)}
                  className="flex-1 flex items-center justify-center gap-2 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition text-sm font-semibold"
                >
                  <Printer className="w-4 h-4" />
                  Print KOT
                </button>
                <button
                  onClick={() => handleMarkPrinted(order.id)}
                  className="px-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  title="Mark as printed"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KOTQueue;