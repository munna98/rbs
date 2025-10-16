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
};

export default tableService;