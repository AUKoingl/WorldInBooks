import { z } from 'zod';
import { BaseEntity, BaseEntitySchema, EntityId } from './base';

/**
 * 势力类型
 */
export type FactionType =
  | 'sect'         // 宗门/门派
  | 'kingdom'      // 王国/王朝
  | 'organization' // 组织/协会
  | 'family'       // 家族
  | 'guild'        // 公会
  | 'alliance'     // 联盟
  | 'empire'       // 帝国
  | 'rebel'        // 叛逆势力
  | 'neutral'      // 中立势力
  | 'other';       // 其他

/**
 * 势力规模
 */
export type FactionScale =
  | 'tiny'        // 小型（<10 人）
  | 'small'      // 中小型（10-50 人）
  | 'medium'     // 中型（50-200 人）
  | 'large'      // 大型（200-1000 人）
  | 'massive'    // 超大型（>1000 人）
  | 'empire'     // 帝国级

/**
 * 势力立场
 */
export type FactionAlignment =
  | 'good'        // 善良
  | 'neutral'     // 中立
  | 'evil'        // 邪恶
  | 'chaotic'     // 混乱
  | 'lawful';     // 守序

/**
 * 势力等级结构
 */
export interface FactionRank {
  name: string;           // 等级名称（如：宗主、长老、弟子）
  level: number;          // 等级层级（1 为最高）
  description?: string;   // 等级描述
  privileges?: string[];  // 特权列表
}

export const FactionRankSchema = z.object({
  name: z.string().min(1),
  level: z.number().min(1),
  description: z.string().optional(),
  privileges: z.array(z.string()).optional(),
});

/**
 * 势力实体
 */
export interface Faction extends BaseEntity {
  type: 'faction';
  factionType: FactionType;
  scale: FactionScale;
  alignment: FactionAlignment;
  motto?: string;              // 势力格言
  headquarters?: EntityId;     // 总部地点 ID
  parentFactionId?: EntityId;  // 上级势力 ID
  childFactionIds: EntityId[]; // 下属势力 IDs
  memberIds: EntityId[];       // 成员 IDs（Character）
  enemyFactionIds: EntityId[]; // 敌对势力
  allyFactionIds: EntityId[];  // 盟友势力
  ranks: FactionRank[];        // 等级结构
  influenceLevel: number;      // 影响力 1-100
  wealthLevel: number;         // 财富等级 1-100
  militaryLevel: number;       // 军事等级 1-100
  rules?: string[];            // 势力规矩
  history?: string;            // 势力历史
  tags: string[];
}

/**
 * 势力 Schema
 */
export const FactionSchema = BaseEntitySchema.extend({
  type: z.literal('faction'),
  factionType: z.enum([
    'sect', 'kingdom', 'organization', 'family', 'guild',
    'alliance', 'empire', 'rebel', 'neutral', 'other'
  ]),
  scale: z.enum(['tiny', 'small', 'medium', 'large', 'massive', 'empire']),
  alignment: z.enum(['good', 'neutral', 'evil', 'chaotic', 'lawful']),
  motto: z.string().optional(),
  headquarters: z.string().uuid().optional(),
  parentFactionId: z.string().uuid().optional(),
  childFactionIds: z.array(z.string().uuid()),
  memberIds: z.array(z.string().uuid()),
  enemyFactionIds: z.array(z.string().uuid()),
  allyFactionIds: z.array(z.string().uuid()),
  ranks: z.array(FactionRankSchema),
  influenceLevel: z.number().min(1).max(100),
  wealthLevel: z.number().min(1).max(100),
  militaryLevel: z.number().min(1).max(100),
  rules: z.array(z.string()).optional(),
  history: z.string().optional(),
  tags: z.array(z.string()),
});
