// src/features/orders/components/CartSidebar.tsx - COMPLETE UPDATED VERSION

import { Trash2, Plus, Minus, Store, ShoppingBag, Truck, AlertTriangle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { updateCartItem, removeFromCart } from '../orderSlice';
import { useWorkflowSettings } from '../../../hooks/useWorkflowSettings';

interface CartSidebarProps {
  onCheckout: () => void;
}

const CartSidebar = ({ onCheckout }: CartSidebarProps) => {
  const dispatch = useAppDispatch();
  const { settings: workflowSettings } = useWorkflowSettings();
  
  const { cart, tax, taxRate, orderType, selectedTable, customerInfo } = useAppSelector(
    (state) => state.order
  );

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal + tax;

  const handleQuantityChange = (menuItemId: string, quantity: number) => {
    dispatch(updateCartItem({ menuItemId, quantity }));
  };

  const handleRemove = (menuItemId: string) => {
    dispatch(removeFromCart(menuItemId));
  };

  const getOrderTypeIcon = () => {
    switch (orderType) {
      case 'DINE_IN':
        return <Store className="w-5 h-5" />;
      case 'TAKEAWAY':
        return <ShoppingBag className="w-5 h-5" />;
      case 'DELIVERY':
        return <Truck className="w-5 h-5" />;
    }
  };

  const getOrderTypeLabel = () => {
    switch (orderType) {
      case 'DINE_IN':
        return selectedTable ? `Table ${selectedTable.tableNumber}` : 'No table selected';
      case 'TAKEAWAY':
        return customerInfo?.name || 'Takeaway Order';
      case 'DELIVERY':
        return customerInfo?.name || 'Delivery Order';
    }
  };

  const getOrderTypeColor = () => {
    switch (orderType) {
      case 'DINE_IN':
        return 'from-blue-600 to-blue-700';
      case 'TAKEAWAY':
        return 'from-green-600 to-green-700';
      case 'DELIVERY':
        return 'from-orange-600 to-orange-700';
    }
  };

  // Validation logic
  const canCheckout = () => {
    if (cart.length === 0) return false;
    
    if (orderType === 'DINE_IN' && !selectedTable) return false;
    
    if ((orderType === 'TAKEAWAY' || orderType === 'DELIVERY') && !customerInfo?.name) {
      return false;
    }
    
    if (orderType === 'DELIVERY' && !customerInfo?.address) return false;
    
    return true;
  };

  // Get button text based on workflow settings
  const getButtonText = () => {
    if (!canCheckout()) {
      if (cart.length === 0) return 'Cart is Empty';
      if (orderType === 'DINE_IN') return 'Select Table First';
      if (!customerInfo?.name) return 'Fill Customer Info';
      if (orderType === 'DELIVERY' && !customerInfo?.address) return 'Add Delivery Address';
      return 'Complete Order Info';
    }

    // Check workflow settings for button text
    const requirePaymentFirst = workflowSettings?.requirePaymentAtOrder ?? false;
    
    if (requirePaymentFirst) {
      return 'Proceed to Payment'; // Quick Service Mode
    } else {
      return 'Send to Kitchen'; // Full Service Mode
    }
  };

  // Get validation message
  const getValidationMessage = () => {
    if (cart.length === 0) return null;
    
    const messages = [];
    
    if (orderType === 'DINE_IN' && !selectedTable) {
      messages.push('⚠️ Select a table to continue');
    }
    
    if ((orderType === 'TAKEAWAY' || orderType === 'DELIVERY') && !customerInfo?.name) {
      messages.push('⚠️ Customer name is required');
    }
    
    if (orderType === 'DELIVERY' && !customerInfo?.address) {
      messages.push('⚠️ Delivery address is required');
    }

    return messages;
  };

  const validationMessages = getValidationMessage();
  const requirePaymentFirst = workflowSettings?.requirePaymentAtOrder ?? false;

  return (
    <div className="w-80 bg-white shadow-lg flex flex-col h-full border-l">
      {/* Header */}
      <div className={`bg-gradient-to-r ${getOrderTypeColor()} text-white p-4`}>
        <div className="flex items-center gap-2 mb-2">
          {getOrderTypeIcon()}
          <h2 className="text-xl font-bold">Order Cart</h2>
        </div>
        <p className="text-sm text-white opacity-90">{getOrderTypeLabel()}</p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-white opacity-90">{cart.length} items</p>
          {requirePaymentFirst && (
            <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs font-semibold">
              QUICK SERVICE
            </span>
          )}
        </div>
      </div>

      {/* Validation Messages */}
      {validationMessages && validationMessages.length > 0 && (
        <div className="p-3 bg-yellow-50 border-b border-yellow-200">
          {validationMessages.map((msg, index) => (
            <div key={index} className="flex items-start gap-2 text-xs text-yellow-800 mb-1">
              <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>{msg}</span>
            </div>
          ))}
        </div>
      )}

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <div className="mb-4">
              <svg
                className="w-20 h-20 mx-auto text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <p className="font-semibold">Cart is empty</p>
            <p className="text-sm mt-1">Add items from menu</p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.menuItemId}
              className="bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 pr-2">
                  <h4 className="font-semibold text-sm leading-tight">{item.name}</h4>
                  <p className="text-blue-600 font-bold text-sm mt-1">₹{item.price.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => handleRemove(item.menuItemId)}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between bg-white rounded-lg p-2 border border-gray-200">
                <button
                  onClick={() =>
                    handleQuantityChange(item.menuItemId, item.quantity - 1)
                  }
                  className="text-gray-600 hover:bg-gray-100 p-1.5 rounded transition disabled:opacity-50"
                  disabled={item.quantity <= 1}
                  title="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg min-w-[2rem] text-center">
                    {item.quantity}
                  </span>
                  <span className="text-xs text-gray-500">
                    {item.quantity > 1 ? 'items' : 'item'}
                  </span>
                </div>
                
                <button
                  onClick={() =>
                    handleQuantityChange(item.menuItemId, item.quantity + 1)
                  }
                  className="text-gray-600 hover:bg-gray-100 p-1.5 rounded transition"
                  title="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="text-right mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">Subtotal</p>
                <p className="text-sm font-bold text-gray-800">
                  ₹{item.subtotal.toFixed(2)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {cart.length > 0 && (
        <div className="border-t bg-gray-50">
          {/* Calculations */}
          <div className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax ({taxRate}%):</span>
              <span className="font-semibold">₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-lg font-bold">
              <span>Total:</span>
              <span className="text-blue-600">₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Workflow Info */}
          {requirePaymentFirst && (
            <div className="px-4 pb-3">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                <p className="text-xs text-orange-800">
                  💰 <strong>Payment required first</strong> - Quick Service Mode
                </p>
              </div>
            </div>
          )}

          {!requirePaymentFirst && (
            <div className="px-4 pb-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                <p className="text-xs text-blue-800">
                  📋 <strong>Payment after service</strong> - Full Service Mode
                </p>
              </div>
            </div>
          )}

          {/* Checkout Button */}
          <div className="p-4 pt-0">
            <button
              onClick={onCheckout}
              disabled={!canCheckout()}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-all transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                canCheckout()
                  ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-lg active:scale-95'
                  : 'bg-gray-400'
              }`}
            >
              {getButtonText()}
            </button>
          </div>

          {/* Additional Info */}
          <div className="px-4 pb-4">
            <div className="text-xs text-center text-gray-500 space-y-1">
              <p>✓ Items can be modified before checkout</p>
              {requirePaymentFirst ? (
                <p>💳 Payment will be processed immediately</p>
              ) : (
                <p>👨‍🍳 Order will be sent to kitchen</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty Cart Footer */}
      {cart.length === 0 && (
        <div className="p-4 border-t bg-gray-50 text-center text-xs text-gray-500">
          <p>Select items from the menu to get started</p>
        </div>
      )}
    </div>
  );
};

export default CartSidebar;