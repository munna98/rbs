import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Calendar, User, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Table } from '../../../types';

const schema = z.object({
  customerName: z.string().min(1, 'Name is required'),
  customerPhone: z.string().min(10, 'Valid phone number required'),
  reservationTime: z.string().min(1, 'Time is required'),
});

type FormData = z.infer<typeof schema>;

interface ReserveTableModalProps {
  isOpen: boolean;
  table: Table;
  onClose: () => void;
  onSuccess: () => void;
}

const ReserveTableModal = ({
  isOpen,
  table,
  onClose,
  onSuccess,
}: ReserveTableModalProps) => {
  const [isReserving, setIsReserving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsReserving(true);
    try {
      const result = await window.electronAPI.reserveTable({
        tableId: table.id,
        reservationName: data.customerName,
        reservationPhone: data.customerPhone,
        reservationTime: data.reservationTime,
      });

      if (result.success) {
        toast.success(`Table ${table.tableNumber} reserved successfully`);
        reset();
        onSuccess();
        onClose();
      } else {
        toast.error(result.error || 'Reservation failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error reserving table');
    } finally {
      setIsReserving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Reserve Table</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Table Info */}
        <div className="p-6 bg-yellow-50 border-b">
          <div className="text-center">
            <p className="text-sm text-gray-600">Reserving</p>
            <h3 className="text-3xl font-bold text-yellow-600">
              Table {table.tableNumber}
            </h3>
            <p className="text-sm text-gray-600">Capacity: {table.capacity} people</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Customer Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                {...register('customerName')}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                placeholder="Enter customer name"
              />
            </div>
            {errors.customerName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.customerName.message}
              </p>
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
                {...register('customerPhone')}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                placeholder="Enter phone number"
              />
            </div>
            {errors.customerPhone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.customerPhone.message}
              </p>
            )}
          </div>

          {/* Reservation Time */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Reservation Time *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="datetime-local"
                {...register('reservationTime')}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
              />
            </div>
            {errors.reservationTime && (
              <p className="text-red-500 text-sm mt-1">
                {errors.reservationTime.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
              disabled={isReserving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isReserving}
              className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition disabled:opacity-50 font-semibold"
            >
              {isReserving ? 'Reserving...' : 'Reserve Table'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReserveTableModal;