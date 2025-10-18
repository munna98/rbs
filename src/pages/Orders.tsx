import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchTables,
  clearCart,
} from '../features/orders/orderSlice';
import { fetchMenuItems } from '../features/menu/menuSlice';
import { fetchCategories } from '../features/menu/menuSlice';
import OrderTypeSelector from '../features/orders/components/OrderTypeSelector';
import TableSelector from '../features/orders/components/TableSelector';
import CustomerInfoForm from '../features/orders/components/CustomerInfoForm';
import MenuBrowser from '../features/orders/components/MenuBrowser';
import CartSidebar from '../features/orders/components/CartSidebar';
import CheckoutModal from '../features/orders/components/CheckoutModal';
import toast from 'react-hot-toast';
import SplitPaymentModal from '../features/orders/components/SplitPaymentModal';

const Orders = () => {
  const dispatch = useAppDispatch();
  const {
    cart,
    selectedTable,
    tables,
    tax,
    orderType,
    customerInfo
  } = useAppSelector((state) => state.order);
  const { items: menuItems } = useAppSelector((state) => state.menu);
  const { categories } = useAppSelector((state) => state.menu);
  const { user } = useAppSelector((state) => state.auth);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSplitPaymentOpen, setIsSplitPaymentOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    dispatch(fetchTables());
    dispatch(fetchMenuItems());
    dispatch(fetchCategories());
  }, [dispatch]);

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal + tax;

  const handleCheckout = async (data: { method: string; amount: number }) => {
    // Validate based on order type
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
    // Create order
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

    // NEW: Print KOT to kitchen
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
          notes: '', // Can be added later
          category: '', // Can be fetched from menu item
        })),
        notes: '',
        createdAt: new Date(),
        waiterName: user?.username,
      };

      await window.electronAPI.printKOT({
        kotData,
        printerSettings: printerResult.data,
      });
      
      toast.success('KOT sent to kitchen!');
    } catch (kotError) {
      console.error('KOT print error:', kotError);
      // Don't fail the order if KOT fails
    }

      // Record payment
      const paymentResult = await window.electronAPI.recordPayment({
        orderId: orderResult.data.id,
        amount: data.amount,
        method: data.method,
      });

      if (!paymentResult.success) {
        throw new Error(paymentResult.error);
      }

      // Get settings for receipt
      const restaurantResult = await window.electronAPI.getRestaurantSettings();
      const printerResult = await window.electronAPI.getPrinterSettings();

      // Print receipt
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
          restaurantInfo: {
            name: restaurantResult.data.name,
            address: restaurantResult.data.address,
            phone: restaurantResult.data.phone,
            gstNumber: restaurantResult.data.gstNumber,
          },
        };

        try {
          await window.electronAPI.printReceipt({
            receiptData,
            printerSettings: printerResult.data,
          });
        } catch (printError) {
          console.error('Print error:', printError);
        }
      }

      const orderTypeLabel = {
        DINE_IN: 'Table',
        TAKEAWAY: 'Takeaway',
        DELIVERY: 'Delivery',
      }[orderType];

      toast.success(`${orderTypeLabel} order completed successfully!`);
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

  const handlePrintPreview = async () => {
    if (cart.length === 0) {
      toast.error('No items in cart');
      return;
    }

    try {
      const restaurantResult = await window.electronAPI.getRestaurantSettings();
      const printerResult = await window.electronAPI.getPrinterSettings();

      if (restaurantResult.success && printerResult.success) {
        const receiptData = {
          orderId: 'PREVIEW',
          orderNumber: 'PREVIEW',
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
          paymentMethod: 'CASH',
          amountPaid: total,
          change: 0,
          cashier: user?.username || 'Unknown',
          date: new Date(),
          restaurantInfo: {
            name: restaurantResult.data.name,
            address: restaurantResult.data.address,
            phone: restaurantResult.data.phone,
            gstNumber: restaurantResult.data.gstNumber,
          },
        };

        await window.electronAPI.printPreview({
          receiptData,
          printerSettings: printerResult.data,
        });
      }
    } catch (error: any) {
      toast.error('Preview failed: ' + error.message);
    }
  };

  const handleSplitPayment = async (payments: any[]) => {
    // Validation
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setIsLoading(true);
    try {
      // Create order first
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

      // Record multiple payments
      for (let i = 0; i < payments.length; i++) {
        const payment = payments[i];
        const paymentResult = await window.electronAPI.recordPayment({
          orderId: orderResult.data.id,
          amount: payment.amount,
          method: payment.method,
          splitNumber: i + 1,
        });

        if (!paymentResult.success) {
          throw new Error(`Payment ${i + 1} failed: ${paymentResult.error}`);
        }
      }

      toast.success(`Order completed with ${payments.length} payment methods!`);
      dispatch(clearCart());
      setIsSplitPaymentOpen(false);
      setIsCheckoutOpen(false);

      if (orderType === 'DINE_IN') {
        dispatch(fetchTables());
      }
    } catch (error: any) {
      toast.error(error.message || 'Error processing split payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow p-6 border-b">
          <h1 className="text-3xl font-bold">New Order</h1>
          <p className="text-gray-600 mt-1">
            {orderType === 'DINE_IN' && selectedTable
              ? `Table ${selectedTable.tableNumber} - Capacity: ${selectedTable.capacity}`
              : orderType === 'TAKEAWAY'
                ? 'Takeaway Order - Customer Pickup'
                : orderType === 'DELIVERY'
                  ? 'Delivery Order - Home Delivery'
                  : 'Select order type to continue'}
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Order Type Selection */}
          <div className="p-6">
            <OrderTypeSelector />
          </div>

          {/* Table Selection (only for dine-in) */}
          {orderType === 'DINE_IN' && (
            <div className="px-6 pb-6">
              <TableSelector tables={tables} selectedTable={selectedTable} />
            </div>
          )}

          {/* Customer Info Form (for takeaway/delivery) */}
          {(orderType === 'TAKEAWAY' || orderType === 'DELIVERY') && (
            <div className="px-6 pb-6">
              <CustomerInfoForm />
            </div>
          )}

          {/* Menu Browser */}
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

      {/* Cart Sidebar - Fixed on right */}
      <CartSidebar onCheckout={() => setIsCheckoutOpen(true)} />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        total={total}
        onClose={() => setIsCheckoutOpen(false)}
        onSubmit={handleCheckout}
        onSplitPayment={() => {
          setIsCheckoutOpen(false);
          setIsSplitPaymentOpen(true);
        }}
        onPrintPreview={handlePrintPreview}
        isLoading={isLoading}
      />

      {/* Split Payment Modal */}
      <SplitPaymentModal
        isOpen={isSplitPaymentOpen}
        total={total}
        onClose={() => setIsSplitPaymentOpen(false)}
        onSubmit={handleSplitPayment}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Orders;