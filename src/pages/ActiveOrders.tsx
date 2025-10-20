// src/pages/ActiveOrders.tsx 

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Edit,
  Trash2,
  CheckCircle,
  Search,
  RefreshCw,
  CreditCard,
  Printer,
  DollarSign,
  Split,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { Order } from '../types';
import KOTBadge from '../components/KOTBadge';
import { useWorkflowSettings } from '../hooks/useWorkflowSettings';

const ActiveOrders = () => {
  const navigate = useNavigate();
  const { settings: workflowSettings } = useWorkflowSettings();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Payment Modal States
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'UPI'>('CASH');
  
  // Split Payment States
  const [splitPaymentModalOpen, setSplitPaymentModalOpen] = useState(false);
  const [splitPayments, setSplitPayments] = useState<Array<{
    id: string;
    method: 'CASH' | 'CARD' | 'UPI';
    amount: number;
  }>>([]);

  useEffect(() => {
    loadOrders();
    
    // Auto-refresh every 15 seconds
    const interval = setInterval(loadOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const result = await window.electronAPI.getOrders();
      if (result.success) {
        const activeOrders = result.data.filter(
          (order: Order) =>
            !['COMPLETED', 'CANCELLED'].includes(order.status)
        );
        setOrders(activeOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const result = await window.electronAPI.updateOrder({
        id: orderId,
        status: 'CANCELLED',
      });

      if (result.success) {
        toast.success('Order cancelled');
        loadOrders();
      } else {
        toast.error(result.error || 'Failed to cancel order');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error cancelling order');
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const result = await window.electronAPI.updateOrderStatus({
        orderId,
        status: newStatus,
      });

      if (result.success) {
        toast.success(`Order marked as ${newStatus.toLowerCase()}`);
        loadOrders();
      } else {
        toast.error(result.error || 'Failed to update status');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error updating status');
    }
  };

  // ==========================================
  // PAYMENT FUNCTIONS
  // ==========================================
  
  const openPaymentModal = (order: Order) => {
    setSelectedOrder(order);
    setPaymentAmount(order.total);
    setPaymentMethod('CASH');
    setPaymentModalOpen(true);
  };

  const handleSinglePayment = async () => {
    if (!selectedOrder) return;

    if (paymentAmount < selectedOrder.total) {
      // Check if partial payments are allowed
      if (!workflowSettings?.allowPartialPayment) {
        toast.error('Partial payments are not allowed');
        return;
      }
    }

    try {
      const result = await window.electronAPI.recordPayment({
        orderId: selectedOrder.id,
        amount: paymentAmount,
        method: paymentMethod,
      });

      if (result.success) {
        toast.success('Payment recorded successfully!');
        
        // Print receipt
        await printReceipt(
          selectedOrder, 
          paymentAmount, 
          paymentMethod, 
          Math.max(0, paymentAmount - selectedOrder.total)
        );
        
        setPaymentModalOpen(false);
        loadOrders();
      } else {
        toast.error(result.error || 'Payment failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error processing payment');
    }
  };

  const openSplitPaymentModal = (order: Order) => {
    if (!workflowSettings?.allowSplitPayment) {
      toast.error('Split payment is not enabled');
      return;
    }

    setSelectedOrder(order);
    setSplitPayments([
      {
        id: crypto.randomUUID(),
        method: 'CASH',
        amount: order.total,
      },
    ]);
    setSplitPaymentModalOpen(true);
  };

  const handleAddSplitPayment = () => {
    if (!selectedOrder) return;
    
    const totalPaid = splitPayments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = selectedOrder.total - totalPaid;
    
    if (remaining <= 0) {
      toast.error('Total amount already covered');
      return;
    }

    setSplitPayments([
      ...splitPayments,
      {
        id: crypto.randomUUID(),
        method: 'CASH',
        amount: remaining,
      },
    ]);
  };

  const handleRemoveSplitPayment = (id: string) => {
    if (splitPayments.length === 1) {
      toast.error('At least one payment method required');
      return;
    }
    setSplitPayments(splitPayments.filter(p => p.id !== id));
  };

  const handleSplitPaymentSubmit = async () => {
    if (!selectedOrder) return;

    const totalPaid = splitPayments.reduce((sum, p) => sum + p.amount, 0);
    
    if (totalPaid < selectedOrder.total) {
      toast.error(`Remaining amount: ₹${(selectedOrder.total - totalPaid).toFixed(2)}`);
      return;
    }

    if (totalPaid > selectedOrder.total) {
      toast.error('Total paid exceeds bill amount');
      return;
    }

    try {
      // Record each payment
      for (let i = 0; i < splitPayments.length; i++) {
        const payment = splitPayments[i];
        const result = await window.electronAPI.recordPayment({
          orderId: selectedOrder.id,
          amount: payment.amount,
          method: payment.method,
          splitNumber: i + 1,
        });

        if (!result.success) {
          throw new Error(`Payment ${i + 1} failed: ${result.error}`);
        }
      }

      toast.success(`Payment completed with ${splitPayments.length} methods!`);
      
      // Print receipt showing split payments
      await printReceiptWithSplit(selectedOrder, splitPayments);
      
      setSplitPaymentModalOpen(false);
      loadOrders();
    } catch (error: any) {
      toast.error(error.message || 'Error processing split payment');
    }
  };

  const printReceipt = async (
    order: Order,
    amountPaid: number,
    method: string,
    change: number
  ) => {
    try {
      const restaurantResult = await window.electronAPI.getRestaurantSettings();
      const printerResult = await window.electronAPI.getPrinterSettings();

      if (restaurantResult.success && printerResult.success) {
        const receiptData = {
          orderId: order.id,
          orderNumber: order.orderNumber || order.id.slice(0, 8),
          tableNumber: order.table?.tableNumber,
          items: order.orderItems?.map(item => ({
            name: item.menuItem?.name || 'Unknown',
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
          })) || [],
          subtotal: order.total / 1.05,
          tax: order.total * 0.05,
          taxRate: 5,
          total: order.total,
          paymentMethod: method,
          amountPaid: amountPaid,
          change: change,
          cashier: 'Current User',
          date: new Date(),
          restaurantInfo: restaurantResult.data,
        };

        await window.electronAPI.printReceipt({
          receiptData,
          printerSettings: printerResult.data,
        });
      }
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Receipt print failed');
    }
  };

  const printReceiptWithSplit = async (
    order: Order,
    payments: Array<{ method: string; amount: number }>
  ) => {
    try {
      const restaurantResult = await window.electronAPI.getRestaurantSettings();
      const printerResult = await window.electronAPI.getPrinterSettings();

      if (restaurantResult.success && printerResult.success) {
        const receiptData = {
          orderId: order.id,
          orderNumber: order.orderNumber || order.id.slice(0, 8),
          tableNumber: order.table?.tableNumber,
          items: order.orderItems?.map(item => ({
            name: item.menuItem?.name || 'Unknown',
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
          })) || [],
          subtotal: order.total / 1.05,
          tax: order.total * 0.05,
          taxRate: 5,
          total: order.total,
          paymentMethod: 'SPLIT',
          amountPaid: order.total,
          change: 0,
          cashier: 'Current User',
          date: new Date(),
          restaurantInfo: restaurantResult.data,
          splitPayments: payments,
        };

        await window.electronAPI.printReceipt({
          receiptData,
          printerSettings: printerResult.data,
        });
      }
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Receipt print failed');
    }
  };

  const handlePrintReceiptOnly = async (order: Order) => {
    await printReceipt(order, order.total, 'COMPLETED', 0);
    toast.success('Receipt printed');
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.table?.tableNumber.toString().includes(searchQuery);

    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'PENDING':
        return 'PREPARING';
      case 'PREPARING':
        return 'READY';
      case 'READY':
        return 'SERVED';
      case 'SERVED':
        return null; // Payment required before COMPLETED
      default:
        return null;
    }
  };

  const statusCounts = {
    ALL: orders.length,
    PENDING: orders.filter((o) => o.status === 'PENDING').length,
    PREPARING: orders.filter((o) => o.status === 'PREPARING').length,
    READY: orders.filter((o) => o.status === 'READY').length,
    SERVED: orders.filter((o) => o.status === 'SERVED').length,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Active Orders</h1>
          <p className="text-gray-600 mt-1">Manage and track ongoing orders</p>
        </div>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {['ALL', 'PENDING', 'PREPARING', 'READY', 'SERVED'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`p-4 rounded-lg border-2 transition ${
              statusFilter === status
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white border-gray-200 hover:border-blue-300'
            }`}
          >
            <p className="text-2xl font-bold">
              {statusCounts[status as keyof typeof statusCounts]}
            </p>
            <p className="text-sm">{status}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by order number, customer, or table..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Orders Grid */}
      {loading && orders.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg font-semibold">No active orders</p>
          <p className="text-gray-400 mt-2">
            {searchQuery || statusFilter !== 'ALL'
              ? 'Try adjusting your filters'
              : 'New orders will appear here'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => {
            const nextStatus = getNextStatus(order.status);
            
            return (
              <div
                key={order.id}
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
                        <div
                          key={item.id}
                          className="flex justify-between text-sm"
                        >
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
                        onClick={() => handleStatusChange(order.id, nextStatus)}
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
                          onClick={() => openPaymentModal(order)}
                          className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm font-semibold"
                        >
                          <DollarSign className="w-4 h-4" />
                          Pay
                        </button>
                        
                        {workflowSettings?.allowSplitPayment && (
                          <button
                            onClick={() => openSplitPaymentModal(order)}
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
                      onClick={() => handlePrintReceiptOnly(order)}
                      className="flex items-center justify-center gap-1 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
                      title="Print Receipt"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {/* Cancel Button */}
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="px-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      title="Cancel Order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Single Payment Modal */}
      {paymentModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <h2 className="text-2xl font-bold mb-4">Take Payment</h2>
            
            <div className="mb-4">
              <p className="text-gray-600">Order: {selectedOrder.orderNumber}</p>
              <p className="text-3xl font-bold text-blue-600">₹{selectedOrder.total.toFixed(2)}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Payment Method</label>
              <div className="space-y-2">
                {['CASH', 'CARD', 'UPI'].map((method) => (
                  <label key={method} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
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
              <label className="block text-sm font-semibold mb-2">Amount Received (₹)</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                step="0.01"
                min={workflowSettings?.allowPartialPayment ? 0 : selectedOrder.total}
              />
              {paymentAmount > selectedOrder.total && (
                <p className="text-sm text-green-600 mt-1">
                  Change: ₹{(paymentAmount - selectedOrder.total).toFixed(2)}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="flex-1 px-4 py-3 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSinglePayment}
                disabled={paymentAmount < selectedOrder.total && !workflowSettings?.allowPartialPayment}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-semibold"
              >
                Complete Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Split Payment Modal */}
      {splitPaymentModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Split Payment</h2>
              <p className="text-gray-600">Order: {selectedOrder.orderNumber}</p>
            </div>

            <div className="p-6">
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ₹{selectedOrder.total.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Total Paid:</span>
                  <span className="font-semibold">
                    ₹{splitPayments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Remaining:</span>
                  <span className={`font-semibold ${
                    (selectedOrder.total - splitPayments.reduce((sum, p) => sum + p.amount, 0)) > 0
                      ? 'text-red-600'
                      : 'text-green-600'
                  }`}>
                    ₹{Math.abs(selectedOrder.total - splitPayments.reduce((sum, p) => sum + p.amount, 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {splitPayments.map((payment, index) => (
                  <div key={payment.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <span className="font-bold text-blue-600 w-8">#{index + 1}</span>
                    <select
                      value={payment.method}
                      onChange={(e) => {
                        const updated = [...splitPayments];
                        updated[index].method = e.target.value as any;
                        setSplitPayments(updated);
                      }}
                      className="px-3 py-2 border rounded-lg"
                    >
                      <option value="CASH">Cash</option>
                      <option value="CARD">Card</option>
                      <option value="UPI">UPI</option>
                    </select>
                    <input
                      type="number"
                      value={payment.amount}
                      onChange={(e) => {
                        const updated = [...splitPayments];
                        updated[index].amount = parseFloat(e.target.value) || 0;
                        setSplitPayments(updated);
                      }}
                      className="flex-1 px-3 py-2 border rounded-lg"
                      step="0.01"
                      min="0"
                    />
                    {splitPayments.length > 1 && (
                      <button
                        onClick={() => handleRemoveSplitPayment(payment.id)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddSplitPayment}
                className="w-full mb-4 border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition"
              >
                + Add Payment Method
              </button>
            </div>

            <div className="p-6 border-t flex gap-3">
              <button
                onClick={() => setSplitPaymentModalOpen(false)}
                className="flex-1 px-4 py-3 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSplitPaymentSubmit}
                disabled={splitPayments.reduce((sum, p) => sum + p.amount, 0) !== selectedOrder.total}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-semibold"
              >
                Complete Split Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveOrders;