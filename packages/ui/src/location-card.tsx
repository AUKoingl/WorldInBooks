import React from 'react';
import { Location, LocationType, LocationAtmosphere } from '@shu-zhong-jie/entities';

export interface LocationCardProps {
  location: Location;
  onSelect?: (location: Location) => void;
  onEdit?: (location: Location) => void;
  onDelete?: (location: Location) => void;
}

const locationTypeLabels: Record<LocationType, string> = {
  city: '城市',
  building: '建筑',
  room: '房间',
  wilderness: '野外',
  dungeon: '副本',
  realm: '领域',
  other: '其他',
};

const atmosphereLabels: Record<LocationAtmosphere, string> = {
  peaceful: '宁静',
  tense: '紧张',
  mysterious: '神秘',
  dangerous: '危险',
  sacred: '神圣',
  cursed: '被诅咒',
  lively: '热闹',
  desolate: '荒凉',
};

const atmosphereColors: Record<LocationAtmosphere, string> = {
  peaceful: 'bg-green-100 text-green-800',
  tense: 'bg-red-100 text-red-800',
  mysterious: 'bg-purple-100 text-purple-800',
  dangerous: 'bg-orange-100 text-orange-800',
  sacred: 'bg-yellow-100 text-yellow-800',
  cursed: 'bg-gray-100 text-gray-800',
  lively: 'bg-pink-100 text-pink-800',
  desolate: 'bg-stone-100 text-stone-800',
};

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(location);
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onSelect?.(location)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`查看地点 ${location.name} 的详情`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
            <p className="text-sm text-gray-500">
              {locationTypeLabels[location.locationType]}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(location);
              }}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="编辑"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(location);
              }}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="删除"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {location.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {location.description}
          </p>
        )}

        {location.atmosphere.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {location.atmosphere.map((atm: LocationAtmosphere) => (
              <span
                key={atm}
                className={`px-2 py-0.5 text-xs rounded-full ${atmosphereColors[atm]}`}
              >
                {atmosphereLabels[atm]}
              </span>
            ))}
          </div>
        )}

        {location.physicalDescription && (
          <p className="text-xs text-gray-500 line-clamp-2">
            {location.physicalDescription}
          </p>
        )}

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {location.tags.length} 个标签
          </span>
          <span className="text-xs text-gray-400">
            {location.childLocationIds.length} 个子地点
          </span>
        </div>
      </div>
    </div>
  );
};
