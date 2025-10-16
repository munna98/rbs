import { useState } from 'react';
import { X, Printer } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  total: number;
  onClose: () => void;
  onSubmit: (data: { method: string; amount: number }) => void;
  onPrintPreview?: () => void;
  isLoading?: boolean;
}

const CheckoutModal = ({
  isOpen,
  total,
  onClose,
  onSubmit,
  onPrintPreview,
  isLoading = false,
}: CheckoutModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'UPI'>('CASH');
  const [amount, setAmount] = useState(total);

  const handleSubmit = () => {
    onSubmit({
      method: paymentMethod,
      amount,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Checkout</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Bill Summary */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
          <h3 className="font-semibold mb-3">Bill Summary</h3>
          <div className="text-2xl font-bold text-blue-600 mb-3">
            Total: ₹{total.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">
            <p>Amount Due: ₹{amount.toFixed(2)}</p>
            {amount !== total && (
              <p className="text-orange-600 mt-2">
                Change: ₹{(amount - total).toFixed(2)}
              </p>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-3">
            Payment Method
          </label>
          <div className="space-y-2">
            {['CASH', 'CARD', 'UPI'].map((method) => (
              <label key={method} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  name="payment"
                  value={method}
                  checked={paymentMethod === method}
                  onChange={(e) => setPaymentMethod(e.target.value as 'CASH' | 'CARD' | 'UPI')}
                  className="w-4 h-4"
                />
                <span className="font-medium">{method}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">
            Amount Received (₹)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            step="0.01"
            min={total}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-semibold"
            disabled={isLoading}
          >
            Cancel
          </button>
          {onPrintPreview && (
            <button
              onClick={onPrintPreview}
              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              disabled={isLoading || amount < total}
            >
              <Printer className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={isLoading || amount < total}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Complete Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;