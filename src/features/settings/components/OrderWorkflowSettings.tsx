// src/features/settings/components/OrderWorkflowSettings.tsx - COMPLETE UPDATED VERSION WITH REDUX

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Save, RefreshCw, Workflow } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { 
  fetchWorkflowSettings, 
  updateWorkflowSettings 
} from '../settingsSlice';

const schema = z.object({
  // Order Creation Settings
  orderWorkflowMode: z.enum(['FULL_SERVICE', 'QUICK_SERVICE', 'CUSTOM']),
  requirePaymentAtOrder: z.boolean(),
  autoMarkServedWhenPaid: z.boolean(),
  
  // KOT Settings
  autoPrintKOT: z.boolean(),
  requireKOTPrintConfirmation: z.boolean(),
  kotPrintDelay: z.coerce.number().min(0).max(60), // seconds
  
  // Kitchen Display Settings
  autoStartPreparing: z.boolean(), // Auto change PENDING → PREPARING
  enableItemWisePreparing: z.boolean(), // Track individual item preparation
  
  // Payment Settings
  allowPartialPayment: z.boolean(),
  allowSplitPayment: z.boolean(),
  requirePaymentForServed: z.boolean(), // Can't mark SERVED without payment
  
  // Table Management
  autoOccupyTableOnOrder: z.boolean(),
  autoFreeTableOnPayment: z.boolean(),
  allowMultipleOrdersPerTable: z.boolean(),
  
  // Order Status Flow
  orderStatusFlow: z.enum([
    'PENDING_PREPARING_SERVED_COMPLETED',
    'PENDING_READY_SERVED_COMPLETED',
    'PENDING_COMPLETED', // Quick service
    'CUSTOM'
  ]),
  
  // Notifications
  notifyKitchenOnNewOrder: z.boolean(),
  notifyWaiterOnReady: z.boolean(),
  playOrderSound: z.boolean(),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

const OrderWorkflowSettings = () => {
  const dispatch = useAppDispatch();
  const { workflowSettings, loading: reduxLoading } = useAppSelector(
    (state) => state.settings
  );
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormInput, any, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
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

  const selectedMode = watch('orderWorkflowMode');
  const requirePaymentAtOrder = watch('requirePaymentAtOrder');

  // Load settings from Redux on mount
  useEffect(() => {
    dispatch(fetchWorkflowSettings());
  }, [dispatch]);

  // Update form when Redux settings change
  useEffect(() => {
    if (workflowSettings) {
      reset(workflowSettings);
    }
  }, [workflowSettings, reset]);

  const onSubmit: SubmitHandler<FormOutput> = async (data) => {
    setIsSubmitting(true);
    try {
      await dispatch(updateWorkflowSettings(data)).unwrap();
      toast.success('✅ Workflow settings saved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Error saving settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset to saved settings?')) {
      dispatch(fetchWorkflowSettings());
      toast.success('Settings reset to saved values');
    }
  };

  const workflowModes = {
    FULL_SERVICE: {
      name: 'Full Service Restaurant',
      description: 'Complete workflow: Order → Kitchen → Serve → Payment',
      icon: '🍽️',
      defaultSettings: {
        requirePaymentAtOrder: false,
        autoPrintKOT: true,
        orderStatusFlow: 'PENDING_PREPARING_SERVED_COMPLETED',
      }
    },
    QUICK_SERVICE: {
      name: 'Quick Service / Fast Food',
      description: 'Payment first, then preparation: Payment → Kitchen → Serve',
      icon: '🍔',
      defaultSettings: {
        requirePaymentAtOrder: true,
        autoPrintKOT: true,
        orderStatusFlow: 'PENDING_READY_SERVED_COMPLETED',
      }
    },
    CUSTOM: {
      name: 'Custom Workflow',
      description: 'Configure your own workflow settings',
      icon: '⚙️',
      defaultSettings: {}
    }
  };

  if (reduxLoading && !workflowSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Workflow className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold">Order Workflow Settings</h2>
          <p className="text-gray-600">Configure how orders are processed in your restaurant</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Workflow Mode Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Workflow Mode</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {Object.entries(workflowModes).map(([key, mode]) => (
              <label
                key={key}
                className={`relative border-2 rounded-lg p-4 cursor-pointer transition ${
                  selectedMode === key
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <input
                  type="radio"
                  value={key}
                  {...register('orderWorkflowMode')}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-4xl mb-2">{mode.icon}</div>
                  <h4 className="font-bold mb-1">{mode.name}</h4>
                  <p className="text-xs text-gray-600">{mode.description}</p>
                </div>
                {selectedMode === key && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>
                )}
              </label>
            ))}
          </div>

          {errors.orderWorkflowMode && (
            <p className="text-red-500 text-sm">{errors.orderWorkflowMode.message}</p>
          )}
        </div>

        {/* Order Creation Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">📝 Order Creation</h3>
          
          <div className="space-y-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                {...register('requirePaymentAtOrder')}
                className="w-5 h-5 mt-1 rounded"
              />
              <div>
                <span className="font-medium">Require Payment at Order Creation</span>
                <p className="text-sm text-gray-600">
                  Take payment immediately when order is placed (Quick Service mode)
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                {...register('autoMarkServedWhenPaid')}
                disabled={!requirePaymentAtOrder}
                className="w-5 h-5 mt-1 rounded disabled:opacity-50"
              />
              <div>
                <span className="font-medium">Auto-mark as Served when Paid</span>
                <p className="text-sm text-gray-600">
                  Automatically change order status to SERVED after payment
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* KOT Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">🖨️ Kitchen Order Ticket (KOT)</h3>
          
          <div className="space-y-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                {...register('autoPrintKOT')}
                className="w-5 h-5 mt-1 rounded"
              />
              <div>
                <span className="font-medium">Auto-print KOT</span>
                <p className="text-sm text-gray-600">
                  Automatically print KOT when order is created
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                {...register('requireKOTPrintConfirmation')}
                className="w-5 h-5 mt-1 rounded"
              />
              <div>
                <span className="font-medium">Require Print Confirmation</span>
                <p className="text-sm text-gray-600">
                  Show confirmation dialog before printing KOT
                </p>
              </div>
            </label>

            <div>
              <label className="block text-sm font-medium mb-2">
                KOT Print Delay (seconds)
              </label>
              <input
                type="number"
                {...register('kotPrintDelay')}
                className="w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                min="0"
                max="60"
              />
              <p className="text-xs text-gray-600 mt-1">
                Delay before auto-printing (useful for order modifications)
              </p>
              {errors.kotPrintDelay && (
                <p className="text-red-500 text-sm mt-1">{errors.kotPrintDelay.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Kitchen Display Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">👨‍🍳 Kitchen Display</h3>
          
          <div className="space-y-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                {...register('autoStartPreparing')}
                className="w-5 h-5 mt-1 rounded"
              />
              <div>
                <span className="font-medium">Auto-start Preparing</span>
                <p className="text-sm text-gray-600">
                  Automatically change PENDING → PREPARING when KOT is printed
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                {...register('enableItemWisePreparing')}
                className="w-5 h-5 mt-1 rounded"
              />
              <div>
                <span className="font-medium">Enable Item-wise Preparation</span>
                <p className="text-sm text-gray-600">
                  Allow chefs to mark individual items as prepared
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">💳 Payment Settings</h3>
          
          <div className="space-y-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                {...register('allowPartialPayment')}
                className="w-5 h-5 mt-1 rounded"
              />
              <div>
                <span className="font-medium">Allow Partial Payment</span>
                <p className="text-sm text-gray-600">
                  Accept payments less than the total amount
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                {...register('allowSplitPayment')}
                className="w-5 h-5 mt-1 rounded"
              />
              <div>
                <span className="font-medium">Allow Split Payment</span>
                <p className="text-sm text-gray-600">
                  Accept multiple payment methods for one order
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                {...register('requirePaymentForServed')}
                className="w-5 h-5 mt-1 rounded"
              />
              <div>
                <span className="font-medium">Require Payment Before Marking Served</span>
                <p className="text-sm text-gray-600">
                  Must record payment before changing status to SERVED
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Table Management */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">🪑 Table Management</h3>
          
          <div className="space-y-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                {...register('autoOccupyTableOnOrder')}
                className="w-5 h-5 mt-1 rounded"
              />
              <div>
                <span className="font-medium">Auto-occupy Table on Order</span>
                <p className="text-sm text-gray-600">
                  Automatically mark table as OCCUPIED when order is placed
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                {...register('autoFreeTableOnPayment')}
                className="w-5 h-5 mt-1 rounded"
              />
              <div>
                <span className="font-medium">Auto-free Table on Full Payment</span>
                <p className="text-sm text-gray-600">
                  Automatically mark table as AVAILABLE after full payment
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                {...register('allowMultipleOrdersPerTable')}
                className="w-5 h-5 mt-1 rounded"
              />
              <div>
                <span className="font-medium">Allow Multiple Orders Per Table</span>
                <p className="text-sm text-gray-600">
                  Allow creating multiple active orders for the same table
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Order Status Flow */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">🔄 Order Status Flow</h3>
          
          <select
            {...register('orderStatusFlow')}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-2"
          >
            <option value="PENDING_PREPARING_SERVED_COMPLETED">
              PENDING → PREPARING → SERVED → COMPLETED (Full Service)
            </option>
            <option value="PENDING_READY_SERVED_COMPLETED">
              PENDING → READY → SERVED → COMPLETED (With Ready Status)
            </option>
            <option value="PENDING_COMPLETED">
              PENDING → COMPLETED (Quick Service)
            </option>
            <option value="CUSTOM">
              Custom Flow (Configure manually)
            </option>
          </select>
          
          {errors.orderStatusFlow && (
            <p className="text-red-500 text-sm">{errors.orderStatusFlow.message}</p>
          )}

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Current Flow:</strong>
              {watch('orderStatusFlow') === 'PENDING_PREPARING_SERVED_COMPLETED' && 
                ' Order → Kitchen Preparing → Food Served → Payment & Complete'}
              {watch('orderStatusFlow') === 'PENDING_READY_SERVED_COMPLETED' && 
                ' Order → Ready for Pickup → Served → Payment & Complete'}
              {watch('orderStatusFlow') === 'PENDING_COMPLETED' && 
                ' Payment → Order → Complete (Quick Service)'}
              {watch('orderStatusFlow') === 'CUSTOM' && 
                ' Configure your own status progression'}
            </p>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">🔔 Notifications</h3>
          
          <div className="space-y-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                {...register('notifyKitchenOnNewOrder')}
                className="w-5 h-5 mt-1 rounded"
              />
              <div>
                <span className="font-medium">Notify Kitchen on New Order</span>
                <p className="text-sm text-gray-600">
                  Show notification in kitchen display when new order arrives
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                {...register('notifyWaiterOnReady')}
                className="w-5 h-5 mt-1 rounded"
              />
              <div>
                <span className="font-medium">Notify Waiter When Food Ready</span>
                <p className="text-sm text-gray-600">
                  Alert waiter when order status changes to READY
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                {...register('playOrderSound')}
                className="w-5 h-5 mt-1 rounded"
              />
              <div>
                <span className="font-medium">Play Sound on New Order</span>
                <p className="text-sm text-gray-600">
                  Play notification sound when new order is received
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleReset}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition disabled:opacity-50"
          >
            <RefreshCw className="w-5 h-5" />
            Reset
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-semibold"
          >
            <Save className="w-5 h-5" />
            {isSubmitting ? 'Saving...' : 'Save Workflow Settings'}
          </button>
        </div>
      </form>

      {/* Information Box */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">💡 Important Notes:</h4>
        <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
          <li>Changing workflow mode will affect all future orders</li>
          <li>Existing orders will continue with their current workflow</li>
          <li>Full Service mode is recommended for dine-in restaurants</li>
          <li>Quick Service mode works best for fast food or takeaway</li>
          <li>Custom mode allows maximum flexibility for unique needs</li>
          <li>Settings are applied immediately after saving</li>
        </ul>
      </div>
    </div>
  );
};

export default OrderWorkflowSettings;