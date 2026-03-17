import { useState, useEffect } from 'react';
import type { Character, CharacterAppearance, CharacterPersonality, CharacterAbility } from '@shu-zhong-jie/entities';
import { TagListInput } from './TagListInput';

/**
 * 人物表单数据
 */
interface CharacterFormData {
  name: string;
  description: string;
  appearance: {
    age: number;
    height: number | undefined;
    build: string;
    eyeColor: string;
    hairColor: string;
    distinguishingFeatures: string[];
  };
  personality: {
    traits: string[];
    mbti: string;
    alignment: string;
    likes: string[];
    dislikes: string[];
    fears: string[];
    goals: string[];
  };
  abilities: Array<{
    name: string;
    description: string;
    level: number;
    category?: string;
  }>;
  background: string;
  tags: string[];
}

/**
 * 人物表单属性
 */
interface CharacterFormProps {
  character?: Character | null;
  onSubmit: (data: CharacterFormData) => void;
  onCancel: () => void;
}

/**
 * 默认表单数据
 */
const defaultFormData = {
  name: '',
  description: '',
  appearance: {
    age: 18,
    height: undefined as number | undefined,
    build: '',
    eyeColor: '',
    hairColor: '',
    distinguishingFeatures: [] as string[],
  },
  personality: {
    traits: [] as string[],
    mbti: '',
    alignment: '',
    likes: [] as string[],
    dislikes: [] as string[],
    fears: [] as string[],
    goals: [] as string[],
  },
  abilities: [] as Array<{
    name: string;
    description: string;
    level: number;
    category?: string;
  }>,
  background: '',
  tags: [] as string[],
};

/**
 * 人物表单组件 - 用于创建和编辑人物
 */
