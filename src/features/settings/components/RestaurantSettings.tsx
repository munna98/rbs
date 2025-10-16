import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchRestaurantSettings,
  updateRestaurantSettings,
} from '../settingsSlice';
import toast from 'react-hot-toast';
import { Save, Store } from 'lucide-react';

const schema = z.object({
  name: z.string().min(1, 'Restaurant name is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').or(z.literal('')).optional(),
  taxRate: z.coerce.number().min(0).max(100),
  currency: z.string().min(1, 'Currency is required'),
  gstNumber: z.string().optional(),
});

// Separate input and output types to handle Zod's coercion
type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;


const RestaurantSettings = () => {
  const dispatch = useAppDispatch();
  const { restaurantSettings, loading } = useAppSelector(
    (state) => state.settings
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormInput, any, FormOutput>({ // Typed with both input and output
    resolver: zodResolver(schema),
    defaultValues: restaurantSettings,
  });

  useEffect(() => {
    dispatch(fetchRestaurantSettings());
  }, [dispatch]);

  useEffect(() => {
    if (restaurantSettings) {
        reset(restaurantSettings);
    }
  }, [restaurantSettings, reset]);

  // Submit handler is now correctly typed with the coerced output
  const onSubmit: SubmitHandler<FormOutput> = async (data) => {
    setIsSubmitting(true);
    try {
      await dispatch(updateRestaurantSettings(data as any)).unwrap();
      toast.success('Settings updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Error updating settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Store className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold">Restaurant Settings</h2>
          <p className="text-gray-600">Configure your restaurant information</p>
        </div>
      </div>

      {/* Form */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Restaurant Name */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Restaurant Name *
            </label>
            <input
              type="text"
              {...register('name')}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="My Restaurant"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold mb-2">Address</label>
            <textarea
              {...register('address')}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="123 Main Street, City, State"
              rows={3}
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
            )}
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Phone</label>
              <input
                type="tel"
                {...register('phone')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="+91 1234567890"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="restaurant@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Tax & Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Tax Rate (%) *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('taxRate')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="5"
              />
              {errors.taxRate && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.taxRate.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Currency *
              </label>
              <select
                {...register('currency')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
              {errors.currency && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.currency.message}
                </p>
              )}
            </div>
          </div>

          {/* GST Number */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              GST Number (Optional)
            </label>
            <input
              type="text"
              {...register('gstNumber')}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="22AAAAA0000A1Z5"
            />
            {errors.gstNumber && (
              <p className="text-red-500 text-sm mt-1">
                {errors.gstNumber.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-semibold"
            >
              <Save className="w-5 h-5" />
              {isSubmitting ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default RestaurantSettings;
