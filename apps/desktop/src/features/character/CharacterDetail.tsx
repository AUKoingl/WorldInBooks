import type { Character } from '@shu-zhong-jie/entities';

/**
 * 人物详情属性
 */
interface CharacterDetailProps {
  character: Character;
  onEdit: () => void;
  onClose: () => void;
}

/**
 * 人物详情组件 - 展示人物的完整信息
 */
export function CharacterDetail({ character, onEdit, onClose }: CharacterDetailProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* 头部 */}
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-xl font-bold text-blue-600">
              {character.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{character.name}</h2>
            <div className="flex gap-2 mt-1">
              <span className="text-sm text-gray-500">
                {character.appearance.age}岁
              </span>
              {character.personality.mbti && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm text-purple-600 font-medium">
                    {character.personality.mbti}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            编辑
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* 内容 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* 基本信息 */}
          <section>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
              基本信息
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              {character.description && (
                <div>
                  <span className="text-sm font-medium text-gray-700">描述</span>
                  <p className="mt-1 text-gray-600">{character.description}</p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-700">标签</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {character.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                  {character.tags.length === 0 && (
                    <span className="text-sm text-gray-400">无标签</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* 外貌特征 */}
          <section>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
              外貌特征
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">年龄</dt>
                  <dd className="mt-1 text-gray-900">{character.appearance.age}岁</dd>
                </div>
                {character.appearance.height && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">身高</dt>
                    <dd className="mt-1 text-gray-900">{character.appearance.height}cm</dd>
                  </div>
                )}
                {character.appearance.build && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">体型</dt>
                    <dd className="mt-1 text-gray-900">{character.appearance.build}</dd>
                  </div>
                )}
                {character.appearance.eyeColor && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">瞳色</dt>
                    <dd className="mt-1 text-gray-900">{character.appearance.eyeColor}</dd>
                  </div>
                )}
                {character.appearance.hairColor && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">发色</dt>
                    <dd className="mt-1 text-gray-900">{character.appearance.hairColor}</dd>
                  </div>
                )}
                {character.appearance.distinguishingFeatures &&
                  character.appearance.distinguishingFeatures.length > 0 && (
                    <div className="col-span-2">
                      <dt className="text-sm font-medium text-gray-500">显著特征</dt>
                      <dd className="mt-2 flex flex-wrap gap-2">
                        {character.appearance.distinguishingFeatures.map((feature, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm"
                          >
                            {feature}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
              </dl>
            </div>
          </section>

          {/* 性格特点 */}
          <section>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
              性格特点
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              {(character.personality.mbti || character.personality.alignment) && (
                <div className="grid grid-cols-2 gap-4">
                  {character.personality.mbti && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">MBTI</dt>
                      <dd className="mt-1">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          {character.personality.mbti}
                        </span>
                      </dd>
                    </div>
                  )}
                  {character.personality.alignment && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">阵营</dt>
                      <dd className="mt-1 text-gray-900">{character.personality.alignment}</dd>
                    </div>
                  )}
                </div>
              )}

              {character.personality.traits.length > 0 && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">性格特质</dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {character.personality.traits.map((trait, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                      >
                        {trait}
                      </span>
                    ))}
                  </dd>
                </div>
              )}

              {character.personality.likes && character.personality.likes.length > 0 && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">喜好</dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {character.personality.likes.map((like, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm"
                      >
                        {like}
                      </span>
                    ))}
                  </dd>
                </div>
              )}

              {character.personality.dislikes &&
                character.personality.dislikes.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">厌恶</dt>
                    <dd className="mt-2 flex flex-wrap gap-2">
                      {character.personality.dislikes.map((dislike, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm"
                        >
                          {dislike}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}

              {character.personality.fears && character.personality.fears.length > 0 && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">恐惧</dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {character.personality.fears.map((fear, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm"
                      >
                        {fear}
                      </span>
                    ))}
                  </dd>
                </div>
              )}

              {character.personality.goals && character.personality.goals.length > 0 && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">目标</dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {character.personality.goals.map((goal, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm"
                      >
                        {goal}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </div>
          </section>

          {/* 能力 */}
          {character.abilities && character.abilities.length > 0 && (
            <section>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                能力
              </h3>
              <div className="space-y-3">
                {character.abilities.map((ability, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{ability.name}</h4>
                        {ability.category && (
                          <span className="text-xs text-gray-500">{ability.category}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">等级</span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            ability.level >= 80
                              ? 'bg-red-100 text-red-700'
                              : ability.level >= 50
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {ability.level}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{ability.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 背景故事 */}
          {character.background && (
            <section>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                背景故事
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {character.background}
                </p>
              </div>
            </section>
          )}

          {/* 创建/更新时间 */}
          <section className="pt-4 border-t">
            <div className="flex justify-between text-sm text-gray-400">
              <span>
                创建于：{new Date(character.createdAt).toLocaleString('zh-CN')}
              </span>
              <span>
                更新于：{new Date(character.updatedAt).toLocaleString('zh-CN')}
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
