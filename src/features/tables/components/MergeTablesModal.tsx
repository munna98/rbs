import { useState } from 'react';
import { X, Merge, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Table } from '../../../types';

interface MergeTablesModalProps {
  isOpen: boolean;
  tables: Table[];
  onClose: () => void;
  onSuccess: () => void;
}

const MergeTablesModal = ({
  isOpen,
  tables,
  onClose,
  onSuccess,
}: MergeTablesModalProps) => {
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [targetTableId, setTargetTableId] = useState<string>('');
  const [isMerging, setIsMerging] = useState(false);

  // Get tables with active orders
  const occupiedTables = tables.filter((t) => t.status === 'OCCUPIED');

  const toggleTableSelection = (tableId: string) => {
    if (selectedTables.includes(tableId)) {
      setSelectedTables(selectedTables.filter((id) => id !== tableId));
    } else {
      setSelectedTables([...selectedTables, tableId]);
    }
  };

  const handleMerge = async () => {
    if (selectedTables.length === 0) {
      toast.error('Select at least one source table');
      return;
    }

    if (!targetTableId) {
      toast.error('Select a target table');
      return;
    }

    if (selectedTables.includes(targetTableId)) {
      toast.error('Target table cannot be a source table');
      return;
    }

    setIsMerging(true);
    try {
      const result = await window.electronAPI.mergeTables({
        sourceTableIds: selectedTables,
        targetTableId,
      });

      if (result.success) {
        toast.success(
          `Merged ${selectedTables.length} table(s) successfully. Moved ${result.data.movedOrders} order(s).`
        );
        setSelectedTables([]);
        setTargetTableId('');
        onSuccess();
        onClose();
      } else {
        toast.error(result.error || 'Merge failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error merging tables');
    } finally {
      setIsMerging(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <Merge className="w-8 h-8 text-purple-600" />
            <h2 className="text-2xl font-bold">Merge Tables</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Instructions */}
        <div className="p-6 bg-blue-50 border-b">
          <p className="text-sm text-blue-800">
            <strong>How to merge:</strong> Select source tables with orders,
            then select one target table where all orders will be combined.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-2 gap-6">
          {/* Source Tables */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-sm">
                Step 1
              </span>
              Select Source Tables
            </h3>
            {occupiedTables.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No occupied tables available
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {occupiedTables.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => toggleTableSelection(table.id)}
                    disabled={table.id === targetTableId}
                    className={`p-4 rounded-lg border-2 transition disabled:opacity-50 ${
                      selectedTables.includes(table.id)
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white border-gray-200 hover:border-purple-400'
                    }`}
                  >
                    <Users className={`w-6 h-6 mx-auto mb-2 ${
                      selectedTables.includes(table.id) ? 'text-white' : 'text-gray-600'
                    }`} />
                    <p className="font-bold">Table {table.tableNumber}</p>
                    <p className={`text-xs ${
                      selectedTables.includes(table.id) ? 'text-white opacity-90' : 'text-gray-500'
                    }`}>
                      {table.orders?.length || 0} order(s)
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Target Table */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-sm">
                Step 2
              </span>
              Select Target Table
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {tables
                .filter((t) => !selectedTables.includes(t.id))
                .map((table) => (
                  <button
                    key={table.id}
                    onClick={() => setTargetTableId(table.id)}
                    className={`p-4 rounded-lg border-2 transition ${
                      targetTableId === table.id
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white border-gray-200 hover:border-green-400'
                    }`}
                  >
                    <Users className={`w-6 h-6 mx-auto mb-2 ${
                      targetTableId === table.id ? 'text-white' : 'text-gray-600'
                    }`} />
                    <p className="font-bold">Table {table.tableNumber}</p>
                    <p className={`text-xs ${
                      targetTableId === table.id ? 'text-white opacity-90' : 'text-gray-500'
                    }`}>
                      {table.status}
                    </p>
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        {selectedTables.length > 0 && targetTableId && (
          <div className="mx-6 mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Summary:</strong> Merge {selectedTables.length} table(s) into{' '}
              Table {tables.find((t) => t.id === targetTableId)?.tableNumber}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="p-6 border-t flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-semibold"
            disabled={isMerging}
          >
            Cancel
          </button>
          <button
            onClick={handleMerge}
            disabled={selectedTables.length === 0 || !targetTableId || isMerging}
            className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
                    <Merge className="w-5 h-5" />
        {isMerging ? 'Merging...' : 'Merge Tables'}
      </button>
    </div>
  </div>
</div>
);
};

export default MergeTablesModal;