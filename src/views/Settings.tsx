import { useState, useEffect } from 'react';
import { Bell, Database, Lock, Network, Save, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { settingsService } from '../services/settingsService';
import type { Settings } from '../services/settingsService';

export default function Settings() {
  const [settings, setSettings] = useState<Partial<Settings>>({
    snmp_version: 'SNMPv2c',
    polling_interval: 60,
    netflow_port: 2055,
    sflow_port: 6343,
    cpu_alert_threshold: 75,
    memory_alert_threshold: 80,
    bandwidth_threshold: 85,
    email_notifications: true,
    data_retention_days: 90,
    auto_archive: true,
    two_factor_auth: true,
    session_timeout_minutes: 30,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const data = await settingsService.getSettings();
        setSettings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleChange = (key: keyof Settings, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    setError('');
    try {
      const saved = await settingsService.saveSettings(settings);
      setSettings(saved);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setSaveStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={value}
        onChange={e => onChange(e.target.checked)}
      />
      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
    </label>
  );

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Network Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Network className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Network Configuration</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SNMP Version</label>
            <select
              value={settings.snmp_version || 'SNMPv2c'}
              onChange={e => handleChange('snmp_version', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>SNMPv2c</option>
              <option>SNMPv3</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Polling Interval (seconds)</label>
            <input
              type="number"
              value={settings.polling_interval || 60}
              onChange={e => handleChange('polling_interval', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">NetFlow Collector Port</label>
            <input
              type="number"
              value={settings.netflow_port || 2055}
              onChange={e => handleChange('netflow_port', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">sFlow Collector Port</label>
            <input
              type="number"
              value={settings.sflow_port || 6343}
              onChange={e => handleChange('sflow_port', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Alert Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Bell className="w-6 h-6 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">Alert Settings</h3>
        </div>
        <div className="space-y-4">
          {[
            { label: 'High CPU Alert Threshold', key: 'cpu_alert_threshold' as keyof Settings, sub: 'Trigger alert when CPU exceeds this %' },
            { label: 'High Memory Alert Threshold', key: 'memory_alert_threshold' as keyof Settings, sub: 'Trigger alert when memory exceeds this %' },
            { label: 'Bandwidth Threshold', key: 'bandwidth_threshold' as keyof Settings, sub: 'Trigger alert when bandwidth exceeds this %' },
          ].map(({ label, key, sub }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{label}</p>
                <p className="text-sm text-gray-600">{sub}</p>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                value={(settings[key] as number) || 0}
                onChange={e => handleChange(key, parseInt(e.target.value))}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              />
            </div>
          ))}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600">Send email alerts for critical events</p>
            </div>
            <Toggle
              value={settings.email_notifications ?? true}
              onChange={v => handleChange('email_notifications', v)}
            />
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Database className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Data Retention Period (days)</p>
              <p className="text-sm text-gray-600">How long to keep historical data</p>
            </div>
            <select
              value={settings.data_retention_days || 90}
              onChange={e => handleChange('data_retention_days', parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[30, 60, 90, 180, 365].map(d => (
                <option key={d} value={d}>{d} Days</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Auto-Archive Reports</p>
              <p className="text-sm text-gray-600">Automatically archive old reports</p>
            </div>
            <Toggle
              value={settings.auto_archive ?? true}
              onChange={v => handleChange('auto_archive', v)}
            />
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Lock className="w-6 h-6 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">Security</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600">Require 2FA for all administrators</p>
            </div>
            <Toggle
              value={settings.two_factor_auth ?? true}
              onChange={v => handleChange('two_factor_auth', v)}
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Session Timeout</p>
              <p className="text-sm text-gray-600">Automatically log out inactive users</p>
            </div>
            <select
              value={settings.session_timeout_minutes || 30}
              onChange={e => handleChange('session_timeout_minutes', parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[15, 30, 60, 240].map(m => (
                <option key={m} value={m}>{m < 60 ? `${m} Minutes` : `${m / 60} Hour${m > 60 ? 's' : ''}`}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Users className="w-6 h-6 text-teal-600" />
          <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                {['Name', 'Email', 'Role', 'Status'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-sm font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Admin User', email: 'admin@zou.ac.zw', role: 'Administrator', status: 'Active' },
                { name: 'Network Operator', email: 'netops@zou.ac.zw', role: 'Operator', status: 'Active' },
                { name: 'View Only User', email: 'viewer@zou.ac.zw', role: 'Viewer', status: 'Active' },
              ].map((user, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">{user.role}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">{user.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4">
        {saveStatus === 'success' && (
          <div className="flex items-center space-x-2 text-green-700 text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="flex items-center space-x-2 text-red-700 text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            <span>Failed to save settings</span>
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
        >
          <Save className="w-5 h-5" />
          <span>{isSaving ? 'Saving...' : 'Save All Settings'}</span>
        </button>
      </div>
    </div>
  );
}
