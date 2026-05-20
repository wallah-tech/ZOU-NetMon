import { Bell, Search, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const ROLE_COLORS: Record<string, string> = {
  Administrator: '#3b82f6',
  Operator: '#10b981',
  Viewer: '#8b5cf6',
};

export default function Header({ title, subtitle }: HeaderProps) {
  const { user, logout } = useAuth();

  const avatarBg = user ? ROLE_COLORS[user.role] ?? '#3b82f6' : '#3b82f6';

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search routers, alerts..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>

          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Notifications">
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User info */}
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name ?? 'User'}</p>
              <p className="text-xs text-gray-500">{user?.role ?? ''}</p>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ background: avatarBg }}
            >
              {user?.initials ?? 'U'}
            </div>
          </div>

          {/* Logout */}
          <button
            id="header-logout-btn"
            onClick={logout}
            title="Sign out"
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
