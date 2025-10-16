import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchTables,
  getTableOrders,
  selectTable,
  clearTable,
  clearSelectedTable,
} from '../features/tables/tableSlice';
import TableCard from '../features/tables/components/TableCard';
import TableDetailsModal from '../features/tables/components/TableDetailsModal';
import TableFormModal from '../features/tables/components/TableFormModal';
import toast from 'react-hot-toast';
import { RefreshCw, Filter, Plus } from 'lucide-react';
import type { Table } from '../types';

const TableManagement = () => {
  const dispatch = useAppDispatch();
  const { tables, selectedTable, tableOrders, loading } = useAppSelector(
    (state) => state.table
  );

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | undefined>();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load tables on mount
  useEffect(() => {
    dispatch(fetchTables());
  }, [dispatch]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchTables());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleTableClick = async (table: Table) => {
    dispatch(selectTable(table));
    await dispatch(getTableOrders(table.id));
    setIsDetailsOpen(true);
  };

  const handleClearTable = async (tableId: string) => {
    try {
      await dispatch(clearTable(tableId)).unwrap();
      toast.success('Table cleared successfully');
      dispatch(fetchTables());
    } catch (error: any) {
      toast.error(error.message || 'Error clearing table');
    }
  };

  const handleAddTable = () => {
    setEditingTable(undefined);
    setIsFormOpen(true);
  };

  const handleEditTable = (table: Table) => {
    setEditingTable(table);
    setIsFormOpen(true);
  };

  const handleSubmitTable = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingTable) {
        // Update existing table
        const result = await window.electronAPI.updateTable(data);
        if (result.success) {
          toast.success('Table updated successfully');
          dispatch(fetchTables());
          setIsFormOpen(false);
        } else {
          throw new Error(result.error);
        }
      } else {
        // Create new table
        const result = await window.electronAPI.createTable(data);
        if (result.success) {
          toast.success('Table created successfully');
          dispatch(fetchTables());
          setIsFormOpen(false);
        } else {
          throw new Error(result.error);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Error saving table');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!window.confirm('Are you sure you want to delete this table?')) {
      return;
    }

    try {
      const result = await window.electronAPI.deleteTable(tableId);
      if (result.success) {
        toast.success('Table deleted successfully');
        dispatch(fetchTables());
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast.error(error.message || 'Error deleting table');
    }
  };

  const handleRefresh = () => {
    dispatch(fetchTables());
    toast.success('Tables refreshed');
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    dispatch(clearSelectedTable());
  };

  // Filter tables
  const filteredTables = tables.filter((table) => {
    if (filterStatus === 'ALL') return true;
    return table.status === filterStatus;
  });

  const statusCounts = {
    AVAILABLE: tables.filter((t) => t.status === 'AVAILABLE').length,
    OCCUPIED: tables.filter((t) => t.status === 'OCCUPIED').length,
    RESERVED: tables.filter((t) => t.status === 'RESERVED').length,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Table Management</h1>
            <p className="text-gray-600 mt-1">
              Monitor and manage restaurant tables
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAddTable}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <Plus className="w-5 h-5" />
              Add Table
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Tables</p>
            <p className="text-3xl font-bold text-gray-800">{tables.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow border-l-4 border-green-500">
            <p className="text-green-800 text-sm font-semibold">Available</p>
            <p className="text-3xl font-bold text-green-600">
              {statusCounts.AVAILABLE}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow border-l-4 border-red-500">
            <p className="text-red-800 text-sm font-semibold">Occupied</p>
            <p className="text-3xl font-bold text-red-600">
              {statusCounts.OCCUPIED}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow border-l-4 border-yellow-500">
            <p className="text-yellow-800 text-sm font-semibold">Reserved</p>
            <p className="text-3xl font-bold text-yellow-600">
              {statusCounts.RESERVED}
            </p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-semibold text-gray-700">Filter:</span>
        </div>
        <div className="flex gap-2">
          {['ALL', 'AVAILABLE', 'OCCUPIED', 'RESERVED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg transition font-medium ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Tables Grid */}
      {loading && tables.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredTables.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No tables found</p>
          <p className="text-gray-400 mb-4">
            {filterStatus !== 'ALL' ? 'Try changing the filter' : 'Add tables to get started'}
          </p>
          <button
            onClick={handleAddTable}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            <Plus className="w-5 h-5 inline mr-2" />
            Add Your First Table
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {filteredTables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              onClick={handleTableClick}
              onClear={handleClearTable}
            />
          ))}
        </div>
      )}

      {/* Table Form Modal */}
      <TableFormModal
        isOpen={isFormOpen}
        table={editingTable}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTable(undefined);
        }}
        onSubmit={handleSubmitTable}
        isLoading={isSubmitting}
      />

      {/* Table Details Modal */}
      <TableDetailsModal
        isOpen={isDetailsOpen}
        table={selectedTable}
        orders={tableOrders}
        onClose={handleCloseDetails}
      />
    </div>
  );
};

export default TableManagement;