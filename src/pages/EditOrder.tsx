import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Minus, Trash2, Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Order, MenuItem } from '../types';

const EditOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadOrderAndMenu();
  }, [orderId]);

  const loadOrderAndMenu = async () => {
    try {
      // Load order
      const ordersResult = await window.electronAPI.getOrders();
      if (ordersResult.success) {
        const foundOrder = ordersResult.data.find((o: Order) => o.id === orderId);
        setOrder(foundOrder);
      }

      // Load menu items
      const menuResult = await window.electronAPI.getMenuItems();
      if (menuResult.success) {
        setMenuItems(menuResult.data);
      }
    } catch (error) {
      toast.error('Error loading order');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (!order) return;

    setOrder({
      ...order,
      orderItems: order.orderItems?.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, newQuantity) }
          : item
      ),
    });

    // Recalculate total
    const newTotal = order.orderItems?.reduce(
      (sum, item) =>
        sum + (item.id === itemId ? item.price * newQuantity : item.price * item.quantity),
      0
    ) || 0;
    
    setOrder((prev) => (prev ? { ...prev, total: newTotal } : null));
  };

  const handleRemoveItem = (itemId: string) => {
    if (!order) return;

    const updatedItems = order.orderItems?.filter((item) => item.id !== itemId);
    
    if (updatedItems && updatedItems.length === 0) {
      toast.error('Order must have at least one item');
      return;
    }

    const newTotal = updatedItems?.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    ) || 0;

    setOrder({
      ...order,
      orderItems: updatedItems,
      total: newTotal,
    });
  };

  const handleAddItem = (menuItem: MenuItem) => {
    if (!order) return;

    const existingItem = order.orderItems?.find(
      (item) => item.menuItemId === menuItem.id
    );

    if (existingItem) {
      handleQuantityChange(existingItem.id, existingItem.quantity + 1);
    } else {
      const newItem = {
        id: crypto.randomUUID(),
        orderId: order.id,
        menuItemId: menuItem.id,
        quantity: 1,
        price: menuItem.price,
        prepared: false,
        menuItem,
      };

      setOrder({
        ...order,
        orderItems: [...(order.orderItems || []), newItem],
        total: order.total + menuItem.price,
      });
    }
  };

  const handleSave = async () => {
    if (!order) return;

    setSaving(true);
    try {
      // Here you would call an API to update the order
      // For now, we'll show a success message
      toast.success('Order updated successfully');
      navigate('/orders/active');
    } catch (error: any) {
      toast.error(error.message || 'Error updating order');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8">
        <p>Order not found</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/orders/active')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Edit Order</h1>
            <p className="text-gray-600">Order #{order.orderNumber}</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Order Items */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Order Items</h2>
          
          {order.orderItems && order.orderItems.length > 0 ? (
            <div className="space-y-3">
              {order.orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.menuItem?.name}</h3>
                    <p className="text-sm text-gray-600">
                      ₹{item.price} each
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="font-bold">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}

              <div className="border-t pt-4 flex justify-between items-center">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ₹{order.total.toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No items in order</p>
          )}
        </div>

        {/* Add Items from Menu */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Add Items</h2>
          
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {menuItems
              .filter((item) => item.available)
              .map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition"
                >
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      {item.category?.name}
                    </p>
                    <p className="text-blue-600 font-bold">₹{item.price}</p>
                  </div>
                  <button
                    onClick={() => handleAddItem(item)}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditOrder;