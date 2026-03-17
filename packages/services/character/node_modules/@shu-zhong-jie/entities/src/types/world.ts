import { z } from 'zod';
import { BaseEntity, BaseEntitySchema } from './base';
import { FactionSchema } from './faction';

/**
 * 规则类型
 */
export const RuleTypeSchema = z.enum(['magic', 'technology', 'social', 'physical', 'metaphysical']);

/**
 * 规则类型
 */
export type RuleType = z.infer<typeof RuleTypeSchema>;

/**
 * 规则体系 Schema
 */
export const RuleSystemSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  type: RuleTypeSchema,
  rules: z.array(z.string()),
  exceptions: z.array(z.string()).optional(),
});

/**
 * 规则体系
 */
export type RuleSystem = z.infer<typeof RuleSystemSchema>;

/**
 * 世界观实体 Schema
 */
export const WorldSettingSchema = BaseEntitySchema.extend({
  type: z.literal('world-setting'),
  overview: z.string(),
  timePeriod: z.string().optional(),
  ruleSystems: z.array(RuleSystemSchema),
  factions: z.array(FactionSchema),
  timeline: z.array(
    z.object({
      era: z.string(),
      year: z.number(),
      description: z.string(),
    })
  ),
  locationIds: z.array(z.string().uuid()),
  tags: z.array(z.string()),
});

/**
 * 世界观实体
 */
export type WorldSetting = z.infer<typeof WorldSettingSchema>;
