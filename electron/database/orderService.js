import prisma from './prisma.js';

const orderService = {
  async getTables() {
    try {
      const tables = await prisma.table.findMany({
        include: {
          orders: true,
        },
      });
      return tables;
    } catch (error) {
      throw error;
    }
  },

  async getOrders() {
    try {
      const orders = await prisma.order.findMany({
        include: {
          orderItems: {
            include: {
              menuItem: true,
            },
          },
          table: true,
          user: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return orders;
    } catch (error) {
      throw error;
    }
  },

  async getOrdersByTableId(tableId) {
    try {
      const orders = await prisma.order.findMany({
        where: { tableId },
        include: {
          orderItems: {
            include: {
              menuItem: true,
            },
          },
        },
      });
      return orders;
    } catch (error) {
      throw error;
    }
  },

  async createOrder(data) {
  try {
    const { tableId, userId, items, orderType, customerInfo } = data;

    // Generate order number
    const orderCount = await prisma.order.count();
    const orderNumber = `ORD${String(orderCount + 1).padStart(5, '0')}`;

    // Generate KOT number
    const kotCount = await prisma.order.count({
      where: { kotNumber: { not: null } },
    });
    const kotNumber = `KOT${String(kotCount + 1).padStart(5, '0')}`;

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const orderData = {
      orderNumber,
      kotNumber, // NEW
      kotPrinted: false, // NEW
      userId,
      status: 'PENDING',
      total,
      orderType: orderType || 'DINE_IN',
      orderItems: {
        create: items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes || null,
        })),
      },
    };

    // Add table for dine-in orders
    if (orderType === 'DINE_IN' && tableId) {
      orderData.tableId = tableId;
    }

    // Add customer info for delivery/takeaway
    if (orderType === 'DELIVERY' || orderType === 'TAKEAWAY') {
      orderData.customerName = customerInfo?.name || null;
      orderData.customerPhone = customerInfo?.phone || null;
      
      if (orderType === 'DELIVERY') {
        orderData.customerAddress = customerInfo?.address || null;
      }
    }

    const order = await prisma.order.create({
      data: orderData,
      include: {
        orderItems: {
          include: {
            menuItem: {
              include: {
                category: true,
              },
            },
          },
        },
        table: true,
        user: true,
      },
    });

    // Update table status to OCCUPIED for dine-in
    if (orderType === 'DINE_IN' && tableId) {
      await prisma.table.update({
        where: { id: tableId },
        data: { status: 'OCCUPIED' },
      });
    }

    return order;
  } catch (error) {
    throw error;
  }
},

  async updateOrder(data) {
    try {
      const { id, status, total } = data;

      const order = await prisma.order.update({
        where: { id },
        data: {
          status,
          ...(total && { total }),
        },
        include: {
          orderItems: {
            include: {
              menuItem: true,
            },
          },
          table: true,
        },
      });

      return order;
    } catch (error) {
      throw error;
    }
  },

  async recordPayment(data) {
    try {
      const { orderId, amount, method, splitNumber } = data;

      const payment = await prisma.payment.create({
        data: {
          orderId,
          amount,
          method,
          splitNumber: splitNumber || 1,
        },
      });

      // Check if order is fully paid
      const allPayments = await prisma.payment.findMany({
        where: { orderId },
      });

      const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      // Update order status to COMPLETED if fully paid
      if (order && totalPaid >= order.total) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'COMPLETED' },
        });

        // Update table status to AVAILABLE
        if (order.tableId) {
          await prisma.table.update({
            where: { id: order.tableId },
            data: { status: 'AVAILABLE' },
          });
        }
      }

      return payment;
    } catch (error) {
      throw error;
    }
  },
  async updateTableStatus(data) {
    try {
      const { tableId, status } = data;

      const table = await prisma.table.update({
        where: { id: tableId },
        data: { status },
      });

      return table;
    } catch (error) {
      throw error;
    }
  },

  async createTables(count) {
    try {
      const tables = [];
      for (let i = 1; i <= count; i++) {
        const table = await prisma.table.create({
          data: {
            tableNumber: i,
            capacity: 4,
            status: 'AVAILABLE',
          },
        });
        tables.push(table);
      }
      return tables;
    } catch (error) {
      throw error;
    }
  },
  //for kitchen
  async updateOrderStatus(data) {
    try {
      const { orderId, status } = data;

      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: {
          orderItems: {
            include: {
              menuItem: true,
            },
          },
          table: true,
        },
      });

      return order;
    } catch (error) {
      throw error;
    }
  },

  async markKOTPrinted(orderId) {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        kotPrinted: true,
        kotPrintedAt: new Date(),
      },
      include: {
        orderItems: {
          include: {
            menuItem: {
              include: {
                category: true,
              },
            },
          },
        },
        table: true,
        user: true,
      },
    });

    return order;
  } catch (error) {
    throw error;
  }
},

async getKOTQueue() {
  try {
    const orders = await prisma.order.findMany({
      where: {
        kotPrinted: false,
        status: {
          in: ['PENDING', 'PREPARING'],
        },
      },
      include: {
        orderItems: {
          include: {
            menuItem: {
              include: {
                category: true,
              },
            },
          },
        },
        table: true,
        user: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return orders;
  } catch (error) {
    throw error;
  }
},

};

export default orderService;