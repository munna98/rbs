// src/features/orders/components/PaymentModal.tsx
import { useState } from 'react';
import { X } from 'lucide-react';
import type { Order } from '../../../types';

interface PaymentModalProps {
  isOpen: boolean;
  order: Order | null;
  allowPartialPayment: boolean;
  onClose: () => void;
  onSubmit: (data: { method: string; amount: number }) => Promise<void>;
}

const PaymentModal = ({
  isOpen,
  order,
  allowPartialPayment,
  onClose,
  onSubmit,
}: PaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'UPI'>('CASH');
  const [paymentAmount, setPaymentAmount] = useState(order?.total || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({ method: paymentMethod, amount: paymentAmount });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const minAmount = allowPartialPayment ? 0 : order.total;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Take Payment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600">Order: {order.orderNumber}</p>
          <p className="text-3xl font-bold text-blue-600">₹{order.total.toFixed(2)}</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Payment Method</label>
          <div className="space-y-2">
            {(['CASH', 'CARD', 'UPI'] as const).map((method) => (
              <label
                key={method}
                className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="payment"
                  value={method}
                  checked={paymentMethod === method}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-4 h-4"
                />
                <span className="font-medium">{method}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">
            Amount Received (₹)
          </label>
          <input
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            step="0.01"
            min={minAmount}
          />
          {paymentAmount > order.total && (
            <p className="text-sm text-green-600 mt-1">
              Change: ₹{(paymentAmount - order.total).toFixed(2)}
            </p>
          )}
          {!allowPartialPayment && paymentAmount < order.total && (
            <p className="text-sm text-red-600 mt-1">
              Partial payments are not allowed
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              (paymentAmount < order.total && !allowPartialPayment)
            }
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-semibold"
          >
            {isSubmitting ? 'Processing...' : 'Complete Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
