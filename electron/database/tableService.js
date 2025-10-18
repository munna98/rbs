import prisma from './prisma.js';

const tableService = {
  async getAllTables() {
    try {
      const tables = await prisma.table.findMany({
        include: {
          orders: {
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
            },
          },
        },
        orderBy: {
          tableNumber: 'asc',
        },
      });
      return tables;
    } catch (error) {
      throw error;
    }
  },

  async createTable(data) {
    try {
      const { tableNumber, capacity } = data;

      // Check if table number already exists
      const existing = await prisma.table.findUnique({
        where: { tableNumber: parseInt(tableNumber) },
      });

      if (existing) {
        throw new Error(`Table ${tableNumber} already exists`);
      }

      const table = await prisma.table.create({
        data: {
          tableNumber: parseInt(tableNumber),
          capacity: parseInt(capacity),
          status: 'AVAILABLE',
        },
      });

      return table;
    } catch (error) {
      throw error;
    }
  },

  async updateTable(data) {
    try {
      const { id, tableNumber, capacity, status } = data;

      const table = await prisma.table.update({
        where: { id },
        data: {
          ...(tableNumber && { tableNumber: parseInt(tableNumber) }),
          ...(capacity && { capacity: parseInt(capacity) }),
          ...(status && { status }),
        },
      });

      return table;
    } catch (error) {
      throw error;
    }
  },

  async deleteTable(id) {
    try {
      // Check if table has active orders
      const table = await prisma.table.findUnique({
        where: { id },
        include: {
          orders: {
            where: {
              status: {
                in: ['PENDING', 'PREPARING', 'SERVED'],
              },
            },
          },
        },
      });

      if (table.orders && table.orders.length > 0) {
        throw new Error('Cannot delete table with active orders');
      }

      await prisma.table.delete({
        where: { id },
      });

      return id;
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
  
  async transferOrder(data) {
    try {
      const { orderId, fromTableId, toTableId } = data;

      // Check if target table is available
      const toTable = await prisma.table.findUnique({
        where: { id: toTableId },
      });

      if (toTable.status !== 'AVAILABLE') {
        throw new Error('Target table is not available');
      }

      // Update order table
      await prisma.order.update({
        where: { id: orderId },
        data: { tableId: toTableId },
      });

      // Update table statuses
      await prisma.table.update({
        where: { id: toTableId },
        data: { status: 'OCCUPIED' },
      });

      // Check if source table has other orders
      const remainingOrders = await prisma.order.count({
        where: {
          tableId: fromTableId,
          status: {
            in: ['PENDING', 'PREPARING', 'READY', 'SERVED'],
          },
        },
      });

      // Free up source table if no more orders
      if (remainingOrders === 0) {
        await prisma.table.update({
          where: { id: fromTableId },
          data: { status: 'AVAILABLE' },
        });
      }

      return { success: true };
    } catch (error) {
      throw error;
    }
  },

  async reserveTable(data) {
    try {
      const { tableId, reservationName, reservationPhone, reservationTime } = data;

      const table = await prisma.table.findUnique({
        where: { id: tableId },
      });

      if (table.status === 'OCCUPIED') {
        throw new Error('Table is currently occupied');
      }

      const updatedTable = await prisma.table.update({
        where: { id: tableId },
        data: { status: 'RESERVED' },
      });

      // Create a reservation record (you can add a Reservation model later)
      // For now, we'll just update the status

      return updatedTable;
    } catch (error) {
      throw error;
    }
  },

  async mergeTables(data) {
    try {
      const { sourceTableIds, targetTableId } = data;

      // Get all orders from source tables
      const ordersToMove = await prisma.order.findMany({
        where: {
          tableId: {
            in: sourceTableIds,
          },
          status: {
            in: ['PENDING', 'PREPARING', 'READY', 'SERVED'],
          },
        },
      });

      if (ordersToMove.length === 0) {
        throw new Error('No active orders on source tables');
      }

      // Move all orders to target table
      await prisma.order.updateMany({
        where: {
          id: {
            in: ordersToMove.map((o) => o.id),
          },
        },
        data: {
          tableId: targetTableId,
        },
      });

      // Update target table status
      await prisma.table.update({
        where: { id: targetTableId },
        data: { status: 'OCCUPIED' },
      });

      // Free up source tables
      await prisma.table.updateMany({
        where: {
          id: {
            in: sourceTableIds,
          },
        },
        data: { status: 'AVAILABLE' },
      });

      return { success: true, movedOrders: ordersToMove.length };
    } catch (error) {
      throw error;
    }
  },

  async swapTables(data) {
    try {
      const { table1Id, table2Id } = data;

      // Get all orders from both tables
      const table1Orders = await prisma.order.findMany({
        where: {
          tableId: table1Id,
          status: {
            in: ['PENDING', 'PREPARING', 'READY', 'SERVED'],
          },
        },
      });

      const table2Orders = await prisma.order.findMany({
        where: {
          tableId: table2Id,
          status: {
            in: ['PENDING', 'PREPARING', 'READY', 'SERVED'],
          },
        },
      });

      // Swap orders
      if (table1Orders.length > 0) {
        await prisma.order.updateMany({
          where: {
            id: {
              in: table1Orders.map((o) => o.id),
            },
          },
          data: { tableId: table2Id },
        });
      }

      if (table2Orders.length > 0) {
        await prisma.order.updateMany({
          where: {
            id: {
              in: table2Orders.map((o) => o.id),
            },
          },
          data: { tableId: table1Id },
        });
      }

      // Update table statuses
      const table1 = await prisma.table.findUnique({ where: { id: table1Id } });
      const table2 = await prisma.table.findUnique({ where: { id: table2Id } });

      await prisma.table.update({
        where: { id: table1Id },
        data: { status: table2.status },
      });

      await prisma.table.update({
        where: { id: table2Id },
        data: { status: table1.status },
      });

      return { success: true };
    } catch (error) {
      throw error;
    }
  },

  async clearTable(tableId) {
    try {
      // Check for active orders
      const activeOrders = await prisma.order.findMany({
        where: {
          tableId,
          status: {
            in: ['PENDING', 'PREPARING', 'READY', 'SERVED'],
          },
        },
      });

      if (activeOrders.length > 0) {
        throw new Error(
          'Cannot clear table with active orders. Complete or cancel orders first.'
        );
      }

      // Update table status
      const table = await prisma.table.update({
        where: { id: tableId },
        data: { status: 'AVAILABLE' },
      });

      return table;
    } catch (error) {
      throw error;
    }
  },
};

export default tableService;