import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchTables,
  getTableOrders,
  selectTable,
  clearSelectedTable,
} from '../features/tables/tableSlice';
import TableCard from '../features/tables/components/TableCard';
import TableDetailsModal from '../features/tables/components/TableDetailsModal';
import TableFormModal from '../features/tables/components/TableFormModal';
import TransferOrderModal from '../features/tables/components/TransferOrderModal';
import ReserveTableModal from '../features/tables/components/ReserveTableModal';
import MergeTablesModal from '../features/tables/components/MergeTablesModal';
import toast from 'react-hot-toast';
import {
  RefreshCw,
  Filter,
  Plus,
  ArrowRightLeft,
  Calendar,
  Merge,
  Trash2,
  Edit,
} from 'lucide-react';
import type { Table, Order } from '../types';

const TableManagement = () => {
  const dispatch = useAppDispatch();
  const { tables, selectedTable, tableOrders, loading } = useAppSelector(
    (state) => state.table
  );

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isReserveOpen, setIsReserveOpen] = useState(false);
  const [isMergeOpen, setIsMergeOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | undefined>();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transferOrder, setTransferOrder] = useState<Order | null>(null);
  const [reserveTable, setReserveTable] = useState<Table | null>(null);

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
      const result = await window.electronAPI.clearTable(tableId);
      if (result.success) {
        toast.success('Table cleared successfully');
        dispatch(fetchTables());
      } else {
        toast.error(result.error || 'Failed to clear table');
      }
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

  const handleSubmitTable = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingTable) {
        const result = await window.electronAPI.updateTable(data);
        if (result.success) {
          toast.success('Table updated successfully');
          dispatch(fetchTables());
          setIsFormOpen(false);
        } else {
          throw new Error(result.error);
        }
      } else {
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

  const handleRefresh = () => {
    dispatch(fetchTables());
    toast.success('Tables refreshed');
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    dispatch(clearSelectedTable());
  };

  const handleTransferClick = (order: Order, table: Table) => {
    setTransferOrder(order);
    dispatch(selectTable(table));
    setIsTransferOpen(true);
  };

  const handleReserveClick = (table: Table) => {
    setReserveTable(table);
    setIsReserveOpen(true);
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

  const availableTables = tables.filter((t) => t.status === 'AVAILABLE');

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
              onClick={() => setIsMergeOpen(true)}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              <Merge className="w-5 h-5" />
              Merge Tables
            </button>
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
            <div key={table.id} className="relative group">
              <TableCard
                table={table}
                onClick={handleTableClick}
                onClear={handleClearTable}
              />

              {/* Quick Actions Menu - Context Specific */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <div className="bg-white rounded-lg shadow-lg p-2 space-y-1">
                  {/* Occupied Table Actions */}
                  {table.status === 'OCCUPIED' && (
                    <>
                      {table.orders && table.orders.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTransferClick(table.orders![0], table);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                          Transfer
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearTable(table.id);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear
                      </button>
                    </>
                  )}

                  {/* Reserved Table Actions */}
                  {table.status === 'RESERVED' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTable(table);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  )}

                  {/* Available Table Actions */}
                  {table.status === 'AVAILABLE' && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReserveClick(table);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50 rounded"
                      >
                        <Calendar className="w-4 h-4" />
                        Reserve
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTable(table);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTable(table.id);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
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

      <TableDetailsModal
        isOpen={isDetailsOpen}
        table={selectedTable}
        orders={tableOrders}
        onClose={handleCloseDetails}
      />

      {transferOrder && selectedTable && (
        <TransferOrderModal
          isOpen={isTransferOpen}
          order={transferOrder}
          currentTable={selectedTable}
          availableTables={availableTables}
          onClose={() => {
            setIsTransferOpen(false);
            setTransferOrder(null);
          }}
          onSuccess={() => {
            dispatch(fetchTables());
            handleCloseDetails();
          }}
        />
      )}

      {reserveTable && (
        <ReserveTableModal
          isOpen={isReserveOpen}
          table={reserveTable}
          onClose={() => {
            setIsReserveOpen(false);
            setReserveTable(null);
          }}
          onSuccess={() => {
            dispatch(fetchTables());
          }}
        />
      )}

      <MergeTablesModal
        isOpen={isMergeOpen}
        tables={tables}
        onClose={() => setIsMergeOpen(false)}
        onSuccess={() => {
          dispatch(fetchTables());
        }}
      />
    </div>
  );
};

export default TableManagement;