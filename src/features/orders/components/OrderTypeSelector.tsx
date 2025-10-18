import { Store, ShoppingBag, Truck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setOrderType } from '../orderSlice';

const OrderTypeSelector = () => {
  const dispatch = useAppDispatch();
  const { orderType } = useAppSelector((state) => state.order);

  const orderTypes = [
    {
      type: 'DINE_IN',
      label: 'Dine In',
      icon: Store,
      color: 'blue',
      description: 'Order for table service',
    },
    {
      type: 'TAKEAWAY',
      label: 'Takeaway',
      icon: ShoppingBag,
      color: 'green',
      description: 'Customer pickup order',
    },
    {
      type: 'DELIVERY',
      label: 'Delivery',
      icon: Truck,
      color: 'orange',
      description: 'Home delivery order',
    },
  ];

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      blue: isSelected
        ? 'bg-blue-600 text-white border-blue-600'
        : 'bg-white text-blue-600 border-blue-200 hover:border-blue-400',
      green: isSelected
        ? 'bg-green-600 text-white border-green-600'
        : 'bg-white text-green-600 border-green-200 hover:border-green-400',
      orange: isSelected
        ? 'bg-orange-600 text-white border-orange-600'
        : 'bg-white text-orange-600 border-orange-200 hover:border-orange-400',
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4">Select Order Type</h2>
      <div className="grid grid-cols-3 gap-4">
        {orderTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = orderType === type.type;
          
          return (
            <button
              key={type.type}
              onClick={() => dispatch(setOrderType(type.type))}
              className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${getColorClasses(
                type.color,
                isSelected
              )}`}
            >
              <Icon className={`w-10 h-10 mx-auto mb-3 ${isSelected ? 'text-white' : ''}`} />
              <h3 className="font-bold text-lg mb-1">{type.label}</h3>
              <p className={`text-sm ${isSelected ? 'text-white opacity-90' : 'text-gray-600'}`}>
                {type.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTypeSelector;