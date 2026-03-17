import { Relationship, RelationshipSchema } from '@shu-zhong-jie/entities';
import type { RelationshipRepository } from '@shu-zhong-jie/repository';

/**
 * 关系类型定义
 */
export type CharacterRelationshipType =
  | 'family'      // 家人
  | 'friend'      // 朋友
  | 'enemy'       // 敌人
  | 'lover'       // 恋人
  | 'master'      // 师徒
  | 'colleague'   // 同事
  | 'rival';      // 对手

/**
 * 创建关系输入
 */
export interface CreateRelationshipInput {
  sourceCharacterId: string;
  targetCharacterId: string;
  relationshipType: CharacterRelationshipType;
  strength: number; // 1-100
  description?: string;
  establishedAt?: string;
  tags?: string[];
}

/**
 * 人物关系服务 - 处理人物之间的关系逻辑
 */
export class CharacterRelationshipService {
  private repository: RelationshipRepository;

  constructor(repository: RelationshipRepository) {
    this.repository = repository;
  }

  /**
   * 验证关系数据
   */
  private validate(input: CreateRelationshipInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!input.sourceCharacterId) {
      errors.push('源人物 ID 不能为空');
    }

    if (!input.targetCharacterId) {
      errors.push('目标人物 ID 不能为空');
    }

    if (input.sourceCharacterId === input.targetCharacterId) {
      errors.push('不能与自己建立关系');
    }

    if (input.strength < 1 || input.strength > 100) {
      errors.push('关系强度必须在 1 到 100 之间');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 创建人物关系
   */
  async create(input: CreateRelationshipInput): Promise<Relationship> {
    const validation = this.validate(input);
    if (!validation.valid) {
      throw new Error(`验证失败：${validation.errors.join('; ')}`);
    }

    const relationship = {
      name: `${input.relationshipType} 关系`,
      description: input.description || '',
      type: 'relationship' as const,
      sourceType: 'character' as const,
      sourceId: input.sourceCharacterId,
      targetType: 'character' as const,
      targetId: input.targetCharacterId,
      relationshipType: input.relationshipType,
      direction: 'bidirectional' as const,
      strength: input.strength,
      establishedAt: input.establishedAt,
      tags: input.tags || [],
    };

    return this.repository.create(relationship);
  }

  /**
   * 获取人物的所有关系
   */
  async getRelationshipsForCharacter(characterId: string): Promise<Relationship[]> {
    // 注意：当前实现需要遍历所有关系来筛选
    // 后续可以添加仓储层的过滤方法
    const all = await this.repository.findAll();
    return all.filter(rel =>
      rel.sourceId === characterId || rel.targetId === characterId
    );
  }

  /**
   * 获取两个人物之间的关系
   */
  async getRelationshipBetween(sourceId: string, targetId: string): Promise<Relationship | null> {
    const all = await this.repository.findAll();
    return all.find(rel =>
      rel.sourceType === 'character' &&
      rel.targetType === 'character' &&
      ((rel.sourceId === sourceId && rel.targetId === targetId) ||
       (rel.sourceId === targetId && rel.targetId === sourceId))
    ) || null;
  }

  /**
   * 删除人物关系
   */
  async deleteRelationship(relationshipId: string): Promise<void> {
    await this.repository.delete(relationshipId);
  }

  /**
   * 更新关系强度
   */
  async updateRelationshipStrength(relationshipId: string, strength: number): Promise<Relationship> {
    if (strength < 1 || strength > 100) {
      throw new Error('关系强度必须在 1 到 100 之间');
    }

    const result = await this.repository.update(relationshipId, { strength });
    if (!result) {
      throw new Error(`关系不存在：${relationshipId}`);
    }
    return result;
  }

  /**
   * 获取人物的关系网络（一度关联）
   */
  async getCharacterNetwork(characterId: string): Promise<{
    relationships: Relationship[];
    relatedCharacterIds: string[];
  }> {
    const relationships = await this.getRelationshipsForCharacter(characterId);
    const relatedCharacterIds = relationships.map(rel =>
      rel.sourceId === characterId ? rel.targetId : rel.sourceId
    );

    return {
      relationships,
      relatedCharacterIds: [...new Set(relatedCharacterIds)],
    };
  }
}
