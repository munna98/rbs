import { Clock, User, CheckCircle, ChefHat, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Order } from '../../../types';

interface KitchenOrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, status: string) => void;
  onItemToggle: (orderItemId: string, prepared: boolean) => void;
}

const KitchenOrderCard = ({
  order,
  onStatusChange,
  onItemToggle,
}: KitchenOrderCardProps) => {
  const getStatusColor = () => {
    switch (order.status) {
      case 'PENDING':
        return 'border-yellow-500 bg-yellow-50';
      case 'PREPARING':
        return 'border-blue-500 bg-blue-50';
      case 'SERVED':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getStatusIcon = () => {
    switch (order.status) {
      case 'PENDING':
        return <AlertCircle className="w-6 h-6 text-yellow-600" />;
      case 'PREPARING':
        return <ChefHat className="w-6 h-6 text-blue-600" />;
      case 'SERVED':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      default:
        return null;
    }
  };

  const totalItems = order.orderItems?.length || 0;
  const preparedItems = order.orderItems?.filter((item) => item.prepared === true).length || 0;
  const progress = totalItems > 0 ? (preparedItems / totalItems) * 100 : 0;

  return (
    <div
      className={`rounded-xl shadow-lg border-l-4 ${getStatusColor()} p-4 hover:shadow-xl transition`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h3 className="font-bold text-lg">
              {order.table ? `Table ${order.table.tableNumber}` : 'Takeaway'}
            </h3>
            <p className="text-xs text-gray-600">
              Order #{order.orderNumber || order.id.slice(0, 8)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-gray-600 text-sm">
            <Clock className="w-4 h-4" />
            <span>
              {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
            </span>
          </div>
          {order.user && (
            <div className="flex items-center gap-1 text-gray-600 text-xs mt-1">
              <User className="w-3 h-3" />
              <span>{order.user.username}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progress</span>
          <span>
            {preparedItems}/{totalItems} items
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Order Items */}
      <div className="space-y-2 mb-4">
        {order.orderItems && order.orderItems.length > 0 ? (
          order.orderItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-white p-2 rounded border"
            >
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="checkbox"
                  checked={item.prepared === true}
                  onChange={(e) => onItemToggle(item.id, e.target.checked)}
                  className="w-5 h-5 rounded cursor-pointer"
                />
                <div className={item.prepared ? 'line-through text-gray-500' : ''}>
                  <span className="font-semibold">{item.quantity}x</span>{' '}
                  <span>{item.menuItem?.name || 'Unknown Item'}</span>
                  {item.notes && (
                    <p className="text-xs text-gray-500 italic mt-1">
                      Note: {item.notes}
                    </p>
                  )}
                </div>
              </div>
              {item.prepared && <CheckCircle className="w-4 h-4 text-green-600" />}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No items</p>
        )}
      </div>

      {/* Special Instructions */}
      {order.notes && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded p-2">
          <p className="text-xs font-semibold text-yellow-800">
            Special Instructions:
          </p>
          <p className="text-xs text-yellow-700 mt-1">{order.notes}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {order.status === 'PENDING' && (
          <button
            onClick={() => onStatusChange(order.id, 'PREPARING')}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Start Preparing
          </button>
        )}
        {order.status === 'PREPARING' && preparedItems === totalItems && (
          <button
            onClick={() => onStatusChange(order.id, 'SERVED')}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold"
          >
            Mark as Served
          </button>
        )}
        {order.status === 'SERVED' && (
          <div className="flex-1 bg-green-600 text-white py-2 rounded-lg text-center font-semibold">
            ✓ Completed
          </div>
        )}
      </div>
    </div>
  );
};

export default KitchenOrderCard;