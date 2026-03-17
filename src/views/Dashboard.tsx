import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, Router, TrendingUp, RefreshCw } from 'lucide-react';
import StatCard from '../components/StatCard';
import NetAreaChart from '../components/charts/NetAreaChart';
import NetBarChart from '../components/charts/NetBarChart';
import { dashboardService, DashboardStats } from '../services/dashboardService';
import { alertService, Alert } from '../services/alertService';
import { trafficService } from '../services/trafficService';

interface TimeSeriesPoint {
  [key: string]: string | number;
  time: string;
  inbound: number;
  outbound: number;
  total: number;
}

interface BandwidthConsumer {
  [key: string]: string | number;
  name: string;
  usage_mbps: number;
  percent: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [trafficSeries, setTrafficSeries] = useState<TimeSeriesPoint[]>([]);
  const [consumers, setConsumers] = useState<BandwidthConsumer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [statsData, alertsData, trafficData, consumersData] = await Promise.all([
        dashboardService.getStats(),
        alertService.getAlerts('all'),
        trafficService.getTrafficStats('1h'),
        dashboardService.getBandwidthConsumers(),
      ]);
      setStats(statsData);
      setRecentAlerts(alertsData.slice(0, 3));
      setTrafficSeries(trafficData.timeSeriesData);
      setConsumers(consumersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const formatBandwidth = (mbps: number) => {
    if (mbps >= 1000) return `${(mbps / 1000).toFixed(1)} Gbps`;
    return `${mbps} Mbps`;
  };

  const campusBarData = stats?.campusStatus.map(c => ({
    campus: c.campus.replace(' Regional', '').replace(' Campus', ''),
    latency: c.avgLatency,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={load}
          disabled={isLoading}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Routers"
          value={isLoading ? '—' : `${stats?.onlineRouters ?? 0}/${stats?.totalRouters ?? 0}`}
          change={stats ? `${stats.totalRouters - stats.onlineRouters} offline/warning` : ''}
          trend="up"
          icon={Router}
          iconColor="bg-blue-600"
        />
        <StatCard
          title="Avg Bandwidth"
          value={isLoading ? '—' : formatBandwidth(stats?.avgBandwidthMbps ?? 0)}
          change="Last hour average"
          trend="neutral"
          icon={Activity}
          iconColor="bg-green-600"
        />
        <StatCard
          title="Active Alerts"
          value={isLoading ? '—' : stats?.activeAlerts ?? 0}
          change="Unacknowledged"
          trend={stats && stats.activeAlerts > 3 ? 'up' : 'down'}
          icon={AlertTriangle}
          iconColor="bg-orange-600"
        />
        <StatCard
          title="Network Health"
          value={isLoading ? '—' : `${stats?.networkHealth ?? 0}%`}
          change="Based on CPU & alerts"
          trend={(stats?.networkHealth ?? 0) >= 90 ? 'up' : 'down'}
          icon={TrendingUp}
          iconColor="bg-teal-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NetAreaChart
          title="Real-Time Traffic Overview (Last Hour)"
          data={trafficSeries}
          xKey="time"
          series={[
            { key: 'inbound', name: 'Inbound (Mbps)', color: '#2563eb' },
            { key: 'outbound', name: 'Outbound (Mbps)', color: '#16a34a' },
          ]}
          height={256}
        />
        <NetBarChart
          title="Latency by Campus (ms)"
          data={campusBarData}
          xKey="campus"
          series={[{ key: 'latency', name: 'Latency (ms)', color: '#7c3aed' }]}
          height={256}
          unitSuffix="ms"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NetAreaChart
            title="24-Hour Traffic Pattern"
            data={trafficSeries}
            xKey="time"
            series={[
              { key: 'total', name: 'Total (Mbps)', color: '#0891b2' },
            ]}
            height={320}
          />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
          {recentAlerts.length === 0 ? (
            <p className="text-sm text-gray-500">No recent alerts</p>
          ) : (
            <div className="space-y-3">
              {recentAlerts.map(alert => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      alert.type === 'critical' ? 'bg-red-500' :
                      alert.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(alert.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Bandwidth Consumers</h3>
          {consumers.length === 0 ? (
            <p className="text-sm text-gray-500">No traffic data available</p>
          ) : (
            <div className="space-y-4">
              {consumers.map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    <span className="text-sm font-semibold text-gray-900">{item.usage_mbps} MB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Campus Connectivity Status</h3>
          {(stats?.campusStatus ?? []).length === 0 ? (
            <p className="text-sm text-gray-500">No campus data available</p>
          ) : (
            <div className="space-y-3">
              {stats!.campusStatus.map((campus, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        campus.status === 'online' ? 'bg-green-500 animate-pulse' :
                        campus.status === 'warning' ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                    />
                    <span className="text-sm font-medium text-gray-900">{campus.campus}</span>
                  </div>
                  <span className="text-xs text-gray-500">Latency: {campus.avgLatency}ms</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
