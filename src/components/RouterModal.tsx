import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Router, CreateRouterInput } from '../types/router';

interface RouterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRouterInput) => Promise<void>;
  router?: Router;
  isLoading?: boolean;
}

export default function RouterModal({
  isOpen,
  onClose,
  onSubmit,
  router,
  isLoading = false,
}: RouterModalProps) {
  const [formData, setFormData] = useState<CreateRouterInput>({
    name: router?.name || '',
    ip_address: router?.ip_address || '',
    location: router?.location || '',
    model: router?.model || '',
    firmware_version: router?.firmware_version || '',
    snmp_enabled: router?.snmp_enabled || false,
    netflow_enabled: router?.netflow_enabled || false,
    sflow_enabled: router?.sflow_enabled || false,
  });

  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.ip_address.trim() || !formData.location.trim()) {
      setError('Name, IP address, and location are required');
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save router');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {router ? 'Edit Router' : 'Add New Router'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Router Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Main Campus Router"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IP Address *
            </label>
            <input
              type="text"
              name="ip_address"
              value={formData.ip_address}
              onChange={handleChange}
              placeholder="e.g., 192.168.1.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select location</option>
              <option value="Main Campus">Main Campus</option>
              <option value="Regional Center North">Regional Center North</option>
              <option value="Regional Center South">Regional Center South</option>
              <option value="Regional Center East">Regional Center East</option>
              <option value="Regional Center West">Regional Center West</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Router Model
            </label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="e.g., Cisco ASR 1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Firmware Version
            </label>
            <input
              type="text"
              name="firmware_version"
              value={formData.firmware_version}
              onChange={handleChange}
              placeholder="e.g., 16.12.03"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-3 pt-2">
            <label className="block text-sm font-medium text-gray-700">
              Data Collection Methods
            </label>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="snmp_enabled"
                name="snmp_enabled"
                checked={formData.snmp_enabled}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="snmp_enabled" className="ml-2 text-sm text-gray-700">
                SNMP Monitoring
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="netflow_enabled"
                name="netflow_enabled"
                checked={formData.netflow_enabled}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="netflow_enabled" className="ml-2 text-sm text-gray-700">
                NetFlow
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="sflow_enabled"
                name="sflow_enabled"
                checked={formData.sflow_enabled}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="sflow_enabled" className="ml-2 text-sm text-gray-700">
                sFlow
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Saving...' : router ? 'Update Router' : 'Add Router'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
