import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchMenuItems,
  fetchCategories,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  createCategory,
  setSelectedCategory,
  setSearchQuery,
  setViewMode,
} from '../features/menu/menuSlice';
import MenuItemCard from '../features/menu/components/MenuItemCard';
import MenuItemModal from '../features/menu/components/MenuItemModal';
import toast from 'react-hot-toast';
import {
  Plus,
  Grid3x3,
  List,
  Search,
  FolderPlus,
} from 'lucide-react';
import type { MenuItem } from '../types';

const MenuManagement = () => {
  const dispatch = useAppDispatch();
  const {
    items,
    categories,
    loading,
    selectedCategory,
    searchQuery,
    viewMode,
  } = useAppSelector((state) => state.menu);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | undefined>();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Load initial data
  useEffect(() => {
    dispatch(fetchMenuItems());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCategory =
      !selectedCategory || item.categoryId === selectedCategory;
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle add/edit item
  const handleSubmitItem = async (data: any) => {
    try {
      if (editingItem) {
        await dispatch(updateMenuItem(data));
        toast.success('Item updated successfully');
      } else {
        await dispatch(createMenuItem(data));
        toast.success('Item added successfully');
      }
      setIsModalOpen(false);
      setEditingItem(undefined);
    } catch (error: any) {
      toast.error(error.message || 'Error saving item');
    }
  };

  // Handle delete item
  const handleDeleteItem = (id: string) => {
    if (window.confirm('Are you sure?')) {
      dispatch(deleteMenuItem(id));
      toast.success('Item deleted');
    }
  };

  // Handle toggle availability
  const handleToggleAvailability = async (id: string, available: boolean) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      await dispatch(updateMenuItem({ ...item, available }));
      toast.success(`Item ${available ? 'enabled' : 'disabled'}`);
    }
  };

  // Handle add category
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Category name is required');
      return;
    }
    try {
      await dispatch(createCategory({ name: newCategoryName }));
      toast.success('Category added');
      setNewCategoryName('');
      setIsCategoryModalOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Menu Management</h1>
        <p className="text-gray-600">Manage your restaurant menu items and categories</p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setEditingItem(undefined);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Item
          </button>
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <FolderPlus className="w-5 h-5" />
            Add Category
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => dispatch(setViewMode('grid'))}
              className={`p-2 rounded ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200'
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => dispatch(setViewMode('list'))}
              className={`p-2 rounded ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <select
            value={selectedCategory || ''}
            onChange={(e) =>
              dispatch(setSelectedCategory(e.target.value || null))
            }
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold mb-4">Add New Category</h2>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category name"
              className="w-full px-4 py-2 border rounded-lg mb-4 focus:ring-2 focus:ring-green-500 outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setNewCategoryName('');
                }}
                className="flex-1 px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Items Display */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No items found</p>
          <p className="text-gray-400">
            {searchQuery || selectedCategory
              ? 'Try adjusting your filters'
              : 'Add your first menu item'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              viewMode="grid"
              onEdit={(item) => {
                setEditingItem(item);
                setIsModalOpen(true);
              }}
              onDelete={handleDeleteItem}
              onToggleAvailability={handleToggleAvailability}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 font-semibold">Item Name</th>
                <th className="text-left px-6 py-3 font-semibold">Category</th>
                <th className="text-left px-6 py-3 font-semibold">Price</th>
                <th className="text-left px-6 py-3 font-semibold">Status</th>
                <th className="text-left px-6 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  viewMode="list"
                  onEdit={(item) => {
                    setEditingItem(item);
                    setIsModalOpen(true);
                  }}
                  onDelete={handleDeleteItem}
                  onToggleAvailability={handleToggleAvailability}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Item Modal */}
      <MenuItemModal
        isOpen={isModalOpen}
        item={editingItem}
        categories={categories}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(undefined);
        }}
        onSubmit={handleSubmitItem}
      />
    </div>
  );
};

export default MenuManagement;