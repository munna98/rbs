import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import type { MenuItem } from '../../../types';

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onToggleAvailability: (id: string, available: boolean) => void;
  viewMode: 'grid' | 'list';
}

const MenuItemCard = ({
  item,
  onEdit,
  onDelete,
  onToggleAvailability,
  viewMode,
}: MenuItemCardProps) => {
  if (viewMode === 'list') {
    return (
      <tr className="hover:bg-gray-50 border-b">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            {item.image && (
              <img
                src={`file://${item.image}`}
                alt={item.name}
                className="w-10 h-10 rounded object-cover"
              />
            )}
            <span className="font-medium">{item.name}</span>
          </div>
        </td>
        <td className="px-6 py-4">{item.category?.name}</td>
        <td className="px-6 py-4 font-semibold">₹{item.price.toFixed(2)}</td>
        <td className="px-6 py-4">
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              item.available
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {item.available ? 'Available' : 'Unavailable'}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="flex gap-2">
            <button
              onClick={() => onToggleAvailability(item.id, !item.available)}
              className="text-blue-600 hover:text-blue-800"
              title={item.available ? 'Make unavailable' : 'Make available'}
            >
              {item.available ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => onEdit(item)}
              className="text-green-600 hover:text-green-800"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {item.image ? (
        <img
          src={`file://${item.image}`}
          alt={item.name}
          className="w-full h-40 object-cover"
        />
      ) : (
        <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400">No image</span>
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{item.category?.name}</p>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-blue-600">₹{item.price}</span>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              item.available
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {item.available ? 'Available' : 'Unavailable'}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onToggleAvailability(item.id, !item.available)}
            className="flex-1 text-blue-600 hover:bg-blue-50 p-2 rounded transition"
          >
            {item.available ? (
              <Eye className="w-5 h-5 mx-auto" />
            ) : (
              <EyeOff className="w-5 h-5 mx-auto" />
            )}
          </button>
          <button
            onClick={() => onEdit(item)}
            className="flex-1 text-green-600 hover:bg-green-50 p-2 rounded transition"
          >
            <Edit className="w-5 h-5 mx-auto" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="flex-1 text-red-600 hover:bg-red-50 p-2 rounded transition"
          >
            <Trash2 className="w-5 h-5 mx-auto" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;