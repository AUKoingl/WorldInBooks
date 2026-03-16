import { z } from 'zod';
import { BaseEntity, BaseEntitySchema } from './base';

/**
 * 人物外貌特征 Schema
 */
export const CharacterAppearanceSchema = z.object({
  age: z.number().min(0).max(150),
  height: z.number().min(0).optional(),
  build: z.string().optional(),
  eyeColor: z.string().optional(),
  hairColor: z.string().optional(),
  distinguishingFeatures: z.array(z.string()).optional(),
});

/**
 * 人物外貌特征
 */
export type CharacterAppearance = z.infer<typeof CharacterAppearanceSchema>;

/**
 * 人物性格特征 Schema
 */
export const CharacterPersonalitySchema = z.object({
  traits: z.array(z.string()),
  mbti: z.string().optional(),
  alignment: z.string().optional(),
  likes: z.array(z.string()).optional(),
  dislikes: z.array(z.string()).optional(),
  fears: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
});

/**
 * 人物性格特征
 */
export type CharacterPersonality = z.infer<typeof CharacterPersonalitySchema>;

/**
 * 人物能力 Schema
 */
export const CharacterAbilitySchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  level: z.number().min(1).max(100),
  category: z.string().optional(),
});

/**
 * 人物能力
 */
export type CharacterAbility = z.infer<typeof CharacterAbilitySchema>;

/**
 * 人物实体 Schema
 */
export const CharacterSchema = BaseEntitySchema.extend({
  type: z.literal('character'),
  appearance: CharacterAppearanceSchema,
  personality: CharacterPersonalitySchema,
  abilities: z.array(CharacterAbilitySchema),
  background: z.string().optional(),
  tags: z.array(z.string()),
});

/**
 * 人物实体
 */
export type Character = z.infer<typeof CharacterSchema>;
