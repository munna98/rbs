import prisma from './prisma.js';

const kitchenService = {
  async getKitchenOrders() {
    try {
      const orders = await prisma.order.findMany({
        where: {
          status: {
            in: ['PENDING', 'PREPARING', 'SERVED'],
          },
        },
        include: {
          orderItems: {
            include: {
              menuItem: true,
            },
          },
          table: true,
          user: {
            select: {
              id: true,
              username: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc', // Oldest orders first
        },
      });
      return orders;
    } catch (error) {
      throw error;
    }
  },

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
          user: {
            select: {
              id: true,
              username: true,
              role: true,
            },
          },
        },
      });

      return order;
    } catch (error) {
      throw error;
    }
  },

  async markItemPrepared(data) {
    try {
      const { orderItemId, prepared } = data;

      const orderItem = await prisma.orderItem.update({
        where: { id: orderItemId },
        data: { prepared },
        include: {
          menuItem: true,
        },
      });

      // Check if all items in the order are prepared
      const order = await prisma.order.findUnique({
        where: { id: orderItem.orderId },
        include: {
          orderItems: true,
        },
      });

      if (order && order.orderItems.every((item) => item.prepared)) {
        // Auto-update order status to SERVED if all items are prepared
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'SERVED' },
        });
      }

      return orderItem;
    } catch (error) {
      throw error;
    }
  },

  async getPendingOrdersCount() {
    try {
      const count = await prisma.order.count({
        where: { status: 'PENDING' },
      });
      return count;
    } catch (error) {
      throw error;
    }
  },

  async getPreparingOrdersCount() {
    try {
      const count = await prisma.order.count({
        where: { status: 'PREPARING' },
      });
      return count;
    } catch (error) {
      throw error;
    }
  },

  async getOrderById(orderId) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          orderItems: {
            include: {
              menuItem: true,
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
};

export default kitchenService;