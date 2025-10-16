import { useState } from 'react';
import { Users, Store, Bell, Printer } from 'lucide-react';
import UserManagement from '../features/settings/components/UserManagement';
import RestaurantSettings from '../features/settings/components/RestaurantSettings';
import PrinterSettings from '../features/settings/components/PrinterSettings';

type TabType = 'users' | 'restaurant' | 'notifications' | 'printer';

const Settings = () => {
  const [activeTab, setActiveTab] = useState<TabType>('restaurant');

  const tabs = [
    { id: 'restaurant' as TabType, label: 'Restaurant', icon: Store },
    { id: 'users' as TabType, label: 'Users', icon: Users },
    { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
    { id: 'printer' as TabType, label: 'Printer', icon: Printer },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your restaurant settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition relative ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-gray-50 rounded-lg p-6">
        {activeTab === 'restaurant' && <RestaurantSettings />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'notifications' && (
          <div className="text-center py-12 text-gray-500">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-semibold">Notifications Settings</p>
            <p className="text-sm">Coming soon...</p>
          </div>
        )}
        {activeTab === 'printer' && <PrinterSettings />}
      </div>
    </div>
  );
};

export default Settings;