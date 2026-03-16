import { z } from 'zod';
import { BaseEntity, BaseEntitySchema } from './base';

/**
 * 关系类型
 */
export const RelationshipTypeSchema = z.enum([
  'family',
  'friend',
  'enemy',
  'lover',
  'master',
  'colleague',
  'rival',
  'participant',
  'witness',
  'victim',
  'beneficiary',
  'resident',
  'visitor',
  'owner',
  'occurred_at',
  'causes',
  'precedes',
  'correlates',
]);

/**
 * 关系类型
 */
export type RelationshipType = z.infer<typeof RelationshipTypeSchema>;

/**
 * 关系方向
 */
export const RelationshipDirectionSchema = z.enum(['unidirectional', 'bidirectional']);

/**
 * 关系方向
 */
export type RelationshipDirection = z.infer<typeof RelationshipDirectionSchema>;

/**
 * 关系实体 Schema
 */
export const RelationshipSchema = BaseEntitySchema.extend({
  type: z.literal('relationship'),
  sourceType: z.enum(['character', 'event', 'location']),
  sourceId: z.string().uuid(),
  targetType: z.enum(['character', 'event', 'location']),
  targetId: z.string().uuid(),
  relationshipType: RelationshipTypeSchema,
  direction: RelationshipDirectionSchema,
  strength: z.number().min(1).max(100),
  description: z.string().optional(),
  establishedAt: z.string().optional(),
  tags: z.array(z.string()),
});

/**
 * 关系实体
 */
export type Relationship = z.infer<typeof RelationshipSchema>;
