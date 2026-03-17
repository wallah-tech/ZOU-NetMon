import { useState, useEffect } from 'react';
import { Brain, TrendingUp, Zap, CheckCircle, RefreshCw } from 'lucide-react';
import NetLineChart from '../components/charts/NetLineChart';
import NetBarChart from '../components/charts/NetBarChart';
import { analyticsService, Anomaly, Prediction } from '../services/analyticsService';

interface TimelinePoint {
  [key: string]: string | number;
  date: string;
  high: number;
  medium: number;
  low: number;
}

export default function Analytics() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [resolving, setResolving] = useState<string | null>(null);

  const load = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [anomalyData, predictionData, timelineData] = await Promise.all([
        analyticsService.getAnomalies(),
        analyticsService.getPredictions(),
        analyticsService.getAnomalyTimeline(),
      ]);
      setAnomalies(anomalyData);
      setPredictions(predictionData);
      setTimeline(timelineData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleResolve = async (id: string) => {
    setResolving(id);
    try {
      await analyticsService.resolveAnomaly(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve anomaly');
    } finally {
      setResolving(null);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const activeAnomalies = anomalies.filter(a => !a.resolved);
  const confidenceData = predictions.map(p => ({
    metric: p.metric.split(' ')[0],
    confidence: p.confidence,
  }));

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      <div className="flex justify-end">
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
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">AI Models Active</h3>
              <p className="text-sm text-blue-100">Running analysis</p>
            </div>
          </div>
          <p className="text-4xl font-bold">5</p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Active Anomalies</h3>
              <p className="text-sm text-green-100">Requiring attention</p>
            </div>
          </div>
          <p className="text-4xl font-bold">{isLoading ? '—' : activeAnomalies.length}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Predictions Made</h3>
              <p className="text-sm text-orange-100">Active forecasts</p>
            </div>
          </div>
          <p className="text-4xl font-bold">{isLoading ? '—' : predictions.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Powered Predictions</h3>
        {isLoading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : predictions.length === 0 ? (
          <p className="text-gray-500 text-sm">No predictions available</p>
        ) : (
          <div className="space-y-4">
            {predictions.map(prediction => (
              <div key={prediction.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{prediction.metric}</h4>
                    <p className="text-xs text-gray-500">{prediction.timeframe}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600 mb-1">Confidence</p>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-bold rounded-full">
                      {prediction.confidence}%
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Current</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {prediction.current_value}
                      <span className="text-sm text-gray-500 ml-1">{prediction.unit}</span>
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Predicted</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {prediction.predicted_value}
                      <span className="text-sm text-gray-500 ml-1">{prediction.unit}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NetLineChart
          title="Anomaly Detection Timeline (7 Days)"
          data={timeline}
          xKey="date"
          series={[
            { key: 'high', name: 'High', color: '#dc2626' },
            { key: 'medium', name: 'Medium', color: '#ea580c' },
            { key: 'low', name: 'Low', color: '#ca8a04' },
          ]}
          height={320}
        />
        <NetBarChart
          title="ML Model Confidence Scores"
          data={confidenceData}
          xKey="metric"
          series={[{ key: 'confidence', name: 'Confidence (%)', color: '#2563eb' }]}
          height={320}
          unitSuffix="%"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detected Anomalies</h3>
        {isLoading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : anomalies.length === 0 ? (
          <p className="text-gray-500 text-sm">No anomalies detected</p>
        ) : (
          <div className="space-y-4">
            {anomalies.map(anomaly => (
              <div
                key={anomaly.id}
                className={`border-l-4 rounded-lg p-4 ${anomaly.resolved ? 'border-green-400 bg-green-50 opacity-70' : 'border-red-500 bg-red-50'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-sm font-bold text-gray-900">{anomaly.type}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(anomaly.severity)}`}>
                        {anomaly.severity.toUpperCase()}
                      </span>
                      {anomaly.resolved && (
                        <span className="flex items-center space-x-1 text-green-700 text-xs font-medium">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Resolved</span>
                        </span>
                      )}
                      <span className="text-xs text-gray-500">{new Date(anomaly.detected_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{anomaly.description}</p>
                    <div className="flex items-center space-x-4 text-xs">
                      <span className="font-medium text-gray-600">Router: {anomaly.router_name}</span>
                      <span className="font-medium text-gray-600">
                        Confidence: <span className="font-bold text-gray-900">{anomaly.confidence}%</span>
                      </span>
                    </div>
                  </div>
                  {!anomaly.resolved && (
                    <button
                      onClick={() => handleResolve(anomaly.id)}
                      disabled={resolving === anomaly.id}
                      className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {resolving === anomaly.id ? 'Resolving...' : 'Resolve'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
