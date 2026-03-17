import { create } from 'zustand';
import type { Character } from '@shu-zhong-jie/entities';

/**
 * 人物状态管理
 */
interface CharacterState {
  // 数据
  characters: Character[];
  selectedCharacter: Character | null;

  // UI 状态
  isFormOpen: boolean;
  editingCharacter: Character | null;

  // 派生状态（viewMode 可以从其他状态派生）
  // viewMode = selectedCharacter !== null && !isFormOpen ? 'detail' : 'list'

  // 动作
  setCharacters: (characters: Character[]) => void;
  addCharacter: (character: Character) => void;
  updateCharacter: (character: Character) => void;
  deleteCharacter: (id: string) => void;
  selectCharacter: (character: Character | null) => void;
  openForm: (character?: Character | null) => void;
  closeForm: () => void;
  openDetail: (character: Character) => void;
  closeDetail: () => void;
}

/**
 * 人物 Store
 */
export const useCharacterStore = create<CharacterState>((set) => ({
  // 初始状态
  characters: [],
  selectedCharacter: null,
  isFormOpen: false,
  editingCharacter: null,

  // 设置人物列表
  setCharacters: (characters) => set({ characters }),

  // 添加人物
  addCharacter: (character) =>
    set((state) => ({
      characters: [...state.characters, character],
    })),

  // 更新人物
  updateCharacter: (character) =>
    set((state) => ({
      characters: state.characters.map((c) =>
        c.id === character.id ? character : c
      ),
    })),

  // 删除人物
  deleteCharacter: (id) =>
    set((state) => ({
      characters: state.characters.filter((c) => c.id !== id),
      selectedCharacter: state.selectedCharacter?.id === id ? null : state.selectedCharacter,
    })),

  // 选择人物
  selectCharacter: (character) => set({ selectedCharacter: character }),

  // 打开表单
  openForm: (character) =>
    set({
      isFormOpen: true,
      editingCharacter: character || null,
    }),

  // 关闭表单
  closeForm: () =>
    set({
      isFormOpen: false,
      editingCharacter: null,
    }),

  // 打开详情
  openDetail: (character) =>
    set({
      selectedCharacter: character,
    }),

  // 关闭详情
  closeDetail: () =>
    set({
      selectedCharacter: null,
    }),
}));
