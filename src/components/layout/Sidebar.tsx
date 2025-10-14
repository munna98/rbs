import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingCart,
  Users,
  Package,
  BarChart3,
  Settings,
  LogOut,
  ChefHat,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../features/auth/authSlice';

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['ADMIN', 'CASHIER', 'WAITER'] },
    { icon: ShoppingCart, label: 'Orders', path: '/orders', roles: ['ADMIN', 'CASHIER', 'WAITER'] },
    { icon: UtensilsCrossed, label: 'Menu', path: '/menu', roles: ['ADMIN', 'CASHIER'] },
    { icon: Users, label: 'Tables', path: '/tables', roles: ['ADMIN', 'CASHIER', 'WAITER'] },
    { icon: ChefHat, label: 'Kitchen', path: '/kitchen', roles: ['ADMIN', 'CASHIER'] },
    { icon: Package, label: 'Inventory', path: '/inventory', roles: ['ADMIN'] },
    { icon: BarChart3, label: 'Reports', path: '/reports', roles: ['ADMIN'] },
    { icon: Settings, label: 'Settings', path: '/settings', roles: ['ADMIN'] },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role || '')
  );

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">RestaurantPOS</h1>
        <p className="text-gray-400 text-sm mt-1">{user?.role}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold">
              {user?.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-medium">{user?.username}</p>
            <p className="text-xs text-gray-400">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;