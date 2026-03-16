import { z } from 'zod';
import { BaseEntity, BaseEntitySchema, EntityId } from './base';

/**
 * 人物外貌特征
 */
export interface CharacterAppearance {
  age: number;
  height?: number;
  build?: string;
  eyeColor?: string;
  hairColor?: string;
  distinguishingFeatures?: string[];
}

export const CharacterAppearanceSchema = z.object({
  age: z.number().min(0).max(150),
  height: z.number().min(0).optional(),
  build: z.string().optional(),
  eyeColor: z.string().optional(),
  hairColor: z.string().optional(),
  distinguishingFeatures: z.array(z.string()).optional(),
});

/**
 * 人物性格特征
 */
export interface CharacterPersonality {
  traits: string[];
  mbti?: string;
  alignment?: string;
  likes?: string[];
  dislikes?: string[];
  fears?: string[];
  goals?: string[];
}

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
 * 人物能力
 */
export interface CharacterAbility {
  name: string;
  description: string;
  level: number; // 1-100
  category?: string;
}

export const CharacterAbilitySchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  level: z.number().min(1).max(100),
  category: z.string().optional(),
});

/**
 * 人物实体
 */
export interface Character extends BaseEntity {
  type: 'character';
  appearance: CharacterAppearance;
  personality: CharacterPersonality;
  abilities: CharacterAbility[];
  background?: string;
  tags: string[];
}

/**
 * 人物 Schema
 */
export const CharacterSchema = BaseEntitySchema.extend({
  type: z.literal('character'),
  appearance: CharacterAppearanceSchema,
  personality: CharacterPersonalitySchema,
  abilities: z.array(CharacterAbilitySchema),
  background: z.string().optional(),
  tags: z.array(z.string()),
});