export function CharacterForm({ character, onSubmit, onCancel }: CharacterFormProps) {
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 编辑模式下填充数据
  useEffect(() => {
    if (character) {
      setFormData({
        name: character.name,
        description: character.description || '',
        appearance: {
          age: character.appearance.age,
          height: character.appearance.height,
          build: character.appearance.build || '',
          eyeColor: character.appearance.eyeColor || '',
          hairColor: character.appearance.hairColor || '',
          distinguishingFeatures: character.appearance.distinguishingFeatures || [],
        },
        personality: {
          traits: character.personality.traits,
          mbti: character.personality.mbti || '',
          alignment: character.personality.alignment || '',
          likes: character.personality.likes || [],
          dislikes: character.personality.dislikes || [],
          fears: character.personality.fears || [],
          goals: character.personality.goals || [],
        },
        abilities: character.abilities,
        background: character.background || '',
        tags: character.tags,
      });
    }
  }, [character]);

  // 验证表单
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = '人物名称不能为空';
    } else if (formData.name.length > 200) {
      newErrors.name = '人物名称不能超过 200 个字符';
    }

    if (formData.appearance.age < 0 || formData.appearance.age > 150) {
      newErrors.age = '年龄必须在 0 到 150 之间';
    }

    formData.abilities.forEach((ability, index) => {
      if (ability.level < 1 || ability.level > 100) {
        newErrors[`ability_${index}`] = '能力等级必须在 1 到 100 之间';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  // 处理输入变化
  const handleChange = (
    section: keyof typeof formData,
    field: string,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as object),
        [field]: value,
      },
    }));
  };

  // 添加标签
  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
  };

  // 移除标签
  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  // 添加能力
  const addAbility = () => {
    setFormData(prev => ({
      ...prev,
      abilities: [
        ...prev.abilities,
        { name: '', description: '', level: 1 },
      ],
    }));
  };

  // 更新能力
  const updateAbility = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      abilities: prev.abilities.map((ability, i) =>
        i === index ? { ...ability, [field]: value } : ability
      ),
    }));
  };

  // 删除能力
  const removeAbility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      abilities: prev.abilities.filter((_, i) => i !== index),
    }));
  };

  // 处理 personality 数组字段变化
  const handlePersonalityArrayChange = {
    add: (field: keyof typeof formData.personality, value: string) => {
      setFormData(prev => ({
        ...prev,
        personality: {
          ...prev.personality,
          [field]: [...(prev.personality[field] as string[]), value],
        },
      }));
    },
    remove: (field: keyof typeof formData.personality, index: number) => {
      setFormData(prev => ({
        ...prev,
        personality: {
          ...prev.personality,
          [field]: (prev.personality[field] as string[]).filter((_: string, i: number) => i !== index),
        },
      }));
    },
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
      {/* 表单头部 */}
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {character ? '编辑人物' : '创建人物'}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition"
          >
            取消
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {character ? '保存' : '创建'}
          </button>
        </div>
      </div>

      {/* 表单内容 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* 基本信息 */}
          <section>
            <h3 className="text-base font-medium text-gray-900 mb-4">基本信息</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', '', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.name
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200'
                  }`}
                  placeholder="请输入人物名称"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', '', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  rows={3}
                  placeholder="简要描述人物特点"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  标签
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    id="tag-input"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="输入标签后按回车"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(e.currentTarget.value.trim());
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 外貌特征 */}
          <section>
            <h3 className="text-base font-medium text-gray-900 mb-4">外貌特征</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  年龄 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.appearance.age}
                  onChange={(e) =>
                    handleChange('appearance', 'age', parseInt(e.target.value) || 0)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.age
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200'
                  }`}
                />
                {errors.age && (
                  <p className="mt-1 text-sm text-red-500">{errors.age}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  身高 (cm)
                </label>
                <input
                  type="number"
                  value={formData.appearance.height || ''}
                  onChange={(e) =>
                    handleChange('appearance', 'height', parseFloat(e.target.value) || undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  体型
                </label>
                <input
                  type="text"
                  value={formData.appearance.build}
                  onChange={(e) =>
                    handleChange('appearance', 'build', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="例如：匀称、瘦弱、健壮"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  瞳色
                </label>
                <input
                  type="text"
                  value={formData.appearance.eyeColor}
                  onChange={(e) =>
                    handleChange('appearance', 'eyeColor', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="例如：黑色、蓝色、绿色"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  发色
                </label>
                <input
                  type="text"
                  value={formData.appearance.hairColor}
                  onChange={(e) =>
                    handleChange('appearance', 'hairColor', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="例如：黑色、金色、棕色"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  显著特征
                </label>
                <input
                  type="text"
                  placeholder="输入后按回车添加"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = e.currentTarget.value.trim();
                      if (value) {
                        handleChange('appearance', 'distinguishingFeatures', [
                          ...formData.appearance.distinguishingFeatures,
                          value,
                        ]);
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.appearance.distinguishingFeatures.map((feature, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs flex items-center gap-1"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() =>
                          handleChange(
                            'appearance',
                            'distinguishingFeatures',
                            formData.appearance.distinguishingFeatures.filter(
                              (_, i) => i !== idx
                            )
                          )
                        }
                        className="hover:text-gray-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 性格特点 */}
          <section>
            <h3 className="text-base font-medium text-gray-900 mb-4">性格特点</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    MBTI
                  </label>
                  <input
                    type="text"
                    value={formData.personality.mbti}
                    onChange={(e) =>
                      handleChange('personality', 'mbti', e.target.value.toUpperCase())
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="例如：INTJ、ENFP"
                    maxLength={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    阵营
                  </label>
                  <input
                    type="text"
                    value={formData.personality.alignment}
                    onChange={(e) =>
                      handleChange('personality', 'alignment', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="例如：守序善良、混乱中立"
                  />
                </div>
              </div>

              {/* 性格特质 */}
              <TagListInput
                label="性格特质"
                tags={formData.personality.traits}
                onAdd={(tag) => handlePersonalityArrayChange.add('traits', tag)}
                onRemove={(index) => handlePersonalityArrayChange.remove('traits', index)}
                placeholder="输入特质后按回车"
                color="purple"
              />

              {/* 喜好 */}
              <TagListInput
                label="喜好"
                tags={formData.personality.likes || []}
                onAdd={(tag) => handlePersonalityArrayChange.add('likes', tag)}
                onRemove={(index) => handlePersonalityArrayChange.remove('likes', index)}
                placeholder="输入喜好后按回车"
                color="green"
              />

              {/* 厌恶 */}
              <TagListInput
                label="厌恶"
                tags={formData.personality.dislikes || []}
                onAdd={(tag) => handlePersonalityArrayChange.add('dislikes', tag)}
                onRemove={(index) => handlePersonalityArrayChange.remove('dislikes', index)}
                placeholder="输入厌恶后按回车"
                color="red"
              />

              {/* 恐惧 */}
              <TagListInput
                label="恐惧"
                tags={formData.personality.fears || []}
                onAdd={(tag) => handlePersonalityArrayChange.add('fears', tag)}
                onRemove={(index) => handlePersonalityArrayChange.remove('fears', index)}
                placeholder="输入恐惧后按回车"
                color="gray"
              />

              {/* 目标 */}
              <TagListInput
                label="目标"
                tags={formData.personality.goals || []}
                onAdd={(tag) => handlePersonalityArrayChange.add('goals', tag)}
                onRemove={(index) => handlePersonalityArrayChange.remove('goals', index)}
                placeholder="输入目标后按回车"
                color="yellow"
              />
            </div>
          </section>

          {/* 能力 */}
          <section>
            <h3 className="text-base font-medium text-gray-900 mb-4">能力</h3>
            <div className="space-y-4">
              {formData.abilities.map((ability, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative"
                >
                  <button
                    type="button"
                    onClick={() => removeAbility(index)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        名称
                      </label>
                      <input
                        type="text"
                        value={ability.name}
                        onChange={(e) =>
                          updateAbility(index, 'name', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="能力名称"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        等级 (1-100)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={ability.level}
                        onChange={(e) =>
                          updateAbility(index, 'level', parseInt(e.target.value) || 1)
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors[`ability_${index}`]
                            ? 'border-red-500 focus:ring-red-200'
                            : 'border-gray-300 focus:ring-blue-200'
                        }`}
                      />
                      {errors[`ability_${index}`] && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors[`ability_${index}`]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        分类
                      </label>
                      <input
                        type="text"
                        value={ability.category || ''}
                        onChange={(e) =>
                          updateAbility(index, 'category', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="例如：魔法、武技"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      描述
                    </label>
                    <textarea
                      value={ability.description}
                      onChange={(e) =>
                        updateAbility(index, 'description', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      rows={2}
                      placeholder="能力描述"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addAbility}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                添加能力
              </button>
            </div>
          </section>

          {/* 背景故事 */}
          <section>
            <h3 className="text-base font-medium text-gray-900 mb-4">背景故事</h3>
            <textarea
              value={formData.background}
              onChange={(e) => handleChange('background', '', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              rows={6}
              placeholder="详细描述人物的背景故事、经历等"
            />
          </section>
        </div>
      </div>
    </form>
  );
}
