import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, FileText, AlertTriangle, TrendingUp, Settings, Menu } from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Activity, label: 'Dashboard' },
    { path: '/logs', icon: FileText, label: 'Logs' },
    { path: '/anomalies', icon: AlertTriangle, label: 'Anomalies' },
    { path: '/predict', icon: TrendingUp, label: 'Predictions' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gray-800 border-b border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <Link to="/" className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
            <Activity className="h-8 w-8 text-primary-400" />
            <span className="text-xl font-bold text-gray-100">
              AI DevOps Monitor
            </span>
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-success-500 animate-pulse"></div>
            <span className="text-sm text-gray-300">System Online</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
