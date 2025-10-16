import pkg from 'electron-pos-printer';
import QRCode from 'qrcode';

const { PosPrinter } = pkg;


const printService = {
  async generateReceipt(receiptData, printerSettings = {}) {
    try {
      const {
        orderId,
        orderNumber,
        tableNumber,
        items,
        subtotal,
        tax,
        taxRate,
        total,
        paymentMethod,
        amountPaid,
        change,
        cashier,
        date,
        restaurantInfo,
      } = receiptData;

      const paperWidth = printerSettings.paperWidth || 80; // 80mm default

      // Generate QR code for order
      const qrCode = await QRCode.toDataURL(orderId);

      // Build receipt data
      const data = [
        {
          type: 'text',
          value: restaurantInfo.name,
          style: {
            fontFamily: 'monospace',
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginTop: '10px',
          },
        },
        {
          type: 'text',
          value: '================================',
          style: { textAlign: 'center' },
        },
      ];

      // Restaurant info
      if (restaurantInfo.address) {
        data.push({
          type: 'text',
          value: restaurantInfo.address,
          style: {
            textAlign: 'center',
            fontSize: '12px',
            marginBottom: '5px',
          },
        });
      }

      if (restaurantInfo.phone) {
        data.push({
          type: 'text',
          value: `Tel: ${restaurantInfo.phone}`,
          style: {
            textAlign: 'center',
            fontSize: '12px',
            marginBottom: '5px',
          },
        });
      }

      if (restaurantInfo.gstNumber) {
        data.push({
          type: 'text',
          value: `GST: ${restaurantInfo.gstNumber}`,
          style: {
            textAlign: 'center',
            fontSize: '12px',
            marginBottom: '5px',
          },
        });
      }

      data.push(
        {
          type: 'text',
          value: '================================',
          style: { textAlign: 'center', marginTop: '10px' },
        },
        {
          type: 'text',
          value: `Order #: ${orderNumber}`,
          style: { fontWeight: 'bold', marginTop: '10px' },
        }
      );

      if (tableNumber) {
        data.push({
          type: 'text',
          value: `Table: ${tableNumber}`,
          style: { fontWeight: 'bold' },
        });
      }

      data.push(
        {
          type: 'text',
          value: `Date: ${new Date(date).toLocaleString()}`,
          style: { fontSize: '12px' },
        },
        {
          type: 'text',
          value: `Cashier: ${cashier}`,
          style: { fontSize: '12px', marginBottom: '10px' },
        },
        {
          type: 'text',
          value: '================================',
          style: { textAlign: 'center' },
        },
        {
          type: 'text',
          value: 'ITEMS',
          style: {
            fontWeight: 'bold',
            textAlign: 'center',
            marginTop: '10px',
            marginBottom: '10px',
          },
        },
        {
          type: 'text',
          value: '================================',
          style: { textAlign: 'center' },
        }
      );

      // Items table
      items.forEach((item) => {
        data.push(
          {
            type: 'text',
            value: item.name,
            style: { fontWeight: 'bold', marginTop: '5px' },
          },
          {
            type: 'text',
            value: `  ${item.quantity} x ₹${item.price.toFixed(2)} = ₹${item.total.toFixed(2)}`,
            style: { fontSize: '12px', marginBottom: '5px' },
          }
        );
      });

      data.push(
        {
          type: 'text',
          value: '================================',
          style: { textAlign: 'center', marginTop: '10px' },
        },
        {
          type: 'text',
          value: `Subtotal:               ₹${subtotal.toFixed(2)}`,
          style: { marginTop: '10px' },
        },
        {
          type: 'text',
          value: `Tax (${taxRate}%):                ₹${tax.toFixed(2)}`,
        },
        {
          type: 'text',
          value: '--------------------------------',
        },
        {
          type: 'text',
          value: `TOTAL:                  ₹${total.toFixed(2)}`,
          style: { fontWeight: 'bold', fontSize: '16px', marginTop: '5px' },
        },
        {
          type: 'text',
          value: '================================',
          style: { textAlign: 'center', marginTop: '10px' },
        },
        {
          type: 'text',
          value: `Payment Method: ${paymentMethod}`,
          style: { marginTop: '10px' },
        },
        {
          type: 'text',
          value: `Amount Paid:            ₹${amountPaid.toFixed(2)}`,
        }
      );

      if (change > 0) {
        data.push({
          type: 'text',
          value: `Change:                 ₹${change.toFixed(2)}`,
          style: { fontWeight: 'bold' },
        });
      }

      // QR Code
      data.push(
        {
          type: 'text',
          value: '================================',
          style: { textAlign: 'center', marginTop: '20px' },
        },
        {
          type: 'image',
          path: qrCode,
          position: 'center',
          width: '120px',
          height: '120px',
        },
        {
          type: 'text',
          value: 'Scan for Order Details',
          style: { textAlign: 'center', fontSize: '12px', marginTop: '5px' },
        },
        {
          type: 'text',
          value: '================================',
          style: { textAlign: 'center', marginTop: '10px' },
        },
        {
          type: 'text',
          value: 'Thank you for dining with us!',
          style: {
            textAlign: 'center',
            fontWeight: 'bold',
            marginTop: '20px',
            marginBottom: '10px',
          },
        },
        {
          type: 'text',
          value: 'Please visit again!',
          style: {
            textAlign: 'center',
            fontSize: '12px',
            marginBottom: '20px',
          },
        }
      );

      return data;
    } catch (error) {
      throw error;
    }
  },

  async printReceipt(receiptData, printerSettings = {}) {
    try {
      const data = await this.generateReceipt(receiptData, printerSettings);

      const options = {
        preview: false,
        width: `${printerSettings.paperWidth || 80}mm`,
        margin: '0 0 0 0',
        copies: printerSettings.copies || 1,
        printerName: printerSettings.printerName || undefined,
        timeOutPerLine: 400,
        silent: true,
      };

      await PosPrinter.print(data, options);

      // Open cash drawer if enabled
      if (printerSettings.autoOpenDrawer) {
        await this.openCashDrawer(printerSettings.printerName);
      }

      return { success: true };
    } catch (error) {
      throw error;
    }
  },

  async printPreview(receiptData, printerSettings = {}) {
    try {
      const data = await this.generateReceipt(receiptData, printerSettings);

      const options = {
        preview: true,
        width: `${printerSettings.paperWidth || 80}mm`,
        margin: '0 0 0 0',
        copies: 1,
        silent: false,
      };

      await PosPrinter.print(data, options);

      return { success: true };
    } catch (error) {
      throw error;
    }
  },

  async openCashDrawer(printerName) {
    try {
      // ESC/POS command to open cash drawer
      const data = [
        {
          type: 'text',
          value: '\x1B\x70\x00\x19\xFA', // ESC p 0 25 250
        },
      ];

      const options = {
        preview: false,
        printerName: printerName || undefined,
        silent: true,
      };

      await PosPrinter.print(data, options);
    } catch (error) {
      console.error('Error opening cash drawer:', error);
    }
  },

  async getAvailablePrinters() {
    try {
      const printers = await PosPrinter.getPrinters();
      return printers;
    } catch (error) {
      throw error;
    }
  },

  async testPrint(printerName) {
    try {
      const data = [
        {
          type: 'text',
          value: 'TEST PRINT',
          style: {
            fontWeight: 'bold',
            textAlign: 'center',
            fontSize: '18px',
            marginTop: '10px',
            marginBottom: '10px',
          },
        },
        {
          type: 'text',
          value: '================================',
          style: { textAlign: 'center' },
        },
        {
          type: 'text',
          value: 'This is a test print',
          style: { textAlign: 'center', marginTop: '10px', marginBottom: '10px' },
        },
        {
          type: 'text',
          value: `Date: ${new Date().toLocaleString()}`,
          style: { textAlign: 'center', marginBottom: '10px' },
        },
        {
          type: 'text',
          value: '================================',
          style: { textAlign: 'center' },
        },
        {
          type: 'text',
          value: 'If you can read this,',
          style: { textAlign: 'center', marginTop: '10px' },
        },
        {
          type: 'text',
          value: 'your printer is working!',
          style: {
            textAlign: 'center',
            fontWeight: 'bold',
            marginBottom: '20px',
          },
        },
      ];

      const options = {
        preview: false,
        printerName: printerName || undefined,
        width: '80mm',
        silent: true,
      };

      await PosPrinter.print(data, options);
      return { success: true };
    } catch (error) {
      throw error;
    }
  },
};

export default printService;