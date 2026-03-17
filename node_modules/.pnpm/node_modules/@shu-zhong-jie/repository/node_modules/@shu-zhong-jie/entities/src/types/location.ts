import { z } from 'zod';
import { BaseEntity, BaseEntitySchema } from './base';

/**
 * 地点类型
 */
export const LocationTypeSchema = z.enum([
  'city',
  'building',
  'room',
  'wilderness',
  'dungeon',
  'realm',
  'other',
]);

/**
 * 地点类型
 */
export type LocationType = z.infer<typeof LocationTypeSchema>;

/**
 * 地点氛围标签
 */
export const LocationAtmosphereSchema = z.enum([
  'peaceful',
  'tense',
  'mysterious',
  'dangerous',
  'sacred',
  'cursed',
  'lively',
  'desolate',
]);

/**
 * 地点氛围
 */
export type LocationAtmosphere = z.infer<typeof LocationAtmosphereSchema>;

/**
 * 地点 Schema
 */
export const LocationSchema = BaseEntitySchema.extend({
  type: z.literal('location'),
  locationType: LocationTypeSchema,
  atmosphere: z.array(LocationAtmosphereSchema),
  parentLocationId: z.string().uuid().optional(),
  childLocationIds: z.array(z.string().uuid()),
  worldSettingIds: z.array(z.string().uuid()),
  eventIds: z.array(z.string().uuid()),
  characterIds: z.array(z.string().uuid()),
  coordinates: z
    .object({
      x: z.number().optional(),
      y: z.number().optional(),
      description: z.string().optional(),
    })
    .optional(),
  physicalDescription: z.string().optional(),
  history: z.string().optional(),
  tags: z.array(z.string()),
});

/**
 * 地点实体
 */
export type Location = z.infer<typeof LocationSchema>;
