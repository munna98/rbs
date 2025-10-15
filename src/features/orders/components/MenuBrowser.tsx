import { Plus } from 'lucide-react';
import { useAppDispatch } from '../../../store/hooks';
import { addToCart } from '../orderSlice';
import type { MenuItem, Category } from '../../../types';

interface MenuBrowserProps {
  items: MenuItem[];
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

const MenuBrowser = ({
  items,
  categories,
  selectedCategory,
  onSelectCategory,
}: MenuBrowserProps) => {
  const dispatch = useAppDispatch();

  const filteredItems = selectedCategory
    ? items.filter((item) => item.categoryId === selectedCategory)
    : items;

  const handleAddToCart = (item: MenuItem) => {
    dispatch(
      addToCart({
        menuItemId: item.id,
        name: item.name,
        price: item.price,
      })
    );
  };

  return (
    <div className="flex-1 p-6">
      {/* Category Filter */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Categories</h3>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onSelectCategory(null)}
            className={`px-4 py-2 rounded-lg transition ${
              selectedCategory === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-lg transition ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredItems.filter((item) => item.available).map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition"
          >
            <div className="bg-gray-200 h-32 rounded mb-3 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
            <h4 className="font-semibold text-sm mb-1">{item.name}</h4>
            <p className="text-xs text-gray-600 mb-2">{item.category?.name}</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-blue-600">
                ₹{item.price}
              </span>
              <button
                onClick={() => handleAddToCart(item)}
                className="bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuBrowser;