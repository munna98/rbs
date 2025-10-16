import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import type { Table } from '../../../types';

// Zod schema with coercion for number inputs
const schema = z.object({
  tableNumber: z.coerce.number().min(1, 'Table number must be at least 1'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1'),
});

// Separate input and output types to handle Zod's coercion.
// FormInput is what react-hook-form receives from the form fields.
type FormInput = z.input<typeof schema>;
// FormOutput is what Zod provides after successful validation and coercion.
type FormOutput = z.output<typeof schema>;

interface TableFormModalProps {
  isOpen: boolean;
  table?: Table;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const TableFormModal = ({
  isOpen,
  table,
  onClose,
  onSubmit,
  isLoading = false,
}: TableFormModalProps) => {
  // useForm is now typed with both the input and output types.
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormInput, any, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      tableNumber: table?.tableNumber || undefined, // Use undefined for new tables to show placeholder
      capacity: table?.capacity || 4,
    },
  });

  // The submit handler is now correctly typed with SubmitHandler<FormOutput>,
  // ensuring the 'data' argument has the coerced number types.
  const handleFormSubmit: SubmitHandler<FormOutput> = (data) => {
    const submitData = {
      ...data,
      ...(table && { id: table.id }),
    };
    onSubmit(submitData);
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">
            {table ? 'Edit Table' : 'Add New Table'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          {/* Table Number */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Table Number
            </label>
            <input
              type="number"
              {...register('tableNumber')}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="1"
              disabled={!!table}
            />
            {errors.tableNumber && (
              <p className="text-red-500 text-sm mt-1">
                {errors.tableNumber.message}
              </p>
            )}
            {table && (
              <p className="text-xs text-gray-500 mt-1">
                Table number cannot be changed
              </p>
            )}
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Capacity (People)
            </label>
            <input
              type="number"
              {...register('capacity')}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="4"
            />
            {errors.capacity && (
              <p className="text-red-500 text-sm mt-1">
                {errors.capacity.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : table ? 'Update Table' : 'Add Table'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TableFormModal;
