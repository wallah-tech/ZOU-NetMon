import { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Clock, Info, RefreshCw } from 'lucide-react';
import { alertService, Alert, AlertFilter } from '../services/alertService';

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<AlertFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [counts, setCounts] = useState({ total: 0, critical: 0, warnings: 0, acknowledged: 0 });
  const [acknowledging, setAcknowledging] = useState<string | null>(null);

  const load = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [data, countData] = await Promise.all([
        alertService.getAlerts(filter),
        alertService.getAlertCounts(),
      ]);
      setAlerts(data);
      setCounts(countData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    const sub = alertService.subscribeToChanges(() => {
      load();
    });
    return () => { sub.unsubscribe(); };
  }, [filter]);

  const handleAcknowledge = async (id: string) => {
    setAcknowledging(id);
    try {
      await alertService.acknowledgeAlert(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to acknowledge alert');
    } finally {
      setAcknowledging(null);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-orange-50 border-orange-200 text-orange-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const filterButtons: { id: AlertFilter; label: string }[] = [
    { id: 'all', label: 'All Alerts' },
    { id: 'unacknowledged', label: 'Unacknowledged' },
    { id: 'critical', label: 'Critical Only' },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Alerts', value: counts.total, icon: AlertCircle, color: 'text-red-600' },
          { label: 'Critical', value: counts.critical, icon: AlertCircle, color: 'text-red-600' },
          { label: 'Warnings', value: counts.warnings, icon: AlertTriangle, color: 'text-orange-600' },
          { label: 'Acknowledged', value: counts.acknowledged, icon: CheckCircle, color: 'text-green-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">{label}</h3>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{isLoading ? '—' : value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {filterButtons.map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === btn.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <button
          onClick={load}
          disabled={isLoading}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-500">
          No alerts found
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`rounded-xl border-2 p-6 ${getAlertStyle(alert.type)} ${alert.acknowledged ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="mt-1">{getAlertIcon(alert.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-bold">{alert.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                          alert.type === 'critical' ? 'bg-red-200 text-red-900' :
                          alert.type === 'warning' ? 'bg-orange-200 text-orange-900' :
                          'bg-blue-200 text-blue-900'
                        }`}
                      >
                        {alert.type}
                      </span>
                      {alert.acknowledged && (
                        <span className="flex items-center space-x-1 text-xs font-medium">
                          <CheckCircle className="w-4 h-4" />
                          <span>Acknowledged</span>
                        </span>
                      )}
                    </div>
                    <p className="text-sm mb-3">{alert.message}</p>
                    <div className="flex items-center space-x-4 text-xs">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(alert.created_at).toLocaleString()}</span>
                      </span>
                      <span className="font-medium">{alert.router_name}</span>
                    </div>
                  </div>
                </div>
                {!alert.acknowledged && (
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    disabled={acknowledging === alert.id}
                    className="ml-4 px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors border border-gray-300 disabled:opacity-50"
                  >
                    {acknowledging === alert.id ? 'Saving...' : 'Acknowledge'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
