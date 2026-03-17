/**
 * Neo4j 仓储集成测试
 *
 * 运行前确保：
 * 1. Docker 中的 Neo4j 容器正在运行
 * 2. Neo4j 连接信息：bolt://localhost:7687, 用户名：neo4j, 密码：password
 *
 * 运行命令：pnpm test neo4j.test.ts
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Neo4jRepositoryFactory } from '../factory';
import { Driver } from 'neo4j-driver';

describe('Neo4j Repository Integration Tests', () => {
  let driver: Driver;
  let factory: Neo4jRepositoryFactory;

  beforeAll(async () => {
    // 创建驱动实例
    driver = Neo4jRepositoryFactory.createDriver(
      'bolt://localhost:7687',
      'neo4j',
      'password'
    );

    // 初始化数据库（创建索引和约束）
    await Neo4jRepositoryFactory.initializeDatabase(driver);

    // 创建工厂实例
    factory = new Neo4jRepositoryFactory(driver);
  }, 30000);

  afterAll(async () => {
    // 清理测试数据
    const session = driver.session();
    try {
      await session.run('MATCH (n) DETACH DELETE n');
      await session.close();
    } finally {
      await factory.close();
    }
  });

  describe('CharacterRepository', () => {
    it('should create and retrieve a character', async () => {
      const repo = factory.getCharacterRepository();

      const character = await repo.create({
        name: '测试角色',
        description: '这是一个测试角色',
        appearance: {
          age: 25,
          height: 175,
          build: 'slim',
          eyeColor: 'brown',
          hairColor: 'black',
        },
        personality: {
          traits: ['brave', 'smart'],
          mbti: 'INTJ',
        },
        abilities: [
          { name: '剑术', description: '高超的剑术技巧', level: 80, category: 'combat' },
        ],
        background: '来自北方的流浪剑士',
        tags: ['主角', '剑士'],
      });

      expect(character.id).toBeDefined();
      expect(character.name).toBe('测试角色');

      // 测试查找
      const found = await repo.findById(character.id);
      expect(found).toBeDefined();
      expect(found?.name).toBe(character.name);
    });

    it('should find all characters', async () => {
      const repo = factory.getCharacterRepository();
      const characters = await repo.findAll();
      expect(Array.isArray(characters)).toBe(true);
    });
  });

  describe('EventRepository', () => {
    it('should create and retrieve an event', async () => {
      const repo = factory.getEventRepository();

      const event = await repo.create({
        name: '测试事件',
        description: '这是一个测试事件',
        eventType: 'plot',
        importance: 'high',
        startTime: '2024-01-01T00:00:00Z',
        endTime: '2024-01-02T00:00:00Z',
        locationIds: [],
        characterIds: [],
        causeEventIds: [],
        effectEventIds: [],
        foreshadowingIds: [],
        tags: ['测试'],
      });

      expect(event.id).toBeDefined();
      expect(event.name).toBe('测试事件');

      // 测试查找
      const found = await repo.findById(event.id);
      expect(found).toBeDefined();
      expect(found?.name).toBe(event.name);
    });
  });

  describe('LocationRepository', () => {
    it('should create and retrieve a location', async () => {
      const repo = factory.getLocationRepository();

      const location = await repo.create({
        name: '测试地点',
        description: '这是一个测试地点',
        locationType: 'city',
        atmosphere: ['peaceful', 'mysterious'],
        childLocationIds: [],
        worldSettingIds: [],
        eventIds: [],
        characterIds: [],
        tags: ['测试'],
      });

      expect(location.id).toBeDefined();
      expect(location.name).toBe('测试地点');

      // 测试查找
      const found = await repo.findById(location.id);
      expect(found).toBeDefined();
      expect(found?.name).toBe(location.name);
    });
  });

  describe('WorldSettingRepository', () => {
    it('should create and retrieve a world setting', async () => {
      const repo = factory.getWorldSettingRepository();

      const worldSetting = await repo.create({
        name: '测试世界观',
        description: '这是一个测试世界观',
        overview: '一个充满魔法的世界',
        ruleSystems: [
          {
            name: '魔法体系',
            description: '元素魔法',
            type: 'magic',
            rules: ['火克风', '水克火'],
          },
        ],
        factions: [
          {
            name: '法师塔',
            description: '魔法师的组织',
            type: 'magic_organization',
            influenceLevel: 80,
          },
        ],
        timeline: [
          { era: '创世纪元', year: 0, description: '世界 creation' },
        ],
        locationIds: [],
        tags: ['测试', '魔法'],
      });

      expect(worldSetting.id).toBeDefined();
      expect(worldSetting.name).toBe('测试世界观');

      // 测试查找
      const found = await repo.findById(worldSetting.id);
      expect(found).toBeDefined();
      expect(found?.name).toBe(worldSetting.name);
    });
  });

  describe('TimelineRepository', () => {
    it('should create and retrieve a timeline', async () => {
      const repo = factory.getTimelineRepository();

      const timeline = await repo.create({
        name: '测试时间线',
        description: '这是一个测试时间线',
        items: [
          {
            id: 'item-1',
            type: 'event',
            title: '重要事件',
            description: '发生了重要事件',
            startTime: '2024-01-01T00:00:00Z',
            endTime: '2024-01-02T00:00:00Z',
            relatedEventIds: [],
            relatedCharacterIds: [],
            relatedLocationIds: [],
            isCanonical: true,
            tags: ['重要'],
          },
        ],
      });

      expect(timeline.id).toBeDefined();
      expect(timeline.name).toBe('测试时间线');

      // 测试查找
      const found = await repo.findById(timeline.id);
      expect(found).toBeDefined();
      expect(found?.name).toBe(timeline.name);
    });
  });

  describe('RelationshipRepository', () => {
    it('should create and retrieve a relationship', async () => {
      const repo = factory.getRelationshipRepository();

      const relationship = await repo.create({
        name: '友谊关系',
        description: '测试友谊关系',
        sourceType: 'character',
        sourceId: 'char-1',
        targetType: 'character',
        targetId: 'char-2',
        relationshipType: 'friend',
        direction: 'bidirectional',
        strength: 80,
        tags: ['友谊'],
      });

      expect(relationship.id).toBeDefined();
      expect(relationship.relationshipType).toBe('friend');

      // 测试查找
      const found = await repo.findById(relationship.id);
      expect(found).toBeDefined();
      expect(found?.relationshipType).toBe('friend');
    });
  });

  describe('Graph Queries', () => {
    it('should find relationships for an entity', async () => {
      const repo = factory.getRelationshipRepository();

      // 先创建一些测试数据
      await repo.create({
        name: '关系 1',
        sourceType: 'character',
        sourceId: 'test-char-1',
        targetType: 'character',
        targetId: 'test-char-2',
        relationshipType: 'friend',
        direction: 'bidirectional',
        strength: 75,
        tags: ['test'],
      });

      const relationships = await repo.findByEntity('character', 'test-char-1');
      expect(relationships.length).toBeGreaterThan(0);
    });
  });
});
