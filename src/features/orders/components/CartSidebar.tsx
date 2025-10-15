import { Trash2, Plus, Minus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { updateCartItem, removeFromCart } from '../orderSlice';
// import type { CartItem } from '../../../types';

interface CartSidebarProps {
  onCheckout: () => void;
}

const CartSidebar = ({ onCheckout }: CartSidebarProps) => {
  const dispatch = useAppDispatch();
  const { cart, tax, taxRate } = useAppSelector((state) => state.order);

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal + tax;

  const handleQuantityChange = (menuItemId: string, quantity: number) => {
    dispatch(updateCartItem({ menuItemId, quantity }));
  };

  const handleRemove = (menuItemId: string) => {
    dispatch(removeFromCart(menuItemId));
  };

  return (
    <div className="w-80 bg-white shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <h2 className="text-xl font-bold">Order Cart</h2>
        <p className="text-sm text-blue-100">{cart.length} items</p>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Cart is empty</p>
            <p className="text-sm">Add items from menu</p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.menuItemId}
              className="bg-gray-50 p-3 rounded-lg border border-gray-200"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-sm">{item.name}</h4>
                  <p className="text-blue-600 font-bold">₹{item.price}</p>
                </div>
                <button
                  onClick={() => handleRemove(item.menuItemId)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between bg-white rounded p-2">
                <button
                  onClick={() =>
                    handleQuantityChange(item.menuItemId, item.quantity - 1)
                  }
                  className="text-gray-600 hover:bg-gray-100 p-1 rounded"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold">{item.quantity}</span>
                <button
                  onClick={() =>
                    handleQuantityChange(item.menuItemId, item.quantity + 1)
                  }
                  className="text-gray-600 hover:bg-gray-100 p-1 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="text-right mt-2">
                <p className="text-sm text-gray-600">
                  Subtotal: ₹{item.subtotal.toFixed(2)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {cart.length > 0 && (
        <div className="border-t p-4 bg-gray-50">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax ({taxRate}%):</span>
              <span className="font-semibold">₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-lg font-bold">
              <span>Total:</span>
              <span className="text-blue-600">₹{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={onCheckout}
            disabled={cart.length === 0}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default CartSidebar;