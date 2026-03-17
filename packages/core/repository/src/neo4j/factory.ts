import neo4j, { Driver } from 'neo4j-driver';
import type { IRepositoryFactory, CharacterRepository, EventRepository, LocationRepository, WorldSettingRepository, TimelineRepository, RelationshipRepository } from '../types';
import {
  Neo4jCharacterRepository,
  Neo4jEventRepository,
  Neo4jLocationRepository,
  Neo4jWorldSettingRepository,
  Neo4jTimelineRepository,
  Neo4jRelationshipRepository,
} from './index';

/**
 * Neo4j 仓储工厂 - 用于创建和管理所有 Neo4j 仓储实例
 */
export class Neo4jRepositoryFactory implements IRepositoryFactory {
  private driver: Driver;
  private characterRepo?: Neo4jCharacterRepository;
  private eventRepo?: Neo4jEventRepository;
  private locationRepo?: Neo4jLocationRepository;
  private worldSettingRepo?: Neo4jWorldSettingRepository;
  private timelineRepo?: Neo4jTimelineRepository;
  private relationshipRepo?: Neo4jRelationshipRepository;

  constructor(driver: Driver) {
    this.driver = driver;
  }

  /**
   * 创建 Neo4j 驱动实例
   */
  static createDriver(uri: string, username: string, password: string): Driver {
    return neo4j.driver(uri, neo4j.auth.basic(username, password), {
      maxConnectionPoolSize: 50,
      connectionTimeout: 30000,
    });
  }

  /**
   * 初始化 Neo4j 数据库
   * 创建索引和约束
   */
  static async initializeDatabase(driver: Driver): Promise<void> {
    const session = driver.session();

    try {
      // 创建唯一性约束
      await session.run(`
        CREATE CONSTRAINT character_id_unique IF NOT EXISTS
        FOR (c:Character) REQUIRE c.id IS UNIQUE
      `);

      await session.run(`
        CREATE CONSTRAINT event_id_unique IF NOT EXISTS
        FOR (e:Event) REQUIRE e.id IS UNIQUE
      `);

      await session.run(`
        CREATE CONSTRAINT location_id_unique IF NOT EXISTS
        FOR (l:Location) REQUIRE l.id IS UNIQUE
      `);

      await session.run(`
        CREATE CONSTRAINT worldsetting_id_unique IF NOT EXISTS
        FOR (w:WorldSetting) REQUIRE w.id IS UNIQUE
      `);

      await session.run(`
        CREATE CONSTRAINT timeline_id_unique IF NOT EXISTS
        FOR (t:Timeline) REQUIRE t.id IS UNIQUE
      `);

      await session.run(`
        CREATE CONSTRAINT relationship_id_unique IF NOT EXISTS
        FOR (r:Relationship) REQUIRE r.id IS UNIQUE
      `);

      // 创建索引
      await session.run(`
        CREATE INDEX character_name_index IF NOT EXISTS
        FOR (c:Character) ON (c.name)
      `);

      await session.run(`
        CREATE INDEX event_startTime_index IF NOT EXISTS
        FOR (e:Event) ON (e.startTime)
      `);

      await session.run(`
        CREATE INDEX location_name_index IF NOT EXISTS
        FOR (l:Location) ON (l.name)
      `);

      await session.run(`
        CREATE INDEX worldsetting_name_index IF NOT EXISTS
        FOR (w:WorldSetting) ON (w.name)
      `);

      await session.run(`
        CREATE INDEX relationship_type_index IF NOT EXISTS
        FOR (r:Relationship) ON (r.relationshipType)
      `);

      await session.run(`
        CREATE INDEX relationship_source_index IF NOT EXISTS
        FOR (r:Relationship) ON (r.sourceType, r.sourceId)
      `);

      await session.run(`
        CREATE INDEX relationship_target_index IF NOT EXISTS
        FOR (r:Relationship) ON (r.targetType, r.targetId)
      `);

      // 创建关系类型的索引
      await session.run(`
        CREATE INDEX event_eventType_index IF NOT EXISTS
        FOR (e:Event) ON (e.eventType)
      `);

      await session.run(`
        CREATE INDEX location_type_index IF NOT EXISTS
        FOR (l:Location) ON (l.locationType)
      `);
    } finally {
      await session.close();
    }
  }

  getCharacterRepository(): CharacterRepository {
    if (!this.characterRepo) {
      this.characterRepo = new Neo4jCharacterRepository(this.driver);
    }
    return this.characterRepo;
  }

  getEventRepository(): EventRepository {
    if (!this.eventRepo) {
      this.eventRepo = new Neo4jEventRepository(this.driver);
    }
    return this.eventRepo;
  }

  getLocationRepository(): LocationRepository {
    if (!this.locationRepo) {
      this.locationRepo = new Neo4jLocationRepository(this.driver);
    }
    return this.locationRepo;
  }

  getWorldSettingRepository(): WorldSettingRepository {
    if (!this.worldSettingRepo) {
      this.worldSettingRepo = new Neo4jWorldSettingRepository(this.driver);
    }
    return this.worldSettingRepo;
  }

  getTimelineRepository(): TimelineRepository {
    if (!this.timelineRepo) {
      this.timelineRepo = new Neo4jTimelineRepository(this.driver);
    }
    return this.timelineRepo;
  }

  getRelationshipRepository(): RelationshipRepository {
    if (!this.relationshipRepo) {
      this.relationshipRepo = new Neo4jRelationshipRepository(this.driver);
    }
    return this.relationshipRepo;
  }

  /**
   * 关闭数据库连接
   */
  async close(): Promise<void> {
    if (this.driver) {
      await this.driver.close();
    }
  }
}
