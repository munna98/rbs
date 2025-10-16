import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchTables,
  clearCart,
} from '../features/orders/orderSlice';
import { fetchMenuItems } from '../features/menu/menuSlice';
import { fetchCategories } from '../features/menu/menuSlice';
import TableSelector from '../features/orders/components/TableSelector';
import MenuBrowser from '../features/orders/components/MenuBrowser';
import CartSidebar from '../features/orders/components/CartSidebar';
import CheckoutModal from '../features/orders/components/CheckoutModal';
import toast from 'react-hot-toast';

const Orders = () => {
  const dispatch = useAppDispatch();
  const { cart, selectedTable, tables, tax, taxRate } = useAppSelector(
    (state) => state.order
  );
  const { items: menuItems } = useAppSelector((state) => state.menu);
  const { categories } = useAppSelector((state) => state.menu);
  const { user } = useAppSelector((state) => state.auth);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    dispatch(fetchTables());
    dispatch(fetchMenuItems());
    dispatch(fetchCategories());
  }, [dispatch]);

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal + tax;

  const handleCheckout = async (data: { method: string; amount: number }) => {
    if (!selectedTable) {
      toast.error('Please select a table');
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
        tableId: selectedTable.id,
        userId: user?.id,
        items: cart.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      if (!orderResult.success) {
        throw new Error(orderResult.error);
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

      // Get restaurant settings
      const restaurantResult = await window.electronAPI.getRestaurantSettings();
      const printerResult = await window.electronAPI.getPrinterSettings();

      // Print receipt
      if (restaurantResult.success && printerResult.success) {
        const receiptData = {
          orderId: orderResult.data.id,
          orderNumber: orderResult.data.id.slice(0, 8).toUpperCase(),
          tableNumber: selectedTable.tableNumber,
          items: cart.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.subtotal,
          })),
          subtotal,
          tax,
          taxRate,
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
          toast.success('Receipt printed successfully!');
        } catch (printError) {
          toast.error('Order completed but receipt printing failed');
          console.error('Print error:', printError);
        }
      }

      toast.success('Order completed successfully!');
      dispatch(clearCart());
      setIsCheckoutOpen(false);
      dispatch(fetchTables());
    } catch (error: any) {
      toast.error(error.message || 'Error processing order');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintPreview = async () => {
  if (!selectedTable || cart.length === 0) {
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
        tableNumber: selectedTable.tableNumber,
        items: cart.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.subtotal,
        })),
        subtotal,
        tax,
        taxRate,
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


  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow p-6 border-b">
          <h1 className="text-3xl font-bold">New Order</h1>
          <p className="text-gray-600 mt-1">
            {selectedTable
              ? `Table ${selectedTable.tableNumber} - Capacity: ${selectedTable.capacity}`
              : 'Select a table to start'}
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Table Selection */}
          <div className="p-6">
            <TableSelector tables={tables} selectedTable={selectedTable} />
          </div>

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
        onPrintPreview={handlePrintPreview}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Orders;