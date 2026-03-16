import { z } from 'zod';
import { BaseEntity, BaseEntitySchema } from './base';

/**
 * 时间线项类型
 */
export const TimelineItemTypeSchema = z.enum(['event', 'character', 'world', 'milestone']);

/**
 * 时间线项类型
 */
export type TimelineItemType = z.infer<typeof TimelineItemTypeSchema>;

/**
 * 时间线项 Schema
 */
export const TimelineItemSchema = z.object({
  id: z.string().uuid(),
  type: TimelineItemTypeSchema,
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
 * 时间线项
 */
export type TimelineItem = z.infer<typeof TimelineItemSchema>;

/**
 * 时间线集合 Schema
 */
export const TimelineSchema = BaseEntitySchema.extend({
  type: z.literal('timeline'),
  items: z.array(TimelineItemSchema),
  worldSettingId: z.string().uuid().optional(),
});

/**
 * 时间线集合
 */
export type Timeline = z.infer<typeof TimelineSchema>;
