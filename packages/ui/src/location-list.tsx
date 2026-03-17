import React from 'react';
import { Location } from '@shu-zhong-jie/entities';
import { LocationCard } from './location-card';

export interface LocationListProps {
  locations: Location[];
  onSelect?: (location: Location) => void;
  onEdit?: (location: Location) => void;
  onDelete?: (location: Location) => void;
  emptyMessage?: string;
}

export const LocationList: React.FC<LocationListProps> = ({
  locations,
  onSelect,
  onEdit,
  onDelete,
  emptyMessage = '暂无地点数据',
}) => {
  if (locations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {locations.map((location) => (
        <LocationCard
          key={location.id}
          location={location}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
