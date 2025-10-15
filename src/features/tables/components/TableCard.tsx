import { Users, Eye, Trash2, CheckCircle } from 'lucide-react';
import type { Table } from '../../../types';

interface TableCardProps {
  table: Table;
  onClick: (table: Table) => void;
  onClear?: (tableId: string) => void;
}

const TableCard = ({ table, onClick, onClear }: TableCardProps) => {
  const getStatusStyles = () => {
    switch (table.status) {
      case 'AVAILABLE':
        return 'bg-green-500 hover:bg-green-600 border-green-600';
      case 'OCCUPIED':
        return 'bg-red-500 hover:bg-red-600 border-red-600';
      case 'RESERVED':
        return 'bg-yellow-500 hover:bg-yellow-600 border-yellow-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600 border-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (table.status) {
      case 'AVAILABLE':
        return <CheckCircle className="w-6 h-6" />;
      case 'OCCUPIED':
        return <Users className="w-6 h-6" />;
      case 'RESERVED':
        return <Eye className="w-6 h-6" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`relative rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer ${getStatusStyles()} text-white border-4`}
    >
      <div onClick={() => onClick(table)} className="p-6">
        {/* Status Icon */}
        <div className="flex justify-center mb-3">{getStatusIcon()}</div>

        {/* Table Number */}
        <div className="text-center">
          <h3 className="text-3xl font-bold mb-1">Table {table.tableNumber}</h3>
          <p className="text-sm opacity-90">Capacity: {table.capacity}</p>
          <p className="text-xs opacity-75 mt-1 uppercase font-semibold">
            {table.status}
          </p>
        </div>

        {/* Active Orders Badge */}
        {table.orders && table.orders.length > 0 && (
          <div className="mt-3 bg-white bg-opacity-20 rounded-lg p-2 text-center">
            <p className="text-sm font-semibold">
              {table.orders.length} Active Order(s)
            </p>
          </div>
        )}
      </div>

      {/* Clear Button (only for occupied tables) */}
      {table.status === 'OCCUPIED' && onClear && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`Clear Table ${table.tableNumber}?`)) {
              onClear(table.id);
            }
          }}
          className="absolute top-2 right-2 bg-white text-red-600 p-2 rounded-full hover:bg-red-100 transition"
          title="Clear Table"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default TableCard;