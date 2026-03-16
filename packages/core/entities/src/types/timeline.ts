import { z } from 'zod';
import { BaseEntity, BaseEntitySchema, EntityId } from './base';

/**
 * 时间线项类型
 */
export type TimelineItemType =
  | 'event'       // 事件
  | 'character'   // 人物相关
  | 'world'       // 世界观/历史
  | 'milestone';  // 里程碑

/**
 * 时间线项
 */
export interface TimelineItem {
  id: EntityId;
  type: TimelineItemType;
  title: string;
  description: string;
  startTime: string; // ISO 日期或相对时间格式
  endTime?: string;
  relatedEventIds?: EntityId[];
  relatedCharacterIds?: EntityId[];
  relatedLocationIds?: EntityId[];
  isCanonical: boolean; // 是否为正史
  tags: string[];
}

export const TimelineItemSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['event', 'character', 'world', 'milestone']),
  title: z.string().min(1),
  description: z.string(),
  startTime: z.string(),
  endTime: z.string().optional(),
  relatedEventIds: z.array(z.string().uuid()).optional(),
  relatedCharacterIds: z.array(z.string().uuid()).optional(),
  relatedLocationIds: z.array(z.string().uuid()).optional(),
  isCanonical: z.boolean(),
  tags: z.array(z.string()),
});

/**
 * 时间线集合
 */
export interface Timeline extends BaseEntity {
  type: 'timeline';
  items: TimelineItem[];
  worldSettingId?: EntityId;
}

export const TimelineSchema = BaseEntitySchema.extend({
  type: z.literal('timeline'),
  items: z.array(TimelineItemSchema),
  worldSettingId: z.string().uuid().optional(),
});
