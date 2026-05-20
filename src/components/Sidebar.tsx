import { Activity, AlertTriangle, BarChart3, FileText, LayoutGrid as Layout, Router, Settings, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  allowedViews: string[];
}

const ALL_MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',       icon: Layout },
  { id: 'routers',   label: 'Routers',          icon: Router },
  { id: 'traffic',   label: 'Traffic Analysis', icon: Activity },
  { id: 'alerts',    label: 'Alerts',           icon: AlertTriangle },
  { id: 'analytics', label: 'AI Analytics',     icon: BarChart3 },
  { id: 'reports',   label: 'Reports',          icon: FileText },
  { id: 'settings',  label: 'Settings',         icon: Settings },
];

const ROLE_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  Administrator: { label: 'Admin',    bg: 'rgba(59,130,246,0.2)',  text: '#93c5fd' },
  Operator:      { label: 'Operator', bg: 'rgba(16,185,129,0.2)',  text: '#6ee7b7' },
  Viewer:        { label: 'Viewer',   bg: 'rgba(139,92,246,0.2)',  text: '#c4b5fd' },
};

export default function Sidebar({ activeView, onViewChange, allowedViews }: SidebarProps) {
  const { user, logout } = useAuth();
  const badge = user ? ROLE_BADGE[user.role] : null;

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      {/* Brand */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-1.5 shadow-md flex-shrink-0">
            <img src="./logo.avif" alt="ICT Logo" className="w-full h-full object-contain drop-shadow-sm" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Ministry of ICT</h1>
            <p className="text-xs text-slate-400">Network Intelligence</p>
          </div>
        </div>
      </div>

      {/* Logged-in user chip */}
      {user && (
        <div className="px-4 pt-4">
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-slate-800">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: badge?.bg ?? '#1e40af', color: badge?.text ?? '#93c5fd' }}
            >
              {user.initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              {badge && (
                <span
                  className="inline-block text-xs font-medium px-1.5 py-0.5 rounded mt-0.5"
                  style={{ background: badge.bg, color: badge.text }}
                >
                  {badge.label}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-4 mb-2">Navigation</p>
        <ul className="space-y-1">
          {ALL_MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            const isAllowed = allowedViews.includes(item.id);

            return (
              <li key={item.id}>
                <button
                  id={`nav-${item.id}`}
                  onClick={() => isAllowed && onViewChange(item.id)}
                  disabled={!isAllowed}
                  title={!isAllowed ? `Not available for ${user?.role} role` : undefined}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors text-sm ${
                    !isAllowed
                      ? 'opacity-35 cursor-not-allowed text-slate-500'
                      : isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {!isAllowed && <Lock className="w-3.5 h-3.5 text-slate-600" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* System status + logout */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        <div className="bg-slate-800 rounded-lg p-4">
          <p className="text-xs text-slate-400 mb-2">System Status</p>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">All Systems Operational</span>
          </div>
        </div>

        <button
          id="sidebar-logout-btn"
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-colors border border-slate-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
