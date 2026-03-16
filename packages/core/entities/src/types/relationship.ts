import { z } from 'zod';
import { BaseEntity, BaseEntitySchema, EntityId } from './base';

/**
 * 关系类型
 */
export type RelationshipType =
  // 人物关系
  | 'family'      // 家人
  | 'friend'      // 朋友
  | 'enemy'       // 敌人
  | 'lover'       // 恋人
  | 'master'      // 师徒
  | 'colleague'   // 同事
  | 'rival'       // 对手
  // 人物与事件
  | 'participant' // 参与者
  | 'witness'     // 见证者
  | 'victim'      // 受害者
  | 'beneficiary' // 受益者
  // 人物与地点
  | 'resident'    // 居住
  | 'visitor'     // 访问
  | 'owner'       // 拥有
  // 事件与地点
  | 'occurred_at' // 发生于
  // 事件与事件
  | 'causes'      // 导致
  | 'precedes'    // 先于
  | 'correlates'; // 相关

/**
 * 关系方向
 */
export type RelationshipDirection = 'unidirectional' | 'bidirectional';

/**
 * 关系实体
 */
export interface Relationship extends BaseEntity {
  type: 'relationship';
  sourceType: 'character' | 'event' | 'location';
  sourceId: EntityId;
  targetType: 'character' | 'event' | 'location';
  targetId: EntityId;
  relationshipType: RelationshipType;
  direction: RelationshipDirection;
  strength: number; // 1-100
  description?: string;
  establishedAt?: string;
  tags: string[];
}

export const RelationshipSchema = BaseEntitySchema.extend({
  type: z.literal('relationship'),
  sourceType: z.enum(['character', 'event', 'location']),
  sourceId: z.string().uuid(),
  targetType: z.enum(['character', 'event', 'location']),
  targetId: z.string().uuid(),
  relationshipType: z.enum([
    'family', 'friend', 'enemy', 'lover', 'master', 'colleague', 'rival',
    'participant', 'witness', 'victim', 'beneficiary',
    'resident', 'visitor', 'owner',
    'occurred_at',
    'causes', 'precedes', 'correlates',
  ]),
  direction: z.enum(['unidirectional', 'bidirectional']),
  strength: z.number().min(1).max(100),
  description: z.string().optional(),
  establishedAt: z.string().optional(),
  tags: z.array(z.string()),
});
