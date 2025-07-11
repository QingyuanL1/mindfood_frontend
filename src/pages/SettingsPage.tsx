import React, { useState } from 'react';
import { ChevronLeft, CreditCard, Bell, Key, User, Shield, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  
  // Dummy user data - in real app, this would come from your user context/state
  const userData = {
    name: 'Cindy Block',
    email: 'cindy.block@example.com',
    phone: '+1 (555) 123-4567',
    plan: 'Premium Plan',
    nextBilling: 'January 27, 2025',
    card: '**** **** **** 4242',
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  // Navigation tabs data
  const tabs = [
    { id: 'account', label: 'Account', icon: <User className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-5 h-5" /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
  ];

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              defaultValue={userData.name}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              defaultValue={userData.email}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              defaultValue={userData.phone}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">
          Update Password
        </button>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
          </div>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            Enable 2FA
          </button>
        </div>
      </div>
    </div>
  );

  const renderBillingSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Current Plan</h3>
        <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-orange-600">{userData.plan}</p>
              <p className="text-sm text-gray-600">Next billing date: {userData.nextBilling}</p>
            </div>
            <button className="text-orange-600 hover:text-orange-700 font-medium">
              Change Plan
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <CreditCard className="text-gray-400" />
              <span>{userData.card}</span>
            </div>
            <button className="text-orange-600 hover:text-orange-700 font-medium">
              Update
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold mb-4">Billing History</h3>
        <div className="space-y-3">
          {[
            { date: 'Dec 27, 2024', amount: '$29.00', status: 'Paid' },
            { date: 'Nov 27, 2024', amount: '$29.00', status: 'Paid' },
            { date: 'Oct 27, 2024', amount: '$29.00', status: 'Paid' },
          ].map((bill, index) => (
            <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100">
              <div>
                <p className="font-medium">{bill.date}</p>
                <p className="text-sm text-gray-600">{bill.amount}</p>
              </div>
              <span className="text-green-600 text-sm">{bill.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-6">Email Notifications</h3>
        <div className="space-y-6">
          {[
            { title: 'Weekly Progress Report', description: 'Receive a summary of your weekly health progress' },
            { title: 'New Recipe Alerts', description: 'Get notified when new recipes matching your preferences are added' },
            { title: 'Health Tips', description: 'Receive personalized health and nutrition tips' },
            { title: 'Account Updates', description: 'Get important updates about your account and security' },
          ].map((notification, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-gray-100 last:border-0">
              <div className="mb-2 sm:mb-0">
                <p className="font-medium text-gray-900">{notification.title}</p>
                <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer self-end sm:self-center">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-6">App Notifications</h3>
        <div className="space-y-6">
          {[
            { title: 'Meal Reminders', description: 'Get reminded to log your meals and track nutrition' },
            { title: 'Achievement Alerts', description: 'Receive notifications when you reach health goals' },
            { title: 'Community Updates', description: 'Stay informed about community activities and challenges' },
          ].map((notification, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-gray-100 last:border-0">
              <div className="mb-2 sm:mb-0">
                <p className="font-medium text-gray-900">{notification.title}</p>
                <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer self-end sm:self-center">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </button>
            </div>
            <h1 className="text-xl font-semibold">Settings</h1>
            <div className="w-5 sm:w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        {/* Mobile tabs navigation */}
        <div className="md:hidden mb-4 overflow-x-auto">
          <div className="flex space-x-2 p-1 bg-gray-100 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium ${
                  activeTab === tab.id
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:gap-8">
          {/* Sidebar - only visible on md screens and up */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${
                      activeTab === tab.id ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}

                <div className="pt-4 mt-4 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Log out</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm">
              {activeTab === 'account' && renderAccountSettings()}
              {activeTab === 'security' && renderSecuritySettings()}
              {activeTab === 'billing' && renderBillingSettings()}
              {activeTab === 'notifications' && renderNotificationSettings()}
            </div>
          </div>
        </div>
        
        {/* Mobile-only logout button */}
        <div className="md:hidden mt-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-3 rounded-lg text-red-600 bg-white shadow-sm hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;