import { Users } from 'lucide-react';
import { useAppDispatch } from '../../../store/hooks';
import { selectTable } from '../orderSlice';
import type { Table } from '../../../types';

interface TableSelectorProps {
  tables: Table[];
  selectedTable: Table | null;
}

const TableSelector = ({ tables, selectedTable }: TableSelectorProps) => {
  const dispatch = useAppDispatch();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-500 hover:bg-green-600';
      case 'OCCUPIED':
        return 'bg-red-500 hover:bg-red-600';
      case 'RESERVED':
        return 'bg-yellow-500 hover:bg-yellow-600';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Select Table</h2>
      <div className="grid grid-cols-3 gap-4">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => dispatch(selectTable(table))}
            className={`p-4 rounded-lg transition transform ${
              selectedTable?.id === table.id
                ? 'ring-4 ring-blue-400 scale-105'
                : ''
            } ${getStatusColor(table.status)} text-white font-bold hover:shadow-lg`}
            disabled={table.status !== 'AVAILABLE'}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="w-5 h-5" />
              <span>Table {table.tableNumber}</span>
            </div>
            <p className="text-xs opacity-90">Capacity: {table.capacity}</p>
            <p className="text-xs opacity-90">{table.status}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TableSelector;