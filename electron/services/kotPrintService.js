import pkg from 'electron-pos-printer';

const { PosPrinter } = pkg;
const kotPrintService = {
  async generateKOT(kotData) {
    try {
      const {
        kotNumber,
        orderNumber,
        tableNumber,
        orderType,
        customerName,
        items,
        notes,
        createdAt,
        waiterName,
      } = kotData;

      const data = [
        {
          type: 'text',
          value: '*** KITCHEN ORDER TICKET ***',
          style: {
            fontFamily: 'monospace',
            fontSize: '18px',
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
        },
        {
          type: 'text',
          value: `KOT #: ${kotNumber}`,
          style: {
            fontWeight: 'bold',
            fontSize: '16px',
            marginTop: '10px',
          },
        },
        {
          type: 'text',
          value: `Order #: ${orderNumber}`,
          style: { fontWeight: 'bold', fontSize: '14px' },
        },
      ];

      // Order Type Info
      if (orderType === 'DINE_IN' && tableNumber) {
        data.push({
          type: 'text',
          value: `Table: ${tableNumber}`,
          style: {
            fontWeight: 'bold',
            fontSize: '20px',
            marginTop: '5px',
            marginBottom: '5px',
          },
        });
      } else if (orderType === 'TAKEAWAY') {
        data.push({
          type: 'text',
          value: `TAKEAWAY - ${customerName || 'Customer'}`,
          style: {
            fontWeight: 'bold',
            fontSize: '14px',
            marginTop: '5px',
          },
        });
      } else if (orderType === 'DELIVERY') {
        data.push({
          type: 'text',
          value: `DELIVERY - ${customerName || 'Customer'}`,
          style: {
            fontWeight: 'bold',
            fontSize: '14px',
            marginTop: '5px',
          },
        });
      }

      data.push(
        {
          type: 'text',
          value: `Date: ${new Date(createdAt).toLocaleString()}`,
          style: { fontSize: '12px', marginBottom: '5px' },
        },
        {
          type: 'text',
          value: `Waiter: ${waiterName}`,
          style: { fontSize: '12px', marginBottom: '10px' },
        },
        {
          type: 'text',
          value: '================================',
          style: { textAlign: 'center' },
        },
        {
          type: 'text',
          value: 'ITEMS TO PREPARE',
          style: {
            fontWeight: 'bold',
            textAlign: 'center',
            fontSize: '16px',
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

      // Items - Grouped by category for kitchen
      const itemsByCategory = {};
      items.forEach((item) => {
        const category = item.category || 'Other';
        if (!itemsByCategory[category]) {
          itemsByCategory[category] = [];
        }
        itemsByCategory[category].push(item);
      });

      Object.keys(itemsByCategory).forEach((category) => {
        data.push({
          type: 'text',
          value: `--- ${category} ---`,
          style: {
            fontWeight: 'bold',
            fontSize: '14px',
            marginTop: '10px',
            marginBottom: '5px',
          },
        });

        itemsByCategory[category].forEach((item) => {
          data.push({
            type: 'text',
            value: `${item.quantity}x ${item.name}`,
            style: {
              fontWeight: 'bold',
              fontSize: '18px',
              marginTop: '5px',
              marginBottom: '5px',
            },
          });

          if (item.notes) {
            data.push({
              type: 'text',
              value: `   Note: ${item.notes}`,
              style: {
                fontSize: '12px',
                fontStyle: 'italic',
                marginBottom: '5px',
              },
            });
          }
        });
      });

      // Special Instructions
      if (notes) {
        data.push(
          {
            type: 'text',
            value: '================================',
            style: { textAlign: 'center', marginTop: '10px' },
          },
          {
            type: 'text',
            value: 'SPECIAL INSTRUCTIONS:',
            style: {
              fontWeight: 'bold',
              fontSize: '14px',
              marginTop: '10px',
            },
          },
          {
            type: 'text',
            value: notes,
            style: {
              fontSize: '12px',
              marginTop: '5px',
              marginBottom: '10px',
            },
          }
        );
      }

      data.push(
        {
          type: 'text',
          value: '================================',
          style: { textAlign: 'center', marginTop: '20px' },
        },
        {
          type: 'text',
          value: `Total Items: ${items.reduce((sum, item) => sum + item.quantity, 0)}`,
          style: {
            textAlign: 'center',
            fontWeight: 'bold',
            marginTop: '10px',
            marginBottom: '20px',
          },
        }
      );

      return data;
    } catch (error) {
      throw error;
    }
  },

  async printKOT(kotData, printerSettings = {}) {
    try {
      const data = await this.generateKOT(kotData);

      const options = {
        preview: false,
        width: `${printerSettings.paperWidth || 80}mm`,
        margin: '0 0 0 0',
        copies: printerSettings.kotCopies || 1,
        printerName: printerSettings.kitchenPrinterName || printerSettings.printerName,
        timeOutPerLine: 400,
        silent: true,
      };

      await PosPrinter.print(data, options);

      return { success: true };
    } catch (error) {
      throw error;
    }
  },

  async printKOTPreview(kotData, printerSettings = {}) {
    try {
      const data = await this.generateKOT(kotData);

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
};

export default kotPrintService;