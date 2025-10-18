import { useState } from 'react';
import { X, Plus, Trash2, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentSplit {
  id: string;
  method: 'CASH' | 'CARD' | 'UPI';
  amount: number;
}

interface SplitPaymentModalProps {
  isOpen: boolean;
  total: number;
  onClose: () => void;
  onSubmit: (payments: PaymentSplit[]) => void;
  isLoading?: boolean;
}

const SplitPaymentModal = ({
  isOpen,
  total,
  onClose,
  onSubmit,
  isLoading = false,
}: SplitPaymentModalProps) => {
  const [payments, setPayments] = useState<PaymentSplit[]>([
    {
      id: crypto.randomUUID(),
      method: 'CASH',
      amount: total,
    },
  ]);

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = total - totalPaid;

  const handleAddPayment = () => {
    if (remaining <= 0) {
      toast.error('Total amount already paid');
      return;
    }

    setPayments([
      ...payments,
      {
        id: crypto.randomUUID(),
        method: 'CASH',
        amount: remaining,
      },
    ]);
  };

  const handleRemovePayment = (id: string) => {
    if (payments.length === 1) {
      toast.error('At least one payment method required');
      return;
    }
    setPayments(payments.filter((p) => p.id !== id));
  };

  const handlePaymentChange = (
    id: string,
    field: 'method' | 'amount',
    value: string | number
  ) => {
    setPayments(
      payments.map((p) =>
        p.id === id
          ? {
              ...p,
              [field]: field === 'amount' ? parseFloat(value as string) || 0 : value,
            }
          : p
      )
    );
  };

  const handleSubmit = () => {
    if (totalPaid < total) {
      toast.error(`Remaining amount: ₹${remaining.toFixed(2)}`);
      return;
    }

    if (totalPaid > total) {
      toast.error('Total paid exceeds bill amount');
      return;
    }

    onSubmit(payments);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold">Split Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Bill Summary */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-semibold">Total Bill:</span>
            <span className="text-2xl font-bold text-blue-600">
              ₹{total.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Total Paid:</span>
            <span className="text-lg font-semibold">₹{totalPaid.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Remaining:</span>
            <span
              className={`text-lg font-semibold ${
                remaining > 0 ? 'text-red-600' : 'text-green-600'
              }`}
            >
              ₹{Math.abs(remaining).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Payment Methods</h3>
            <button
              onClick={handleAddPayment}
              disabled={remaining <= 0}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Payment
            </button>
          </div>

          {payments.map((payment, index) => (
            <div
              key={payment.id}
              className="flex items-center gap-4 p-4 border rounded-lg bg-white"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full font-bold">
                {index + 1}
              </div>

              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Payment Method
                  </label>
                  <select
                    value={payment.method}
                    onChange={(e) =>
                      handlePaymentChange(payment.id, 'method', e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={payment.amount}
                    onChange={(e) =>
                      handlePaymentChange(payment.id, 'amount', e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              {payments.length > 1 && (
                <button
                  onClick={() => handleRemovePayment(payment.id)}
                  className="text-red-600 hover:text-red-800 p-2"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-semibold"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || remaining !== 0}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            {isLoading ? 'Processing...' : 'Complete Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SplitPaymentModal;