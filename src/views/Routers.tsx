import { useState, useEffect } from 'react';
import { Cpu, HardDrive, Network, RefreshCw, WifiOff, Plus, CreditCard as Edit2, Trash2, AlertCircle } from 'lucide-react';
import RouterModal from '../components/RouterModal';
import { routerService } from '../services/routerService';
import { Router, CreateRouterInput } from '../types/router';

export default function Routers() {
  const [routers, setRouters] = useState<Router[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRouter, setEditingRouter] = useState<Router | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadRouters();
  }, []);

  const loadRouters = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await routerService.getRouters();
      setRouters(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load routers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRouter = () => {
    setEditingRouter(undefined);
    setIsModalOpen(true);
  };

  const handleEditRouter = (router: Router) => {
    setEditingRouter(router);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data: CreateRouterInput) => {
    try {
      setIsSubmitting(true);
      if (editingRouter) {
        await routerService.updateRouter(editingRouter.id, data);
      } else {
        await routerService.createRouter(data);
      }
      await loadRouters();
      setIsModalOpen(false);
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRouter = async (id: string) => {
    try {
      await routerService.deleteRouter(id);
      await loadRouters();
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete router');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'offline':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUsageColor = (value: number) => {
    if (value >= 80) return 'bg-red-500';
    if (value >= 60) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Total Routers</p>
          <p className="text-3xl font-bold text-gray-900">{routers.length}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadRouters}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleAddRouter}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Router</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading routers...</p>
        </div>
      ) : routers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Network className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No routers configured yet</p>
          <button
            onClick={handleAddRouter}
            className="mt-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Add your first router
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {routers.map((router) => (
            <div
              key={router.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{router.name}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        router.status
                      )}`}
                    >
                      {router.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{router.location}</p>
                  <p className="text-xs text-gray-500 mt-1">IP: {router.ip_address}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  {router.status === 'offline' ? (
                    <WifiOff className="w-6 h-6 text-red-600" />
                  ) : (
                    <Network className="w-6 h-6 text-blue-600" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Cpu className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-600">CPU Usage</span>
                  </div>
                  <div className="flex items-end space-x-2">
                    <span className="text-2xl font-bold text-gray-900">{Math.round(router.cpu_usage)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getUsageColor(router.cpu_usage)}`}
                      style={{ width: `${router.cpu_usage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <HardDrive className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-600">Memory</span>
                  </div>
                  <div className="flex items-end space-x-2">
                    <span className="text-2xl font-bold text-gray-900">{Math.round(router.memory_usage)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getUsageColor(router.memory_usage)}`}
                      style={{ width: `${router.memory_usage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 text-sm mb-4">
                <div>
                  <span className="text-gray-600">Uptime: </span>
                  <span className="font-semibold text-gray-900">{formatUptime(router.uptime_seconds)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Devices: </span>
                  <span className="font-semibold text-gray-900">{router.connected_devices}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditRouter(router)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(router.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <RouterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        router={editingRouter}
        isLoading={isSubmitting}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Router</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this router? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteRouter(deleteConfirm)}
                className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
