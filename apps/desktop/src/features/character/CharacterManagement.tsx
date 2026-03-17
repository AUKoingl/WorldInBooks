import { useEffect, useState } from 'react';
import { CharacterList } from './CharacterList';
import type { Character } from '@shu-zhong-jie/entities';
import { CharacterForm } from './CharacterForm';
import { CharacterDetail } from './CharacterDetail';
import { useCharacterStore } from './store';

// 注意：实际项目中需要从服务层导入
// import { CharacterService } from '@shu-zhong-jie/character-service';

/**
 * 模拟的人物服务（实际项目中应使用真实的服务层）
 */
const createMockCharacter = (data: any): Character => ({
  id: crypto.randomUUID(),
  name: data.name,
  description: data.description,
  type: 'character',
  appearance: data.appearance,
  personality: data.personality,
  abilities: data.abilities,
  background: data.background,
  tags: data.tags,
  createdAt: new Date(),
  updatedAt: new Date(),
});

/**
 * 人物管理容器组件 - 整合所有人物相关功能
 */
export function CharacterManagement() {
  const {
    characters,
    selectedCharacter,
    isFormOpen,
    editingCharacter,
    setCharacters,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    selectCharacter,
    openForm,
    closeForm,
    openDetail,
    closeDetail,
  } = useCharacterStore();

  const [error, setError] = useState<string | null>(null);

  // 加载人物列表
  useEffect(() => {
    // TODO: 实际项目中应从服务层加载数据
    // const loadCharacters = async () => {
    //   try {
    //     const service = new CharacterService(characterRepository);
    //     const data = await service.getAll();
    //     setCharacters(data);
    //   } catch (err) {
    //     setError(err instanceof Error ? err.message : '加载失败');
    //   }
    // };
    // loadCharacters();

    // 模拟数据（开发测试用）
    const mockData: Character[] = [
      {
        id: '1',
        name: '艾伦·沃克',
        description: '被诅咒的少年驱魔师',
        type: 'character',
        appearance: {
          age: 16,
          height: 174,
          build: '瘦削',
          eyeColor: '金色',
          hairColor: '银色',
          distinguishingFeatures: ['额头上的诅咒印记', '左手为寄生型 Innocence'],
        },
        personality: {
          traits: ['善良', '坚强', '温柔'],
          mbti: 'INFJ',
          alignment: '守序善良',
          likes: ['同伴', '红茶', '甜点'],
          dislikes: ['恶魔', '伤害无辜的人'],
          fears: ['失去同伴', '被诅咒吞噬'],
          goals: ['消灭千年伯爵', '拯救灵魂'],
        },
        abilities: [
          {
            name: '神之道化',
            description: '左手可变形成退魔剑或爪形态',
            level: 85,
            category: '寄生型 Innocence',
          },
          {
            name: '退魔之剑',
            description: '斩杀恶魔并净化灵魂',
            level: 80,
            category: '攻击技能',
          },
        ],
        background: '自幼被养父收养，养父去世后成为驱魔师。左手的 Innocence 是他战斗的武器，也是诅咒的根源。',
        tags: ['驱魔师', '主角', '诅咒'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: '利娜莉·李',
        description: '黑色教团的室长助手',
        type: 'character',
        appearance: {
          age: 17,
          height: 168,
          build: '匀称',
          eyeColor: '绿色',
          hairColor: '黑色',
          distinguishingFeatures: ['长发', '美丽的外表'],
        },
        personality: {
          traits: ['温柔', '勇敢', '聪明'],
          mbti: 'ESFJ',
          alignment: '守序善良',
          likes: ['艾伦', '同伴', '帮助他人'],
          dislikes: ['恶魔', '分离'],
          fears: ['失去亲人'],
          goals: ['保护同伴', '与哥哥一起战斗'],
        },
        abilities: [
          {
            name: '黑靴',
            description: '装备型 Innocence，可化为强力踢击武器',
            level: 75,
            category: '装备型 Innocence',
          },
        ],
        background: '黑色教团科学班班长考姆伊的妹妹，自幼在教团长 大。拥有极高的同步率。',
        tags: ['驱魔师', '女主角', '中国血统'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        name: '神田优',
        description: '冷静寡言的驱魔师',
        type: 'character',
        appearance: {
          age: 19,
          height: 177,
          build: '修长',
          eyeColor: '蓝色',
          hairColor: '黑色',
          distinguishingFeatures: ['长发束起', '额头上的印记'],
        },
        personality: {
          traits: ['冷静', '孤傲', '执着'],
          mbti: 'ISTP',
          alignment: '中立',
          likes: ['独处', '修行'],
          dislikes: ['吵闹的人', '被命令'],
          fears: ['过去'],
          goals: ['寻找某人'],
        },
        abilities: [
          {
            name: '六幻',
            description: '装备型 Innocence，日本刀',
            level: 90,
            category: '装备型 Innocence',
          },
          {
            name: '界虫一幻',
            description: '从刀身飞出大量虫状生物攻击敌人',
            level: 85,
            category: '攻击技能',
          },
        ],
        background: '第二使徒计划的产物，拥有惊人的恢复能力。一直在寻找某个重要的人。',
        tags: ['驱魔师', '第二使徒', '日本刀'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    setCharacters(mockData);
  }, [setCharacters]);

  // 处理创建人物
  const handleCreate = (data: any) => {
    try {
      const newCharacter = {
        ...createMockCharacter(data),
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addCharacter(newCharacter);
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败');
    }
  };

  // 处理更新人物
  const handleUpdate = (data: any) => {
    if (!editingCharacter) return;

    try {
      const updatedCharacter = {
        ...editingCharacter,
        ...data,
        updatedAt: new Date(),
      };
      updateCharacter(updatedCharacter);
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败');
    }
  };

  // 处理删除人物
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个人物吗？此操作不可恢复。')) return;

    try {
      // TODO: 实际项目中应调用服务层删除
      deleteCharacter(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  // 处理选择人物
  const handleSelect = (character: Character) => {
    selectCharacter(character);
  };

  // 处理编辑
  const handleEdit = (character: Character) => {
    openForm(character);
  };

  // 处理表单取消
  const handleFormCancel = () => {
    closeForm();
  };

  // 处理详情关闭
  const handleDetailClose = () => {
    closeDetail();
  };

  // 处理详情编辑
  const handleDetailEdit = () => {
    if (selectedCharacter) {
      openForm(selectedCharacter);
    }
  };

  // 渲染错误提示
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
        <button
          onClick={() => setError(null)}
          className="mt-2 text-sm text-red-600 hover:text-red-800"
        >
          关闭
        </button>
      </div>
    );
  }

  // 根据视图模式渲染不同内容
  // viewMode 派生逻辑：detail = selectedCharacter !== null && !isFormOpen
  const showDetail = selectedCharacter !== null && !isFormOpen;

  return (
    <div className="h-full">
      {showDetail ? (
        <CharacterDetail
          character={selectedCharacter}
          onEdit={handleDetailEdit}
          onClose={handleDetailClose}
        />
      ) : isFormOpen ? (
        <CharacterForm
          character={editingCharacter}
          onSubmit={editingCharacter ? handleUpdate : handleCreate}
          onCancel={handleFormCancel}
        />
      ) : (
        <div className="h-full flex flex-col">
          {/* 列表头部 */}
          <div className="p-4 border-b flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">人物管理</h1>
            <button
              onClick={() => openForm()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新建人物
            </button>
          </div>

          {/* 人物列表 */}
          <div className="flex-1 overflow-hidden p-4">
            <CharacterList
              characters={characters}
              selectedId={selectedCharacter?.id}
              onSelect={handleSelect}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      )}
    </div>
  );
}
