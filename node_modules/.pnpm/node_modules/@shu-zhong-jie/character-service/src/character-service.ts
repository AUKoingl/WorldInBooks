import { Character, CharacterSchema, CharacterAppearanceSchema, CharacterPersonalitySchema } from '@shu-zhong-jie/entities';
import type { CharacterRepository } from '@shu-zhong-jie/repository';

/**
 * 人物创建输入
 */
export interface CreateCharacterInput {
  name: string;
  description?: string;
  appearance: {
    age: number;
    height?: number;
    build?: string;
    eyeColor?: string;
    hairColor?: string;
    distinguishingFeatures?: string[];
  };
  personality: {
    traits: string[];
    mbti?: string;
    alignment?: string;
    likes?: string[];
    dislikes?: string[];
    fears?: string[];
    goals?: string[];
  };
  abilities: {
    name: string;
    description: string;
    level: number;
    category?: string;
  }[];
  background?: string;
  tags: string[];
}

/**
 * 人物更新输入
 */
export interface UpdateCharacterInput extends Partial<CreateCharacterInput> {}

/**
 * 人物验证结果
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * 人物服务 - 处理人物相关的业务逻辑
 */
export class CharacterService {
  private repository: CharacterRepository;

  constructor(repository: CharacterRepository) {
    this.repository = repository;
  }

  /**
   * 验证人物数据
   */
  validate(input: CreateCharacterInput): ValidationResult {
    const errors: string[] = [];

    // 验证必填字段
    if (!input.name || input.name.trim().length === 0) {
      errors.push('人物名称不能为空');
    }

    if (input.name && input.name.length > 200) {
      errors.push('人物名称不能超过 200 个字符');
    }

    // 验证年龄
    if (input.appearance.age < 0 || input.appearance.age > 150) {
      errors.push('年龄必须在 0 到 150 之间');
    }

    // 验证能力等级
    input.abilities?.forEach((ability, index) => {
      if (ability.level < 1 || ability.level > 100) {
        errors.push(`能力 "${ability.name}" 的等级必须在 1 到 100 之间`);
      }
    });

    // 使用 Zod 进行完整 schema 验证
    const result = CharacterSchema.safeParse({
      id: '00000000-0000-0000-0000-000000000000', // 临时 ID
      type: 'character',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...input,
    });

    if (!result.success) {
      result.error.errors.forEach(err => {
        errors.push(`${err.path.join('.')}: ${err.message}`);
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 创建新人物
   */
  async create(input: CreateCharacterInput): Promise<Character> {
    const validation = this.validate(input);
    if (!validation.valid) {
      throw new Error(`验证失败：${validation.errors.join('; ')}`);
    }

    // 添加 type 字段（仓储层需要）
    const entity = {
      ...input,
      type: 'character' as const,
    };

    return this.repository.create(entity);
  }

  /**
   * 获取人物
   */
  async getById(id: string): Promise<Character | null> {
    return this.repository.findById(id);
  }

  /**
   * 获取所有人物
   */
  async getAll(): Promise<Character[]> {
    return this.repository.findAll();
  }

  /**
   * 更新人物
   */
  async update(id: string, input: UpdateCharacterInput): Promise<Character> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error(`人物不存在：${id}`);
    }

    // 合并数据并验证
    const updated = {
      ...existing,
      ...input,
    };

    const validation = this.validate(updated as unknown as CreateCharacterInput);
    if (!validation.valid) {
      throw new Error(`验证失败：${validation.errors.join('; ')}`);
    }

    const result = await this.repository.update(id, updated as Partial<Character>);
    if (!result) {
      throw new Error(`更新失败：人物 ${id} 不存在`);
    }

    return result;
  }

  /**
   * 删除人物
   */
  async delete(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error(`人物不存在：${id}`);
    }

    await this.repository.delete(id);
  }

  /**
   * 按名称搜索人物
   */
  async searchByName(name: string): Promise<Character[]> {
    const all = await this.repository.findAll();
    return all.filter(char =>
      char.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  /**
   * 按标签筛选人物
   */
  async filterByTags(tags: string[]): Promise<Character[]> {
    const all = await this.repository.findAll();
    return all.filter(char =>
      tags.some(tag => char.tags.includes(tag))
    );
  }

  /**
   * 获取人物统计信息
   */
  getStats(): {
    total: number;
    withBackground: number;
    averageAge: number;
    topTraits: Map<string, number>;
  } {
    return {
      total: 0,
      withBackground: 0,
      averageAge: 0,
      topTraits: new Map(),
    };
  }
}
