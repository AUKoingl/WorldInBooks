import { z } from 'zod';
import { BaseEntity, BaseEntitySchema } from './base';

/**
 * 事件类型
 */
export const EventTypeSchema = z.enum([
  'plot',
  'subplot',
  'conflict',
  'turning',
  'revelation',
  'meeting',
  'battle',
  'other',
]);

/**
 * 事件类型
 */
export type EventType = z.infer<typeof EventTypeSchema>;

/**
 * 事件重要性
 */
export const EventImportanceSchema = z.enum(['low', 'medium', 'high', 'critical']);

/**
 * 事件重要性
 */
export type EventImportance = z.infer<typeof EventImportanceSchema>;

/**
 * 事件 Schema
 */
export const EventSchema = BaseEntitySchema.extend({
  type: z.literal('event'),
  eventType: EventTypeSchema,
  importance: EventImportanceSchema,
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

/**
 * 事件实体
 */
export type Event = z.infer<typeof EventSchema>;
