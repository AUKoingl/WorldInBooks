import { z } from 'zod';
import { BaseEntity, BaseEntitySchema, EntityId } from './base';

/**
 * 事件类型
 */
export type EventType =
  | 'plot'      // 主线情节
  | 'subplot'   // 支线情节
  | 'conflict'  // 冲突事件
  | 'turning'   // 转折点
  | 'revelation' // 揭示/发现
  | 'meeting'   // 会面
  | 'battle'    // 战斗
  | 'other';    // 其他

/**
 * 事件重要性
 */
export type EventImportance = 'low' | 'medium' | 'high' | 'critical';

/**
 * 事件实体
 */
export interface Event extends BaseEntity {
  type: 'event';
  eventType: EventType;
  importance: EventImportance;
  startTime?: string; // ISO 日期或相对时间
  endTime?: string;
  locationIds: EntityId[];
  characterIds: EntityId[];
  causeEventIds: EntityId[]; // 导致此事件的事件
  effectEventIds: EntityId[]; // 此事件导致的结果
  foreshadowingIds: EntityId[]; // 相关伏笔
  tags: string[];
  notes?: string;
}

export const EventSchema = BaseEntitySchema.extend({
  type: z.literal('event'),
  eventType: z.enum(['plot', 'subplot', 'conflict', 'turning', 'revelation', 'meeting', 'battle', 'other']),
  importance: z.enum(['low', 'medium', 'high', 'critical']),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  locationIds: z.array(z.string().uuid()),
  characterIds: z.array(z.string().uuid()),
  causeEventIds: z.array(z.string().uuid()),
  effectEventIds: z.array(z.string().uuid()),
  foreshadowingIds: z.array(z.string().uuid()),
  tags: z.array(z.string()),
  notes: z.string().optional(),
});
