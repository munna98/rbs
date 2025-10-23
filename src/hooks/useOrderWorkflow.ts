// src/hooks/useOrderWorkflow.ts
import { useWorkflowSettings } from './useWorkflowSettings';
import type { Order } from '../types';

/**
 * Hook to handle order workflow logic based on settings
 * Centralizes all workflow-related business logic
 */
export const useOrderWorkflow = () => {
  const { settings, loading } = useWorkflowSettings();

  /**
   * Define common status type
   */
  type OrderStatus =
    | 'PENDING'
    | 'PREPARING'
    | 'READY'
    | 'SERVED'
    | 'COMPLETED'
    | 'CANCELLED';

  /**
   * Define structure of status flows
   */
  type StatusFlow = Record<OrderStatus, OrderStatus | null>;

  /**
   * All possible workflow flow configurations
   */
  const flows: Record<
    'PENDING_PREPARING_SERVED_COMPLETED' |
    'PENDING_READY_SERVED_COMPLETED' |
    'PENDING_COMPLETED' |
    'CUSTOM',
    Partial<StatusFlow>
  > = {
    PENDING_PREPARING_SERVED_COMPLETED: {
      PENDING: 'PREPARING',
      PREPARING: 'SERVED',
      SERVED: null, // Payment required
      COMPLETED: null,
      CANCELLED: null,
    },
    PENDING_READY_SERVED_COMPLETED: {
      PENDING: 'READY',
      READY: 'SERVED',
      SERVED: null, // Payment required
      COMPLETED: null,
      CANCELLED: null,
    },
    PENDING_COMPLETED: {
      PENDING: 'COMPLETED',
      COMPLETED: null,
      CANCELLED: null,
    },
    CUSTOM: {
      PENDING: 'PREPARING',
      PREPARING: 'READY',
      READY: 'SERVED',
      SERVED: null, // Payment required
      COMPLETED: null,
      CANCELLED: null,
    },
  };

  /**
   * Get the next allowed status for an order based on workflow settings
   */
  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    if (!settings) return null;

    const flowKey = settings.orderStatusFlow as keyof typeof flows;
    const flow = flows[flowKey];
    if (!flow) return null;

    return flow[currentStatus] ?? null;
  };

  /**
   * Check if status change to SERVED is allowed
   * Respects requirePaymentForServed setting
   */
  const canChangeToServed = async (
    order: Order
  ): Promise<{ allowed: boolean; reason?: string }> => {
    if (!settings?.requirePaymentForServed) {
      return { allowed: true };
    }

    // Check if order has sufficient payment
    try {
      // In real implementation, you'd fetch payments from backend
      const result = await window.electronAPI.getOrders();
      if (result.success) {
        const fullOrder = result.data.find((o: Order) => o.id === order.id);

        if (fullOrder?.payments) {
          const totalPaid = fullOrder.payments.reduce(
            (sum: number, p: { amount: number }) => sum + p.amount,
            0
          );

          if (totalPaid >= order.total) {
            return { allowed: true };
          }

          return {
            allowed: false,
            reason: 'Payment required before marking as served',
          };
        }
      }

      return {
        allowed: false,
        reason: 'Cannot verify payment status',
      };
    } catch (error) {
      return {
        allowed: false,
        reason: 'Error checking payment status',
      };
    }
  };

  /**
   * Check if order should auto-change to SERVED after payment
   */
  const shouldAutoMarkServed = (): boolean => {
    return settings?.autoMarkServedWhenPaid ?? false;
  };

  /**
   * Check if partial payments are allowed
   */
  const allowsPartialPayment = (): boolean => {
    return settings?.allowPartialPayment ?? true;
  };

  /**
   * Check if split payments are allowed
   */
  const allowsSplitPayment = (): boolean => {
    return settings?.allowSplitPayment ?? true;
  };

  /**
   * Check if payment is required when creating order
   */
  const requiresPaymentAtOrder = (): boolean => {
    return settings?.requirePaymentAtOrder ?? false;
  };

  /**
   * Check if KOT should auto-print
   */
  const shouldAutoPrintKOT = (): boolean => {
    return settings?.autoPrintKOT ?? true;
  };

  /**
   * Get KOT print delay in milliseconds
   */
  const getKOTPrintDelay = (): number => {
    return (settings?.kotPrintDelay ?? 0) * 1000;
  };

  /**
   * Check if item-wise preparation tracking is enabled
   */
  const enablesItemWisePreparing = (): boolean => {
    return settings?.enableItemWisePreparing ?? true;
  };

  /**
   * Get all allowed status transitions from current status
   */
  const getAllowedTransitions = (currentStatus: OrderStatus): OrderStatus[] => {
    const next = getNextStatus(currentStatus);
    const transitions: OrderStatus[] = [];

    if (next) transitions.push(next);

    // CANCELLED is always allowed unless already completed
    if (!['COMPLETED', 'CANCELLED'].includes(currentStatus)) {
      transitions.push('CANCELLED');
    }

    return transitions;
  };

  /**
   * Get workflow mode display name
   */
  const getWorkflowModeName = (): string => {
    const mode = settings?.orderWorkflowMode ?? 'FULL_SERVICE';
    const names: Record<string, string> = {
      FULL_SERVICE: 'Full Service Restaurant',
      QUICK_SERVICE: 'Quick Service / Fast Food',
      CUSTOM: 'Custom Workflow',
    };
    return names[mode] ?? 'Unknown';
  };

  return {
    settings,
    loading,
    getNextStatus,
    canChangeToServed,
    shouldAutoMarkServed,
    allowsPartialPayment,
    allowsSplitPayment,
    requiresPaymentAtOrder,
    shouldAutoPrintKOT,
    getKOTPrintDelay,
    enablesItemWisePreparing,
    getAllowedTransitions,
    getWorkflowModeName,
  };
};
