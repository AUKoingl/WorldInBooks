import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Location, LocationType } from '@shu-zhong-jie/entities';
import { LocationList, LocationForm, Button } from '@shu-zhong-jie/ui';
import { useLocationRepository } from '../hooks/use-location-repository';

export interface LocationManagementPageProps {
  onBack?: () => void;
}

type FilterType = LocationType | 'all';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

// 防抖函数
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const LocationManagementPage: React.FC<LocationManagementPageProps> = ({ onBack }) => {
  const {
    locations,
    isLoading,
    error,
    createLocation,
    updateLocation,
    deleteLocation,
  } = useLocationRepository();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [toasts, setToasts] = useState<Toast[]>([]);

  // 使用防抖优化搜索
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Toast 通知函数
  const addToast = (type: ToastType, message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    // 3 秒后自动移除
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // 使用 useMemo 优化过滤逻辑
  const filteredLocations = useMemo(() => {
    return locations.filter((location) => {
      const matchesSearch = debouncedSearchTerm === '' ||
        location.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        location.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesType = filterType === 'all' || location.locationType === filterType;
      return matchesSearch && matchesType;
    });
  }, [locations, debouncedSearchTerm, filterType]);

  const handleCreate = () => {
    setSelectedLocation(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (location: Location) => {
    setSelectedLocation(location);
    setIsFormOpen(true);
  };

  const handleDelete = async (location: Location) => {
    if (window.confirm(`确定要删除地点"${location.name}"吗？`)) {
      try {
        await deleteLocation(location.id);
        addToast('success', `地点"${location.name}"删除成功`);
      } catch (err) {
        addToast('error', `删除失败：${err instanceof Error ? err.message : '未知错误'}`);
      }
    }
  };

  const handleSubmit = async (data: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (selectedLocation) {
        // 更新
        await updateLocation(selectedLocation.id, data);
        addToast('success', `地点"${data.name}"更新成功`);
      } else {
        // 创建
        await createLocation(data);
        addToast('success', `地点"${data.name}"创建成功`);
      }
      setIsFormOpen(false);
      setSelectedLocation(undefined);
    } catch (err) {
      addToast('error', `操作失败：${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedLocation(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast 通知 */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
              toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
              'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* 顶部导航栏 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  title="返回主页"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
              )}
              <h1 className="text-2xl font-bold text-gray-900">地点管理</h1>
            </div>
            <Button onClick={handleCreate} variant="primary" size="md" disabled={isLoading}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新建地点
            </Button>
          </div>
        </div>
      </header>

      {/* 主要内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 加载状态 */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">加载中...</span>
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* 筛选和搜索栏 - 仅在加载完成后显示 */}
        {!isLoading && (
          <>
            <div className="bg-white rounded-lg shadow mb-6 p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="搜索地点名称或描述..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as FilterType)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">全部类型</option>
                    <option value="city">城市</option>
                    <option value="building">建筑</option>
                    <option value="room">房间</option>
                    <option value="wilderness">野外</option>
                    <option value="dungeon">副本</option>
                    <option value="realm">领域</option>
                    <option value="other">其他</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 地点列表 */}
            <LocationList
              locations={filteredLocations}
              onSelect={setSelectedLocation}
              onEdit={handleEdit}
              onDelete={handleDelete}
              emptyMessage={searchTerm || filterType !== 'all' ? '没有找到匹配的地点' : '暂无地点数据，点击上方按钮创建第一个地点'}
            />

            {/* 统计信息 */}
            <div className="mt-6 text-sm text-gray-500">
              共 {filteredLocations.length} 个地点
              {filteredLocations.length !== locations.length && `（已筛选，原始共 ${locations.length} 个）`}
            </div>
          </>
        )}
      </main>

      {/* 新建/编辑弹窗 */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {selectedLocation ? '编辑地点' : '新建地点'}
              </h2>
              <LocationForm
                initialData={selectedLocation}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
