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
      const { tableId, userId, items } = data;

      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const order = await prisma.order.create({
        data: {
          tableId,
          userId,
          status: 'PENDING',
          total,
          orderItems: {
            create: items.map((item) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
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

      // Update table status to OCCUPIED
      if (tableId) {
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
      const { orderId, amount, method } = data;

      const payment = await prisma.payment.create({
        data: {
          orderId,
          amount,
          method,
        },
      });

      // Update order status to COMPLETED
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'COMPLETED' },
      });

      // Update table status to AVAILABLE
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (order?.tableId) {
        await prisma.table.update({
          where: { id: order.tableId },
          data: { status: 'AVAILABLE' },
        });
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
};

export default orderService;