import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './views/Dashboard';
import Routers from './views/Routers';
import Traffic from './views/Traffic';
import Alerts from './views/Alerts';
import Analytics from './views/Analytics';
import Reports from './views/Reports';
import Settings from './views/Settings';

function App() {
  const [activeView, setActiveView] = useState('dashboard');

  const getViewTitle = () => {
    switch (activeView) {
      case 'dashboard':
        return 'Network Dashboard';
      case 'routers':
        return 'Router Management';
      case 'traffic':
        return 'Traffic Analysis';
      case 'alerts':
        return 'System Alerts';
      case 'analytics':
        return 'AI Analytics';
      case 'reports':
        return 'Reports & Export';
      case 'settings':
        return 'System Settings';
      default:
        return 'Network Dashboard';
    }
  };

  const getViewSubtitle = () => {
    switch (activeView) {
      case 'dashboard':
        return 'Real-time overview of network infrastructure';
      case 'routers':
        return 'Monitor and manage all network routers';
      case 'traffic':
        return 'Analyze traffic patterns and bandwidth usage';
      case 'alerts':
        return 'View and manage system alerts';
      case 'analytics':
        return 'AI-powered insights and predictions';
      case 'reports':
        return 'Generate and download network reports';
      case 'settings':
        return 'Configure system preferences';
      default:
        return '';
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'routers':
        return <Routers />;
      case 'traffic':
        return <Traffic />;
      case 'alerts':
        return <Alerts />;
      case 'analytics':
        return <Analytics />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1">
        <Header title={getViewTitle()} subtitle={getViewSubtitle()} />
        <main className="p-8">{renderView()}</main>
      </div>
    </div>
  );
}

export default App;
