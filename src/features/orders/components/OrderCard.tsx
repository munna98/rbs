// src/features/orders/components/OrderCard.tsx
import { Edit, Trash2, CheckCircle, Printer, DollarSign, Split, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import KOTBadge from '../../../components/KOTBadge';
import type { Order } from '../../../types';

interface OrderCardProps {
  order: Order;
  nextStatus: string | null;
  onStatusChange: (orderId: string, status: string) => void;
  onPayment: (order: Order) => void;
  onSplitPayment: (order: Order) => void;
  onPrintReceipt: (order: Order) => void;
  onDelete: (orderId: string) => void;
  allowSplitPayment: boolean;
}

const OrderCard = ({
  order,
  nextStatus,
  onStatusChange,
  onPayment,
  onSplitPayment,
  onPrintReceipt,
  onDelete,
  allowSplitPayment,
}: OrderCardProps) => {
  const navigate = useNavigate();

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

  return (
    <div
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
          <div className="flex flex-col items-end gap-1">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                order.status
              )}`}
            >
              {order.status}
            </span>
            <KOTBadge
              kotPrinted={order.kotPrinted || false}
              kotNumber={order.kotNumber}
              size="sm"
            />
          </div>
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
              <div key={item.id} className="flex justify-between text-sm">
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
          {/* Edit Button */}
          <button
            onClick={() => navigate(`/orders/edit/${order.id}`)}
            className="flex items-center justify-center gap-1 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
            title="Edit Order"
          >
            <Edit className="w-4 h-4" />
          </button>

          {/* Next Status Button */}
          {nextStatus && (
            <button
              onClick={() => onStatusChange(order.id, nextStatus)}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              {nextStatus}
            </button>
          )}

          {/* Payment Button (Only for SERVED status) */}
          {order.status === 'SERVED' && (
            <>
              <button
                onClick={() => onPayment(order)}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm font-semibold"
              >
                <DollarSign className="w-4 h-4" />
                Pay
              </button>

              {allowSplitPayment && (
                <button
                  onClick={() => onSplitPayment(order)}
                  className="flex items-center justify-center gap-1 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition text-sm"
                  title="Split Payment"
                >
                  <Split className="w-4 h-4" />
                </button>
              )}
            </>
          )}

          {/* Print Receipt */}
          <button
            onClick={() => onPrintReceipt(order)}
            className="flex items-center justify-center gap-1 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
            title="Print Receipt"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Cancel Button */}
          <button
            onClick={() => onDelete(order.id)}
            className="px-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            title="Cancel Order"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;