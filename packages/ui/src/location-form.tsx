import React, { useState, useCallback } from 'react';
import { Location, LocationType, LocationAtmosphere, LocationSchema } from '@shu-zhong-jie/entities';
import { Button } from './button';
import { Input } from './input';

export interface LocationFormProps {
  initialData?: Partial<Location>;
  onSubmit: (data: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

// 常量定义在组件外部，避免每次渲染时重新创建
const LOCATION_TYPES: { value: LocationType; label: string }[] = [
  { value: 'city', label: '城市' },
  { value: 'building', label: '建筑' },
  { value: 'room', label: '房间' },
  { value: 'wilderness', label: '野外' },
  { value: 'dungeon', label: '副本' },
  { value: 'realm', label: '领域' },
  { value: 'other', label: '其他' },
];

const ATMOSPHERES: { value: LocationAtmosphere; label: string }[] = [
  { value: 'peaceful', label: '宁静' },
  { value: 'tense', label: '紧张' },
  { value: 'mysterious', label: '神秘' },
  { value: 'dangerous', label: '危险' },
  { value: 'sacred', label: '神圣' },
  { value: 'cursed', label: '被诅咒' },
  { value: 'lively', label: '热闹' },
  { value: 'desolate', label: '荒凉' },
];

export const LocationForm: React.FC<LocationFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    locationType: (initialData?.locationType || 'other') as LocationType,
    atmosphere: (initialData?.atmosphere || []) as LocationAtmosphere[],
    parentLocationId: initialData?.parentLocationId,
    worldSettingIds: initialData?.worldSettingIds || [],
    eventIds: initialData?.eventIds || [],
    characterIds: initialData?.characterIds || [],
    coordinates: initialData?.coordinates,
    physicalDescription: initialData?.physicalDescription || '',
    history: initialData?.history || '',
    tags: initialData?.tags || [],
    childLocationIds: initialData?.childLocationIds || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState('');

  // 优化：使用函数式更新，避免依赖 errors 导致不必要的重渲染
  const handleChange = useCallback((field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 只在有错误时清除，使用函数式更新避免不必要的状态变更
    setErrors((prev) => prev[field] ? { ...prev, [field]: '' } : prev);
  }, []);

  const handleAddTag = useCallback(() => {
    if (newTag.trim()) {
      const trimmed = newTag.trim();
      setFormData((prev) => ({
        ...prev,
        tags: prev.tags.includes(trimmed) ? prev.tags : [...prev.tags, trimmed],
      }));
      setNewTag('');
    }
  }, [newTag]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  }, []);

  const handleToggleAtmosphere = useCallback((atmosphere: LocationAtmosphere) => {
    setFormData((prev) => ({
      ...prev,
      atmosphere: prev.atmosphere.includes(atmosphere)
        ? prev.atmosphere.filter((a) => a !== atmosphere)
        : [...prev.atmosphere, atmosphere],
    }));
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 使用 Zod schema 进行验证
    const nameValidation = LocationSchema.shape.name.safeParse(formData.name);
    if (!nameValidation.success) {
      newErrors.name = '地点名称不能为空或超过 200 个字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const data: Omit<Location, 'id' | 'createdAt' | 'updatedAt'> = {
      type: 'location',
      name: formData.name,
      description: formData.description || undefined,
      locationType: formData.locationType,
      atmosphere: formData.atmosphere,
      parentLocationId: formData.parentLocationId,
      childLocationIds: formData.childLocationIds,
      worldSettingIds: formData.worldSettingIds,
      eventIds: formData.eventIds,
      characterIds: formData.characterIds,
      coordinates: formData.coordinates,
      physicalDescription: formData.physicalDescription || undefined,
      history: formData.history || undefined,
      tags: formData.tags,
    };

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="地点名称"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          placeholder="例如：青云山、天龙城"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            地点类型
          </label>
          <select
            value={formData.locationType}
            onChange={(e) => handleChange('locationType', e.target.value as LocationType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {LOCATION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          地点描述
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="简要描述这个地点..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          地点氛围
        </label>
        <div className="grid grid-cols-4 gap-2">
          {ATMOSPHERES.map((atm) => (
            <button
              key={atm.value}
              type="button"
              onClick={() => handleToggleAtmosphere(atm.value)}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                formData.atmosphere.includes(atm.value)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {atm.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          物理描述
        </label>
        <textarea
          value={formData.physicalDescription}
          onChange={(e) => handleChange('physicalDescription', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="描述地点的外观、地形、建筑特征等..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          历史背景
        </label>
        <textarea
          value={formData.history}
          onChange={(e) => handleChange('history', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="这个地点的历史、传说、重要事件等..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          标签
        </label>
        <div className="flex gap-2 mb-2">
          <input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="添加标签后按回车"
          />
          <Button type="button" onClick={handleAddTag} variant="outline" size="sm">
            添加
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag: string) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" onClick={onCancel} variant="outline">
          取消
        </Button>
        <Button type="submit" variant="primary">
          {initialData?.id ? '更新' : '创建'}
        </Button>
      </div>
    </form>
  );
};
