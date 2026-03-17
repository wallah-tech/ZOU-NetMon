import { useState, useEffect, useCallback } from 'react';
import { ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react';
import NetAreaChart from '../components/charts/NetAreaChart';
import NetBarChart from '../components/charts/NetBarChart';
import { trafficService, TrafficStats, TimeRange } from '../services/trafficService';

interface ProtocolData {
  protocol: string;
  count: number;
  total_mb: number;
}

const TIME_RANGES: { id: TimeRange; label: string }[] = [
  { id: 'realtime', label: 'Real-Time' },
  { id: '1h', label: 'Last Hour' },
  { id: '24h', label: 'Last 24 Hours' },
  { id: '7d', label: 'Last Week' },
];

export default function Traffic() {
  const [range, setRange] = useState<TimeRange>('1h');
  const [stats, setStats] = useState<TrafficStats | null>(null);
  const [protocols, setProtocols] = useState<ProtocolData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const [statsData, protoData] = await Promise.all([
        trafficService.getTrafficStats(range),
        trafficService.getProtocolBreakdown(range),
      ]);
      setStats(statsData);
      setProtocols(protoData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load traffic data');
    } finally {
      setIsLoading(false);
    }
  }, [range]);

  useEffect(() => {
    load();
    const sub = trafficService.subscribeToChanges(() => {
      load();
    });
    return () => { sub.unsubscribe(); };
  }, [load]);

  const formatMbps = (mbps: number) => {
    if (mbps >= 1000) return `${(mbps / 1000).toFixed(2)} Gbps`;
    return `${mbps} Mbps`;
  };

  const protocolBarData = protocols.map(p => ({
    protocol: p.protocol,
    total_mb: Math.round(p.total_mb),
  }));

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-wrap gap-2">
          {TIME_RANGES.map(r => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                range === r.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {r.label}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: 'Total Traffic',
            value: isLoading ? '—' : formatMbps(stats?.totalMbps ?? 0),
            sub: 'Average over period',
            icon: ArrowUpCircle,
            bg: 'bg-blue-100',
            iconColor: 'text-blue-600',
          },
          {
            label: 'Inbound Traffic',
            value: isLoading ? '—' : formatMbps(stats?.inboundMbps ?? 0),
            sub: stats ? `${Math.round(((stats.inboundMbps) / Math.max(stats.totalMbps, 1)) * 100)}% of total` : '',
            icon: ArrowDownCircle,
            bg: 'bg-green-100',
            iconColor: 'text-green-600',
          },
          {
            label: 'Outbound Traffic',
            value: isLoading ? '—' : formatMbps(stats?.outboundMbps ?? 0),
            sub: stats ? `${Math.round(((stats.outboundMbps) / Math.max(stats.totalMbps, 1)) * 100)}% of total` : '',
            icon: ArrowUpCircle,
            bg: 'bg-orange-100',
            iconColor: 'text-orange-600',
          },
        ].map(({ label, value, sub, icon: Icon, bg, iconColor }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">{label}</h3>
              <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
            <p className="text-sm text-gray-500">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NetAreaChart
          title="Traffic Flow Timeline"
          data={stats?.timeSeriesData ?? []}
          xKey="time"
          series={[
            { key: 'inbound', name: 'Inbound (Mbps)', color: '#2563eb' },
            { key: 'outbound', name: 'Outbound (Mbps)', color: '#16a34a' },
          ]}
          height={384}
        />
        <NetBarChart
          title="Protocol Distribution"
          data={protocolBarData}
          xKey="protocol"
          series={[{ key: 'total_mb', name: 'Data Transferred (MB)', color: '#7c3aed' }]}
          height={384}
          unitSuffix=" MB"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Traffic Sources</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Source IP</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Destination</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Protocol</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Data Transferred</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Duration</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">Loading...</td></tr>
              ) : (stats?.topSources ?? []).length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No traffic data for this period</td></tr>
              ) : (
                (stats?.topSources ?? []).map(flow => (
                  <tr key={flow.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{flow.source_ip || '—'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{flow.destination || '—'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        {flow.protocol}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">
                      {flow.data_transferred_mb.toFixed(0)} MB
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 text-right">{flow.duration_minutes}m</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
