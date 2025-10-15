import { X, Clock, User, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import type { Table, Order } from '../../../types';

interface TableDetailsModalProps {
  isOpen: boolean;
  table: Table | null;
  orders: Order[];
  onClose: () => void;
}

const TableDetailsModal = ({
  isOpen,
  table,
  orders,
  onClose,
}: TableDetailsModalProps) => {
  if (!isOpen || !table) return null;

  const activeOrders = orders.filter(
    (order) => order.status !== 'COMPLETED' && order.status !== 'CANCELLED'
  );

  const totalAmount = activeOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Table {table.tableNumber}</h2>
            <p className="text-blue-100">
              Capacity: {table.capacity} | Status: {table.status}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 p-2 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="flex justify-center mb-2">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">Active Orders</p>
              <p className="text-2xl font-bold text-blue-600">
                {activeOrders.length}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="flex justify-center mb-2">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{totalAmount.toFixed(2)}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="flex justify-center mb-2">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600">Capacity</p>
              <p className="text-2xl font-bold text-purple-600">
                {table.capacity}
              </p>
            </div>
          </div>

          {/* Orders List */}
          <div>
            <h3 className="text-xl font-bold mb-4">Orders</h3>
            {activeOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No active orders</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm text-gray-600">
                          Order #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(order.createdAt), 'PPp')}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 'PREPARING'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'SERVED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    {/* Order Items */}
                    {order.orderItems && (
                      <div className="space-y-2 mb-3">
                        {order.orderItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-gray-700">
                              {item.quantity}x {item.menuItem?.name}
                            </span>
                            <span className="font-semibold">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="border-t pt-2 flex justify-between items-center">
                      <span className="text-sm font-semibold">Total:</span>
                      <span className="text-lg font-bold text-blue-600">
                        ₹{order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableDetailsModal;