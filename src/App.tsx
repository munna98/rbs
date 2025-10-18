import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import Login from './features/auth/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import MenuManagement from './pages/MenuManagement';
import Orders from './pages/Orders';
import ActiveOrders from './pages/ActiveOrders';
import TableManagement from './pages/TableManagement';
import KitchenDisplay from './pages/KitchenDisplay';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import EditOrder from './pages/EditOrder';
import KOTQueue from './pages/KOTQueue';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="menu" element={<MenuManagement />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/active" element={<ActiveOrders />} />
            <Route path="orders/edit/:orderId" element={<EditOrder />} />
            <Route path="tables" element={<TableManagement />} />
            <Route path="kot-queue" element={<KOTQueue />} />
            <Route path="kitchen" element={<KitchenDisplay />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;