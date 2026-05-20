import { useState } from 'react';
import { AuthProvider, useAuth, getAllowedViews } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Routers from './views/Routers';
import Traffic from './views/Traffic';
import Alerts from './views/Alerts';
import Analytics from './views/Analytics';
import Reports from './views/Reports';
import Settings from './views/Settings';

// ── Title / subtitle maps ──────────────────────────────────────────────────
const VIEW_META: Record<string, { title: string; subtitle: string }> = {
  dashboard:  { title: 'Network Dashboard',         subtitle: 'Real-time overview of network infrastructure' },
  routers:    { title: 'Router Management',          subtitle: 'Monitor and manage all network routers' },
  traffic:    { title: 'Traffic Analysis',           subtitle: 'Analyze traffic patterns and bandwidth usage' },
  alerts:     { title: 'System Alerts',              subtitle: 'View and manage system alerts' },
  analytics:  { title: 'AI Analytics',               subtitle: 'AI-powered insights and predictions' },
  reports:    { title: 'Reports & Export',           subtitle: 'Generate and download network reports' },
  settings:   { title: 'System Settings',            subtitle: 'Configure system preferences' },
};

function AppShell() {
  const { user, isAuthenticated } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');

  if (!isAuthenticated) return <Login />;

  // Ensure the active view is allowed for the current role; fall back to dashboard
  const allowed = getAllowedViews(user!.role);
  const safeView = allowed.includes(activeView) ? activeView : 'dashboard';

  const handleViewChange = (view: string) => {
    if (allowed.includes(view)) setActiveView(view);
  };

  const meta = VIEW_META[safeView] ?? VIEW_META['dashboard'];

  const renderView = () => {
    switch (safeView) {
      case 'dashboard':  return <Dashboard />;
      case 'routers':    return <Routers />;
      case 'traffic':    return <Traffic />;
      case 'alerts':     return <Alerts />;
      case 'analytics':  return <Analytics />;
      case 'reports':    return <Reports />;
      case 'settings':   return <Settings />;
      default:           return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeView={safeView} onViewChange={handleViewChange} allowedViews={allowed} />
      <div className="flex-1">
        <Header title={meta.title} subtitle={meta.subtitle} />
        <main className="p-8">{renderView()}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
