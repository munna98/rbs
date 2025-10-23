// src/pages/ActiveOrders.tsx - REFACTORED WITH WORKFLOW INTEGRATION

import { useEffect, useState } from 'react';
import { Clock, Search, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Order } from '../types';
import OrderCard from '../features/orders/components/OrderCard';
import PaymentModal from '../features/orders/components/PaymentModal';
import SplitPaymentModal from '../features/orders/components/SplitPaymentModal';
import { useOrderWorkflow } from '../hooks/useOrderWorkflow';

const ActiveOrders = () => {
  const workflow = useOrderWorkflow();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Payment states
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [splitPaymentModalOpen, setSplitPaymentModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const result = await window.electronAPI.getOrders();
      if (result.success) {
        const activeOrders = result.data.filter(
          (order: Order) => !['COMPLETED', 'CANCELLED'].includes(order.status)
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

  // ==============================================
  // STATUS CHANGE WITH WORKFLOW VALIDATION
  // ==============================================
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // ✅ NEW: Check if changing to SERVED requires payment
    if (newStatus === 'SERVED') {
      const { allowed, reason } = await workflow.canChangeToServed(order);
      if (!allowed) {
        toast.error(reason || 'Cannot change to SERVED');
        return;
      }
    }

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

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

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

  // ==============================================
  // PAYMENT WITH AUTO-MARK SERVED
  // ==============================================
  const handleSinglePayment = async (data: { method: string; amount: number }) => {
    if (!selectedOrder) return;

    // ✅ Validate partial payment
    if (data.amount < selectedOrder.total && !workflow.allowsPartialPayment()) {
      toast.error('Partial payments are not allowed');
      return;
    }

    try {
      const result = await window.electronAPI.recordPayment({
        orderId: selectedOrder.id,
        amount: data.amount,
        method: data.method,
      });

      if (result.success) {
        toast.success('Payment recorded successfully!');

        // ✅ NEW: Auto-mark as SERVED if setting enabled
        if (workflow.shouldAutoMarkServed() && data.amount >= selectedOrder.total) {
          await window.electronAPI.updateOrderStatus({
            orderId: selectedOrder.id,
            status: 'SERVED',
          });
          toast.success('Order automatically marked as served');
        }

        // Print receipt
        await printReceipt(
          selectedOrder,
          data.amount,
          data.method,
          Math.max(0, data.amount - selectedOrder.total)
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

  const handleSplitPaymentSubmit = async (
    payments: Array<{ id: string; method: string; amount: number }>
  ) => {
    if (!selectedOrder) return;

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    if (totalPaid < selectedOrder.total) {
      toast.error(`Remaining: ₹${(selectedOrder.total - totalPaid).toFixed(2)}`);
      return;
    }

    if (totalPaid > selectedOrder.total) {
      toast.error('Total paid exceeds bill amount');
      return;
    }

    try {
      // Record each payment
      for (let i = 0; i < payments.length; i++) {
        const payment = payments[i];
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

      toast.success(`Payment completed with ${payments.length} methods!`);

      // ✅ NEW: Auto-mark as SERVED if setting enabled
      if (workflow.shouldAutoMarkServed()) {
        await window.electronAPI.updateOrderStatus({
          orderId: selectedOrder.id,
          status: 'SERVED',
        });
        toast.success('Order automatically marked as served');
      }

      // Print receipt with split payments
      await printReceiptWithSplit(selectedOrder, payments);

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
          items:
            order.orderItems?.map((item) => ({
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
          items:
            order.orderItems?.map((item) => ({
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

    const matchesStatus =
      statusFilter === 'ALL' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
          <p className="text-gray-600 mt-1">
            Manage and track ongoing orders
            {/* ✅ Show workflow mode */}
            <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {workflow.getWorkflowModeName()}
            </span>
          </p>
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
            // ✅ Use workflow to get next status
            const nextStatus = workflow.getNextStatus(order.status);

            return (
              <OrderCard
                key={order.id}
                order={order}
                nextStatus={nextStatus}
                onStatusChange={handleStatusChange}
                onPayment={(order) => {
                  setSelectedOrder(order);
                  setPaymentModalOpen(true);
                }}
                onSplitPayment={(order) => {
                  setSelectedOrder(order);
                  setSplitPaymentModalOpen(true);
                }}
                onPrintReceipt={handlePrintReceiptOnly}
                onDelete={handleDeleteOrder}
                allowSplitPayment={workflow.allowsSplitPayment()}
              />
            );
          })}
        </div>
      )}

      {/* Payment Modals */}
      <PaymentModal
        isOpen={paymentModalOpen}
        order={selectedOrder}
        allowPartialPayment={workflow.allowsPartialPayment()}
        onClose={() => setPaymentModalOpen(false)}
        onSubmit={handleSinglePayment}
      />

      <SplitPaymentModal
        isOpen={splitPaymentModalOpen}
        order={selectedOrder}
        onClose={() => setSplitPaymentModalOpen(false)}
        onSubmit={handleSplitPaymentSubmit}
      />
    </div>
  );
};

export default ActiveOrders;