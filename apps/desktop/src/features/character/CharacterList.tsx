import { useState, useMemo } from 'react';
import type { Character } from '@shu-zhong-jie/entities';

/**
 * 人物列表组件属性
 */
interface CharacterListProps {
  characters: Character[];
  selectedId?: string;
  onSelect: (character: Character) => void;
  onEdit?: (character: Character) => void;
  onDelete?: (id: string) => void;
}

/**
 * 人物列表组件 - 展示人物列表
 */
export function CharacterList({
  characters,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: CharacterListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // 过滤人物列表 - 使用 useMemo 优化性能
  const filteredCharacters = useMemo(() => {
    return characters.filter((char) =>
      char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      char.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [characters, searchTerm]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* 搜索栏 */}
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="搜索人物..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 人物列表 */}
      <div className="flex-1 overflow-y-auto">
        {filteredCharacters.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            暂无人物
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredCharacters.map((character) => (
              <li
                key={character.id}
                className={`p-4 cursor-pointer transition hover:bg-gray-50 ${
                  selectedId === character.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => onSelect(character)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{character.name}</h3>
                    {character.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {character.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {character.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {character.tags.length > 3 && (
                        <span className="px-2 py-0.5 text-xs text-gray-400">
                          +{character.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {onEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(character);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition"
                        title="编辑"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(character.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 transition"
                        title="删除"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span>年龄：{character.appearance.age}</span>
                  {character.personality.traits.length > 0 && (
                    <span>特征：{character.personality.traits.slice(0, 2).join(', ')}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 列表底部统计 */}
      <div className="p-3 border-t text-sm text-gray-500">
        共 {filteredCharacters.length} 个人物
        {filteredCharacters.length !== characters.length && (
          <span>（过滤了 {characters.length - filteredCharacters.length} 个）</span>
        )}
      </div>
    </div>
  );
}
