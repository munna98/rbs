import { useState, useEffect } from 'react';

export interface WorkflowSettings {
  orderWorkflowMode: 'FULL_SERVICE' | 'QUICK_SERVICE' | 'CUSTOM';
  requirePaymentAtOrder: boolean;
  autoMarkServedWhenPaid: boolean;
  autoPrintKOT: boolean;
  requireKOTPrintConfirmation: boolean;
  kotPrintDelay: number;
  autoStartPreparing: boolean;
  enableItemWisePreparing: boolean;
  allowPartialPayment: boolean;
  allowSplitPayment: boolean;
  requirePaymentForServed: boolean;
  autoOccupyTableOnOrder: boolean;
  autoFreeTableOnPayment: boolean;
  allowMultipleOrdersPerTable: boolean;
  orderStatusFlow: string;
  notifyKitchenOnNewOrder: boolean;
  notifyWaiterOnReady: boolean;
  playOrderSound: boolean;
}

export const useWorkflowSettings = () => {
  const [settings, setSettings] = useState<WorkflowSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const result = await window.electronAPI.getOrderWorkflowSettings();
      if (result.success) {
        setSettings(result.data);
      }
    } catch (error) {
      console.error('Error loading workflow settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const reload = () => {
    loadSettings();
  };

  return { settings, loading, reload };
};