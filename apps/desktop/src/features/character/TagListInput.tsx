import { useState } from 'react';

/**
 * 标签列表输入组件属性
 */
interface TagListInputProps {
  label: string;
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (index: number) => void;
  placeholder?: string;
  color?: 'blue' | 'purple' | 'green' | 'red' | 'yellow' | 'gray';
}

/**
 * 颜色配置映射
 */
const colorConfig = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-700', hover: 'hover:text-blue-900' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', hover: 'hover:text-purple-900' },
  green: { bg: 'bg-green-100', text: 'text-green-700', hover: 'hover:text-green-900' },
  red: { bg: 'bg-red-100', text: 'text-red-700', hover: 'hover:text-red-900' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', hover: 'hover:text-yellow-900' },
  gray: { bg: 'bg-gray-100', text: 'text-gray-700', hover: 'hover:text-gray-900' },
};

/**
 * 标签列表输入组件 - 用于添加/删除标签式输入
 */
export function TagListInput({
  label,
  tags,
  onAdd,
  onRemove,
  placeholder = `输入${label}后按回车`,
  color = 'blue',
}: TagListInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = inputValue.trim();
      if (value) {
        onAdd(value);
        setInputValue('');
      }
    }
  };

  const config = colorConfig[color];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
          placeholder={placeholder}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className={`px-2 py-1 ${config.bg} ${config.text} rounded text-sm flex items-center gap-1`}
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemove(index)}
              className={`${config.hover} transition`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
