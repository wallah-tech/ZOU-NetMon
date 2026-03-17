import { useState, useEffect } from 'react';
import { Calendar, Download, FileText, Filter, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { reportService, Report } from '../services/reportService';

const REPORT_TYPES = ['Traffic Analysis', 'Performance Report', 'AI Analytics', 'Capacity Planning', 'Security Report'];
const DATE_RANGES = ['Last 24 Hours', 'Last 7 Days', 'Last 30 Days', 'Last 3 Months'];
const FORMATS = ['PDF', 'Excel', 'CSV', 'JSON'];

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [genType, setGenType] = useState(REPORT_TYPES[0]);
  const [genRange, setGenRange] = useState(DATE_RANGES[1]);
  const [genFormat, setGenFormat] = useState(FORMATS[0]);

  const load = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await reportService.getReports();
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    const sub = reportService.subscribeToChanges(() => {
      load();
    });
    return () => { sub.unsubscribe(); };
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    setSuccess('');
    try {
      await reportService.generateReport({ type: genType, date_range: genRange, format: genFormat });
      setSuccess(`Report "${genType}" generated successfully!`);
      await load();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await reportService.deleteReport(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete report');
    } finally {
      setDeletingId(null);
    }
  };

  const typeCount: Record<string, number> = {};
  for (const r of reports) typeCount[r.type] = (typeCount[r.type] || 0) + 1;
  const popular = Object.entries(typeCount).sort(([, a], [, b]) => b - a).slice(0, 3);

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Plus className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Generate New Report</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={genType}
              onChange={e => setGenType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {REPORT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={genRange}
              onChange={e => setGenRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DATE_RANGES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
            <select
              value={genFormat}
              onChange={e => setGenFormat(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {FORMATS.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
            >
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Available Reports ({reports.length})</h3>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
            <Calendar className="w-4 h-4" />
            <span>Date Range</span>
          </button>
          <button
            onClick={load}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Report Name</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Type</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Size</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500">Loading reports...</td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500">No reports yet</td></tr>
              ) : (
                reports.map(report => (
                  <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <span className="font-medium text-gray-900">{report.title}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {report.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {reportService.formatSize(report.size_bytes)}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          report.status === 'ready' ? 'bg-green-100 text-green-800' :
                          report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {report.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end space-x-2">
                        {report.status === 'ready' && (
                          <button
                            onClick={() => reportService.downloadReport(report)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-blue-600"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(report.id)}
                          disabled={deletingId === report.id}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-600 disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-sm font-semibold text-gray-600 mb-4">Report Statistics</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Reports</span>
              <span className="text-lg font-bold text-gray-900">{reports.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ready</span>
              <span className="text-lg font-bold text-gray-900">{reports.filter(r => r.status === 'ready').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending</span>
              <span className="text-lg font-bold text-gray-900">{reports.filter(r => r.status === 'pending').length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-sm font-semibold text-gray-600 mb-4">Popular Types</h4>
          <div className="space-y-2">
            {popular.map(([type, count]) => (
              <div key={type} className="text-sm">
                <p className="font-medium text-gray-900">{type}</p>
                <p className="text-xs text-gray-500">{count} report{count !== 1 ? 's' : ''}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-sm font-semibold text-gray-600 mb-4">Quick Actions</h4>
          <div className="space-y-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-2 px-4 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              Generate Report
            </button>
            <button
              onClick={load}
              className="w-full py-2 px-4 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Refresh List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
