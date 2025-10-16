import { useState } from 'react';
import { Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Order } from '../types';

interface PrintReceiptButtonProps {
  order: Order;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button';
}

const PrintReceiptButton = ({
  order,
  size = 'md',
  variant = 'icon',
}: PrintReceiptButtonProps) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPrinting(true);

    try {
      const restaurantResult = await window.electronAPI.getRestaurantSettings();
      const printerResult = await window.electronAPI.getPrinterSettings();

      if (!restaurantResult.success || !printerResult.success) {
        throw new Error('Failed to load settings');
      }

      const receiptData = {
        orderId: order.id,
        orderNumber: order.id.slice(0, 8).toUpperCase(),
        tableNumber: order.table?.tableNumber,
        items:
          order.orderItems?.map((item) => ({
            name: item.menuItem?.name || 'Unknown',
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
          })) || [],
        subtotal: order.total / 1.05, // Assuming 5% tax
        tax: order.total * 0.05,
        taxRate: 5,
        total: order.total,
        paymentMethod: 'COMPLETED',
        amountPaid: order.total,
        change: 0,
        cashier: order.user?.username || 'Unknown',
        date: order.createdAt,
        restaurantInfo: {
          name: restaurantResult.data.name,
          address: restaurantResult.data.address,
          phone: restaurantResult.data.phone,
          gstNumber: restaurantResult.data.gstNumber,   
        },
      };

      await window.electronAPI.printReceipt({
        receiptData,
        printerSettings: printerResult.data,
      });

      toast.success('Receipt printed successfully!');
    } catch (error: any) {
      toast.error('Print failed: ' + error.message);
    } finally {
      setIsPrinting(false);
    }
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handlePrint}
        disabled={isPrinting}
        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition disabled:opacity-50"
        title="Print Receipt"
      >
        <Printer className={`${sizeClasses[size]} ${isPrinting ? 'animate-pulse' : ''}`} />
      </button>
    );
  }

  return (
    <button
      onClick={handlePrint}
      disabled={isPrinting}
      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
    >
      <Printer className={sizeClasses[size]} />
      {isPrinting ? 'Printing...' : 'Print Receipt'}
    </button>
  );
};

export default PrintReceiptButton;