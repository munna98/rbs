// src/pages/Orders.tsx - FINAL VERSION (Both phases combined)

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useWorkflowSettings } from '../hooks/useWorkflowSettings'; // Phase 2
import {
  fetchTables,
  clearCart,
} from '../features/orders/orderSlice';
import { fetchMenuItems, fetchCategories } from '../features/menu/menuSlice';
import OrderTypeSelector from '../features/orders/components/OrderTypeSelector';
import TableSelector from '../features/orders/components/TableSelector';
import CustomerInfoForm from '../features/orders/components/CustomerInfoForm';
import MenuBrowser from '../features/orders/components/MenuBrowser';
import CartSidebar from '../features/orders/components/CartSidebar';
import CheckoutModal from '../features/orders/components/CheckoutModal'; // Only for Quick Service
import toast from 'react-hot-toast';

const Orders = () => {
  const dispatch = useAppDispatch();
  const { settings: workflowSettings } = useWorkflowSettings(); // Phase 2
  const {
    cart,
    selectedTable,
    tables,
    tax,
    orderType,
    customerInfo
  } = useAppSelector((state) => state.order);
  const { items: menuItems, categories } = useAppSelector((state) => state.menu);
  const { user } = useAppSelector((state) => state.auth);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchTables());
    dispatch(fetchMenuItems());
    dispatch(fetchCategories());
  }, [dispatch]);

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal + tax;

  // ========================================
  // PHASE 1: Core Order Creation (No Payment)
  // ========================================
  const handleCreateOrder = async () => {
    // Validation
    if (orderType === 'DINE_IN' && !selectedTable) {
      toast.error('Please select a table');
      return;
    }

    if ((orderType === 'DELIVERY' || orderType === 'TAKEAWAY') && !customerInfo) {
      toast.error('Please fill in customer information');
      return;
    }

    if (orderType === 'DELIVERY' && !customerInfo?.address) {
      toast.error('Delivery address is required');
      return;
    }

    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setIsLoading(true);
    try {
      // 1. CREATE ORDER (NO PAYMENT YET!)
      const orderResult = await window.electronAPI.createOrder({
        tableId: orderType === 'DINE_IN' ? selectedTable?.id : null,
        userId: user?.id,
        orderType,
        customerInfo: orderType !== 'DINE_IN' ? customerInfo : null,
        items: cart.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      if (!orderResult.success) {
        throw new Error(orderResult.error);
      }

      // 2. PRINT KOT (Check settings - Phase 2)
      const shouldPrintKOT = workflowSettings?.autoPrintKOT ?? true;
      
      if (shouldPrintKOT) {
        const delay = (workflowSettings?.kotPrintDelay ?? 0) * 1000;
        
        if (delay > 0) {
          toast.success(`KOT will print in ${delay/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        try {
          const printerResult = await window.electronAPI.getPrinterSettings();
          
          const kotData = {
            orderId: orderResult.data.id,
            kotNumber: orderResult.data.kotNumber,
            orderNumber: orderResult.data.orderNumber,
            tableNumber: selectedTable?.tableNumber,
            orderType,
            customerName: customerInfo?.name,
            items: cart.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              category: menuItems.find(m => m.id === item.menuItemId)?.category?.name || '',
            })),
            createdAt: new Date(),
            waiterName: user?.username,
          };

          // Check if confirmation required (Phase 2)
          const requireConfirmation = workflowSettings?.requireKOTPrintConfirmation ?? false;
          
          if (requireConfirmation) {
            const shouldPrint = window.confirm('Print KOT to kitchen?');
            if (!shouldPrint) {
              toast.success('KOT print skipped - order created');
              return;
            }
          }

          await window.electronAPI.printKOT({
            kotData,
            printerSettings: printerResult.data,
          });
          
          toast.success('KOT sent to kitchen! 👨‍🍳', {
            duration: 3000,
          });
        } catch (kotError) {
          console.error('KOT print error:', kotError);
          toast.error('Warning: KOT print failed, but order was created');
        }
      }

      // 3. AUTO-START PREPARING (Phase 2 - Optional)
      if (workflowSettings?.autoStartPreparing) {
        await window.electronAPI.updateOrderStatus({
          orderId: orderResult.data.id,
          status: 'PREPARING',
        });
        toast.success('Order auto-started in kitchen');
      }

      const orderTypeLabel = {
        DINE_IN: 'Dine-in',
        TAKEAWAY: 'Takeaway',
        DELIVERY: 'Delivery',
      }[orderType];

      toast.success(`${orderTypeLabel} order created! #${orderResult.data.orderNumber}`, {
        duration: 4000,
      });
      
      // 4. CLEAR CART
      dispatch(clearCart());
      
      if (orderType === 'DINE_IN') {
        dispatch(fetchTables());
      }
    } catch (error: any) {
      toast.error(error.message || 'Error creating order');
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================
  // PHASE 2: Quick Service Mode (Payment First)
  // ========================================
  const handleQuickServiceCheckout = async (data: { method: string; amount: number }) => {
    setIsLoading(true);
    try {
      // 1. CREATE ORDER
      const orderResult = await window.electronAPI.createOrder({
        tableId: orderType === 'DINE_IN' ? selectedTable?.id : null,
        userId: user?.id,
        orderType,
        customerInfo: orderType !== 'DINE_IN' ? customerInfo : null,
        items: cart.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      if (!orderResult.success) {
        throw new Error(orderResult.error);
      }

      // 2. RECORD PAYMENT IMMEDIATELY
      const paymentResult = await window.electronAPI.recordPayment({
        orderId: orderResult.data.id,
        amount: data.amount,
        method: data.method,
      });

      if (!paymentResult.success) {
        throw new Error(paymentResult.error);
      }

      // 3. PRINT KOT
      try {
        const printerResult = await window.electronAPI.getPrinterSettings();
        
        const kotData = {
          orderId: orderResult.data.id,
          kotNumber: orderResult.data.kotNumber,
          orderNumber: orderResult.data.orderNumber,
          tableNumber: selectedTable?.tableNumber,
          orderType,
          customerName: customerInfo?.name,
          items: cart.map((item) => ({
            name: item.name,
            quantity: item.quantity,
          })),
          createdAt: new Date(),
          waiterName: user?.username,
        };

        await window.electronAPI.printKOT({
          kotData,
          printerSettings: printerResult.data,
        });
      } catch (kotError) {
        console.error('KOT error:', kotError);
      }

      // 4. PRINT RECEIPT
      const restaurantResult = await window.electronAPI.getRestaurantSettings();
      const printerResult = await window.electronAPI.getPrinterSettings();

      if (restaurantResult.success && printerResult.success) {
        const receiptData = {
          orderId: orderResult.data.id,
          orderNumber: orderResult.data.orderNumber,
          tableNumber: selectedTable?.tableNumber,
          items: cart.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.subtotal,
          })),
          subtotal,
          tax,
          taxRate: 5,
          total,
          paymentMethod: data.method,
          amountPaid: data.amount,
          change: data.amount - total,
          cashier: user?.username || 'Unknown',
          date: new Date(),
          restaurantInfo: restaurantResult.data,
        };

        await window.electronAPI.printReceipt({
          receiptData,
          printerSettings: printerResult.data,
        });
      }

      toast.success('Order completed! Receipt printed.');
      dispatch(clearCart());
      setIsCheckoutOpen(false);

      if (orderType === 'DINE_IN') {
        dispatch(fetchTables());
      }
    } catch (error: any) {
      toast.error(error.message || 'Error processing order');
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================
  // MAIN BUTTON HANDLER (Decides which flow)
  // ========================================
  const handleCheckoutClick = () => {
    // Phase 2: Check workflow settings
    const requirePaymentFirst = workflowSettings?.requirePaymentAtOrder ?? false;
    
    if (requirePaymentFirst) {
      // Quick Service Mode - Open payment modal
      setIsCheckoutOpen(true);
    } else {
      // Full Service Mode - Just create order
      handleCreateOrder();
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white shadow p-6 border-b">
          <h1 className="text-3xl font-bold">New Order</h1>
          <p className="text-gray-600 mt-1">
            {/* Phase 2: Show workflow mode */}
            {workflowSettings?.requirePaymentAtOrder && (
              <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-semibold mr-2">
                QUICK SERVICE MODE
              </span>
            )}
            {orderType === 'DINE_IN' && selectedTable
              ? `Table ${selectedTable.tableNumber} - Capacity: ${selectedTable.capacity}`
              : orderType === 'TAKEAWAY'
                ? 'Takeaway Order - Customer Pickup'
                : orderType === 'DELIVERY'
                  ? 'Delivery Order - Home Delivery'
                  : 'Select order type to continue'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <OrderTypeSelector />
          </div>

          {orderType === 'DINE_IN' && (
            <div className="px-6 pb-6">
              <TableSelector tables={tables} selectedTable={selectedTable} />
            </div>
          )}

          {(orderType === 'TAKEAWAY' || orderType === 'DELIVERY') && (
            <div className="px-6 pb-6">
              <CustomerInfoForm />
            </div>
          )}

          <div className="px-6 pb-6">
            <div className="bg-white rounded-lg shadow">
              <MenuBrowser
                items={menuItems}
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar onCheckout={handleCheckoutClick} />

      {/* Checkout Modal (Only for Quick Service) */}
      {workflowSettings?.requirePaymentAtOrder && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          total={total}
          onClose={() => setIsCheckoutOpen(false)}
          onSubmit={handleQuickServiceCheckout}
          onSplitPayment={() => {
            toast.success('Split payment not available in Quick Service mode');
          }}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default Orders;