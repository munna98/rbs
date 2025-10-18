import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Printer, Save, TestTube, RefreshCw } from 'lucide-react';

const schema = z.object({
  printerName: z.string(),
  kitchenPrinterName: z.string().optional(), // NEW
  paperWidth: z.coerce.number().min(58).max(80),
  copies: z.coerce.number().min(1).max(5),
  kotCopies: z.coerce.number().min(1).max(5), // NEW
  enableSound: z.boolean(),
  autoOpenDrawer: z.boolean(),
});

// Define separate Input and Output types
type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

const PrinterSettings = () => {
  const [printers, setPrinters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Correctly type useForm with FormInput and FormOutput generics
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormInput, any, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      printerName: '',
      paperWidth: 80,
      copies: 1,
      enableSound: false,
      autoOpenDrawer: true,
    },
  });

  const selectedPrinter = watch('printerName');

  useEffect(() => {
    loadPrinters();
    loadSettings();
  }, []);

  const loadPrinters = async () => {
    setLoading(true);
    try {
      const result = await window.electronAPI.getAvailablePrinters();
      if (result.success) {
        setPrinters(result.data || []);
      }
    } catch (error: any) {
      toast.error('Error loading printers');
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const result = await window.electronAPI.getPrinterSettings();
      if (result.success) {
        // Cast data to FormOutput for type safety when resetting with loaded data
        reset(result.data as FormOutput);
      }
    } catch (error: any) {
      toast.error('Error loading printer settings');
    }
  };

  // Type onSubmit using SubmitHandler<FormOutput>
  const onSubmit: SubmitHandler<FormOutput> = async (data) => {
    setIsSubmitting(true);
    try {
      // 'data' is now guaranteed to have the correct number types
      const result = await window.electronAPI.updatePrinterSettings(data);
      if (result.success) {
        toast.success('Printer settings saved');
      } else {
        toast.error(result.error || 'Error saving settings');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error saving settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestPrint = async () => {
    if (!selectedPrinter) {
      toast.error('Please select a printer first');
      return;
    }

    setIsTesting(true);
    try {
      const result = await window.electronAPI.testPrint(selectedPrinter);
      if (result.success) {
        toast.success('Test print sent successfully');
      } else {
        toast.error(result.error || 'Test print failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Test print failed');
    } finally {
      setIsTesting(false);
    }
  };

  const handleOpenDrawer = async () => {
    if (!selectedPrinter) {
      toast.error('Please select a printer first');
      return;
    }

    try {
      const result = await window.electronAPI.openCashDrawer(selectedPrinter);
      if (result.success) {
        toast.success('Cash drawer opened');
      } else {
        toast.error(result.error || 'Failed to open cash drawer');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to open cash drawer');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Printer className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold">Printer Settings</h2>
          <p className="text-gray-600">Configure thermal printer for receipts</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Printer Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold">Select Printer</label>
            <button
              type="button"
              onClick={loadPrinters}
              disabled={loading}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          <select
            {...register('printerName')}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            disabled={loading}
          >
            <option value="">Select a printer...</option>
            {printers.map((printer) => (
              <option key={printer.name} value={printer.name}>
                {printer.name} {printer.isDefault ? '(Default)' : ''}
              </option>
            ))}
          </select>
          {errors.printerName && (
            <p className="text-red-500 text-sm mt-1">{errors.printerName.message}</p>
          )}
        </div>

        {/* Kitchen Printer (Optional) */}
<div>
  <label className="block text-sm font-semibold mb-2">
    Kitchen Printer (Optional)
  </label>
  <select
    {...register('kitchenPrinterName')}
    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
    disabled={loading}
  >
    <option value="">Same as receipt printer</option>
    {printers.map((printer) => (
      <option key={printer.name} value={printer.name}>
        {printer.name}
      </option>
    ))}
  </select>
  <p className="text-xs text-gray-500 mt-1">
    Select a separate printer for kitchen orders (KOT)
  </p>
</div>

{/* KOT Copies */}
<div>
  <label className="block text-sm font-semibold mb-2">
    KOT Copies
  </label>
  <input
    type="number"
    {...register('kotCopies')}
    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
    min="1"
    max="5"
    defaultValue="1"
  />
  <p className="text-xs text-gray-500 mt-1">
    Number of KOT copies to print
  </p>
</div>

        {/* Paper Width */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Paper Width (mm)
          </label>
          <select
            {...register('paperWidth')}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="58">58mm</option>
            <option value="80">80mm</option>
          </select>
          {errors.paperWidth && (
            <p className="text-red-500 text-sm mt-1">{errors.paperWidth.message}</p>
          )}
        </div>

        {/* Number of Copies */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Number of Copies
          </label>
          <input
            type="number"
            {...register('copies')}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            min="1"
            max="5"
          />
          {errors.copies && (
            <p className="text-red-500 text-sm mt-1">{errors.copies.message}</p>
          )}
        </div>

        {/* Options */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('enableSound')}
              className="w-5 h-5 rounded"
            />
            <span className="text-sm font-medium">Enable Print Sound</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('autoOpenDrawer')}
              className="w-5 h-5 rounded"
            />
            <span className="text-sm font-medium">
              Auto Open Cash Drawer After Print
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={handleTestPrint}
            disabled={!selectedPrinter || isTesting}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
          >
            <TestTube className="w-5 h-5" />
            {isTesting ? 'Printing...' : 'Test Print'}
          </button>

          <button
            type="button"
            onClick={handleOpenDrawer}
            disabled={!selectedPrinter}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
          >
            <Printer className="w-5 h-5" />
            Open Cash Drawer
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 ml-auto font-semibold"
          >
            <Save className="w-5 h-5" />
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">📝 Instructions:</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Make sure your thermal printer is connected and turned on</li>
          <li>Click "Refresh" to detect available printers</li>
          <li>Select your printer from the dropdown</li>
          <li>Choose paper width (58mm or 80mm based on your printer)</li>
          <li>Click "Test Print" to verify printer is working</li>
          <li>Save settings when done</li>
        </ul>
      </div>
    </div>
  );
};

export default PrinterSettings;
