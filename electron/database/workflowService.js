
import prisma from './prisma.js';

const workflowService = {
  async getOrderWorkflowSettings() {
    try {
      let settings = await prisma.orderWorkflowSettings.findFirst();

      if (!settings) {
        // Create default settings if none exist
        settings = await prisma.orderWorkflowSettings.create({
          data: {
            orderWorkflowMode: 'FULL_SERVICE',
            requirePaymentAtOrder: false,
            autoMarkServedWhenPaid: false,
            autoPrintKOT: true,
            requireKOTPrintConfirmation: false,
            kotPrintDelay: 0,
            autoStartPreparing: false,
            enableItemWisePreparing: true,
            allowPartialPayment: true,
            allowSplitPayment: true,
            requirePaymentForServed: false,
            autoOccupyTableOnOrder: true,
            autoFreeTableOnPayment: true,
            allowMultipleOrdersPerTable: false,
            orderStatusFlow: 'PENDING_PREPARING_SERVED_COMPLETED',
            notifyKitchenOnNewOrder: true,
            notifyWaiterOnReady: true,
            playOrderSound: true,
          },
        });
      }

      return settings;
    } catch (error) {
      throw error;
    }
  },

  async updateOrderWorkflowSettings(data) {
    try {
      // Get or create settings
      let settings = await prisma.orderWorkflowSettings.findFirst();

      if (!settings) {
        settings = await prisma.orderWorkflowSettings.create({
          data: data,
        });
      } else {
        settings = await prisma.orderWorkflowSettings.update({
          where: { id: settings.id },
          data: data,
        });
      }

      return settings;
    } catch (error) {
      throw error;
    }
  },

  // Helper method to check if payment is required at order creation
  async shouldRequirePaymentAtOrder() {
    const settings = await this.getOrderWorkflowSettings();
    return settings.requirePaymentAtOrder;
  },

  // Helper method to check if KOT should auto-print
  async shouldAutoPrintKOT() {
    const settings = await this.getOrderWorkflowSettings();
    return settings.autoPrintKOT;
  },

  // Helper method to get KOT print delay
  async getKOTPrintDelay() {
    const settings = await this.getOrderWorkflowSettings();
    return settings.kotPrintDelay;
  },

  // Helper method to check if auto-start preparing is enabled
  async shouldAutoStartPreparing() {
    const settings = await this.getOrderWorkflowSettings();
    return settings.autoStartPreparing;
  },

  // Helper method to get allowed status transitions
  async getAllowedStatusTransitions(currentStatus) {
    const settings = await this.getOrderWorkflowSettings();
    const flow = settings.orderStatusFlow;

    const flows = {
      'PENDING_PREPARING_SERVED_COMPLETED': {
        PENDING: ['PREPARING', 'CANCELLED'],
        PREPARING: ['SERVED', 'CANCELLED'],
        SERVED: ['COMPLETED'],
        COMPLETED: [],
        CANCELLED: [],
      },
      'PENDING_READY_SERVED_COMPLETED': {
        PENDING: ['READY', 'CANCELLED'],
        READY: ['SERVED', 'CANCELLED'],
        SERVED: ['COMPLETED'],
        COMPLETED: [],
        CANCELLED: [],
      },
      'PENDING_COMPLETED': {
        PENDING: ['COMPLETED', 'CANCELLED'],
        COMPLETED: [],
        CANCELLED: [],
      },
      'CUSTOM': {
        PENDING: ['PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED'],
        PREPARING: ['READY', 'SERVED', 'COMPLETED', 'CANCELLED'],
        READY: ['SERVED', 'COMPLETED', 'CANCELLED'],
        SERVED: ['COMPLETED', 'CANCELLED'],
        COMPLETED: [],
        CANCELLED: [],
      },
    };

    return flows[flow]?.[currentStatus] || [];
  },
};

export default workflowService;
