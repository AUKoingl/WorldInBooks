import { z } from 'zod';
import { BaseEntity, BaseEntitySchema, EntityId } from './base';

/**
 * 规则类型
 */
export type RuleType = 'magic' | 'technology' | 'social' | 'physical' | 'metaphysical';

/**
 * 规则体系
 */
export interface RuleSystem {
  name: string;
  description: string;
  type: RuleType;
  rules: string[];
  exceptions?: string[];
}

export const RuleSystemSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  type: z.enum(['magic', 'technology', 'social', 'physical', 'metaphysical']),
  rules: z.array(z.string()),
  exceptions: z.array(z.string()).optional(),
});

/**
 * 势力/组织
 */
export interface Faction {
  name: string;
  description: string;
  type: string;
  goal?: string;
  allies?: EntityId[];
  enemies?: EntityId[];
  members?: EntityId[]; // Character IDs
  influenceLevel: number; // 1-100
}

export const FactionSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  type: z.string(),
  goal: z.string().optional(),
  allies: z.array(z.string().uuid()).optional(),
  enemies: z.array(z.string().uuid()).optional(),
  members: z.array(z.string().uuid()).optional(),
  influenceLevel: z.number().min(1).max(100),
});

/**
 * 世界观实体
 */
export interface WorldSetting extends BaseEntity {
  type: 'world-setting';
  overview: string;
  timePeriod?: string;
  ruleSystems: RuleSystem[];
  factions: Faction[];
  timeline: {
    era: string;
    year: number;
    description: string;
  }[];
  locationIds: EntityId[];
  tags: string[];
}

export const WorldSettingSchema = BaseEntitySchema.extend({
  type: z.literal('world-setting'),
  overview: z.string(),
  timePeriod: z.string().optional(),
  ruleSystems: z.array(RuleSystemSchema),
  factions: z.array(FactionSchema),
  timeline: z.array(z.object({
    era: z.string(),
    year: z.number(),
    description: z.string(),
  })),
  locationIds: z.array(z.string().uuid()),
  tags: z.array(z.string()),
});
