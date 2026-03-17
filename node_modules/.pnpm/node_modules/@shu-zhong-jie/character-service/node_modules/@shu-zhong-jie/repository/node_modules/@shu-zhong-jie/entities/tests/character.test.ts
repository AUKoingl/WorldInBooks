import { describe, it, expect } from 'vitest';
import {
  CharacterSchema,
  CharacterAppearanceSchema,
  CharacterPersonalitySchema,
  CharacterAbilitySchema,
} from '../src/index';

/**
 * 人物实体 Schema 测试
 *
 * 验证 Zod Schema 的验证逻辑是否正确
 */

describe('Character Schemas', () => {
  describe('CharacterAppearanceSchema', () => {
    it('should validate valid appearance', () => {
      const appearance = {
        age: 25,
        height: 175,
        build: '匀称',
        eyeColor: '黑色',
        hairColor: '黑色',
        distinguishingFeatures: ['左眉疤痕'],
      };

      const result = CharacterAppearanceSchema.safeParse(appearance);
      expect(result.success).toBe(true);
    });

    it('should validate minimal appearance', () => {
      const appearance = { age: 30 };

      const result = CharacterAppearanceSchema.safeParse(appearance);
      expect(result.success).toBe(true);
    });

    it('should reject negative age', () => {
      const appearance = { age: -5 };

      const result = CharacterAppearanceSchema.safeParse(appearance);
      expect(result.success).toBe(false);
    });

    it('should reject age over 150', () => {
      const appearance = { age: 200 };

      const result = CharacterAppearanceSchema.safeParse(appearance);
      expect(result.success).toBe(false);
    });
  });

  describe('CharacterPersonalitySchema', () => {
    it('should validate valid personality', () => {
      const personality = {
        traits: ['勇敢', '聪明'],
        mbti: 'INTJ',
        alignment: '中立善良',
        likes: ['读书', '剑术'],
        dislikes: ['欺骗'],
        fears: ['失去亲人'],
        goals: ['成为最强'],
      };

      const result = CharacterPersonalitySchema.safeParse(personality);
      expect(result.success).toBe(true);
    });

    it('should validate minimal personality', () => {
      const personality = {
        traits: ['简单'],
      };

      const result = CharacterPersonalitySchema.safeParse(personality);
      expect(result.success).toBe(true);
    });

    it('should require traits array', () => {
      const personality = {};

      const result = CharacterPersonalitySchema.safeParse(personality);
      expect(result.success).toBe(false);
    });
  });

  describe('CharacterAbilitySchema', () => {
    it('should validate valid ability', () => {
      const ability = {
        name: '剑术',
        description: '精湛的剑术技巧',
        level: 80,
        category: '战斗',
      };

      const result = CharacterAbilitySchema.safeParse(ability);
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const ability = {
        name: '',
        description: '描述',
        level: 50,
      };

      const result = CharacterAbilitySchema.safeParse(ability);
      expect(result.success).toBe(false);
    });

    it('should reject level below 1', () => {
      const ability = {
        name: '技能',
        description: '描述',
        level: 0,
      };

      const result = CharacterAbilitySchema.safeParse(ability);
      expect(result.success).toBe(false);
    });

    it('should reject level above 100', () => {
      const ability = {
        name: '技能',
        description: '描述',
        level: 101,
      };

      const result = CharacterAbilitySchema.safeParse(ability);
      expect(result.success).toBe(false);
    });
  });

  describe('CharacterSchema', () => {
    const validCharacter = {
      id: '12345678-1234-1234-1234-123456789abc',
      name: '测试角色',
      description: '这是一个测试角色',
      type: 'character' as const,
      appearance: {
        age: 25,
      },
      personality: {
        traits: ['勇敢'],
      },
      abilities: [
        {
          name: '剑术',
          description: '精湛的剑术技巧',
          level: 80,
        },
      ],
      background: '出身于剑术世家',
      tags: ['主角', '剑士'],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user-1',
      updatedBy: 'user-1',
    };

    it('should validate valid character', () => {
      const result = CharacterSchema.safeParse(validCharacter);
      expect(result.success).toBe(true);
    });

    it('should validate minimal character', () => {
      const minimal = {
        id: '12345678-1234-1234-1234-123456789abc',
        name: '最小角色',
        type: 'character' as const,
        appearance: { age: 20 },
        personality: { traits: [] },
        abilities: [],
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = CharacterSchema.safeParse(minimal);
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const invalid = {
        ...validCharacter,
        name: '',
      };

      const result = CharacterSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject name over 200 characters', () => {
      const invalid = {
        ...validCharacter,
        name: 'a'.repeat(201),
      };

      const result = CharacterSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject invalid type', () => {
      const invalid = {
        ...validCharacter,
        type: 'invalid-type',
      };

      const result = CharacterSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should accept character without optional fields', () => {
      const withoutOptionals = {
        id: '12345678-1234-1234-1234-123456789abc',
        name: '无可选字段',
        type: 'character' as const,
        appearance: { age: 30 },
        personality: { traits: ['简单'] },
        abilities: [],
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = CharacterSchema.safeParse(withoutOptionals);
      expect(result.success).toBe(true);
    });
  });
});
