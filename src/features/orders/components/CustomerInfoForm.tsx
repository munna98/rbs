import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setCustomerInfo } from '../orderSlice';
import { User, Phone, MapPin } from 'lucide-react';
import { useEffect, useMemo } from 'react';

// ✅ Define schemas
const deliverySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number required'),
  address: z.string().min(5, 'Address is required'),
});

const takeawaySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number required'),
  address: z.string().optional(),
});

// ✅ Common type (address optional for type compatibility)
type CustomerFormData = {
  name: string;
  phone: string;
  address?: string;
};

const CustomerInfoForm = () => {
  const dispatch = useAppDispatch();
  const { orderType, customerInfo } = useAppSelector((state) => state.order);

  const isDelivery = orderType === 'DELIVERY';

  // ✅ UseMemo ensures schema changes reinitialize resolver correctly
  const schema = useMemo(() => (isDelivery ? deliverySchema : takeawaySchema), [isDelivery]);

  const {
    register,
    formState: { errors },
    watch,
    reset,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(schema),
    defaultValues: customerInfo || {
      name: '',
      phone: '',
      address: '',
    },
  });

  // ✅ Watch form changes and update Redux
  const formData = watch();

  useEffect(() => {
    if (formData.name || formData.phone || formData.address) {
      dispatch(setCustomerInfo(formData));
    }
  }, [formData, dispatch]);

  // ✅ Reset form when order type changes
  useEffect(() => {
    if (orderType === 'DINE_IN') {
      reset({ name: '', phone: '', address: '' });
    }
  }, [orderType, reset]);

  if (orderType === 'DINE_IN') {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4">Customer Information</h2>
      <form className="space-y-4">
        {/* Customer Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Customer Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              {...register('name')}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter customer name"
            />
          </div>
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Phone Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="tel"
              {...register('phone')}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter phone number"
            />
          </div>
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Delivery Address (only for delivery orders) */}
        {isDelivery && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Delivery Address *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <textarea
                {...register('address')}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter delivery address"
                rows={3}
              />
            </div>
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">
                {errors.address.message}
              </p>
            )}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong>{' '}
            {isDelivery
              ? 'Make sure to get complete delivery address with landmarks'
              : 'Customer will pick up the order from counter'}
          </p>
        </div>
      </form>
    </div>
  );
};

export default CustomerInfoForm;
