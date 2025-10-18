import { useState } from 'react';
import { X, ArrowRight, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Table, Order } from '../../../types';

interface TransferOrderModalProps {
  isOpen: boolean;
  order: Order;
  currentTable: Table;
  availableTables: Table[];
  onClose: () => void;
  onSuccess: () => void;
}

const TransferOrderModal = ({
  isOpen,
  order,
  currentTable,
  availableTables,
  onClose,
  onSuccess,
}: TransferOrderModalProps) => {
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [isTransferring, setIsTransferring] = useState(false);

  const handleTransfer = async () => {
    if (!selectedTableId) {
      toast.error('Please select a target table');
      return;
    }

    setIsTransferring(true);
    try {
      const result = await window.electronAPI.transferOrder({
        orderId: order.id,
        fromTableId: currentTable.id,
        toTableId: selectedTableId,
      });

      if (result.success) {
        toast.success('Order transferred successfully');
        onSuccess();
        onClose();
      } else {
        toast.error(result.error || 'Transfer failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error transferring order');
    } finally {
      setIsTransferring(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Transfer Order</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current Table Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Current Table</p>
                <p className="text-2xl font-bold">Table {currentTable.tableNumber}</p>
                <p className="text-sm text-gray-600">Order: {order.orderNumber}</p>
              </div>
              <ArrowRight className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          {/* Available Tables */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Select Target Table</h3>
            {availableTables.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No available tables
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                {availableTables.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTableId(table.id)}
                    className={`p-4 rounded-lg border-2 transition ${
                      selectedTableId === table.id
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white border-gray-200 hover:border-green-400'
                    }`}
                  >
                    <Users className={`w-6 h-6 mx-auto mb-2 ${
                      selectedTableId === table.id ? 'text-white' : 'text-gray-600'
                    }`} />
                    <p className="font-bold">Table {table.tableNumber}</p>
                    <p className={`text-xs ${
                      selectedTableId === table.id ? 'text-white opacity-90' : 'text-gray-500'
                    }`}>
                      Cap: {table.capacity}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Order Details</h3>
            <div className="space-y-1 text-sm">
              <p>Items: {order.orderItems?.length || 0}</p>
              <p>Total: ₹{order.total.toFixed(2)}</p>
              <p>Status: {order.status}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-semibold"
            disabled={isTransferring}
          >
            Cancel
          </button>
          <button
            onClick={handleTransfer}
            disabled={!selectedTableId || isTransferring}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
          >
            {isTransferring ? 'Transferring...' : 'Transfer Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferOrderModal;