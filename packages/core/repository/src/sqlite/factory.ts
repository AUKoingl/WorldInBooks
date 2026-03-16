import Database from '@tauri-apps/plugin-sql';
import {
  SQLiteCharacterRepository,
  SQLiteEventRepository,
  SQLiteLocationRepository,
  SQLiteWorldSettingRepository,
  SQLiteTimelineRepository,
  SQLiteRelationshipRepository,
} from './';
import type { IRepositoryFactory } from '../types';

/**
 * SQLite 仓储工厂 - 用于创建和管理所有 SQLite 仓储实例
 */
export class SQLiteRepositoryFactory implements IRepositoryFactory {
  private db: Database;
  private characterRepo?: SQLiteCharacterRepository;
  private eventRepo?: SQLiteEventRepository;
  private locationRepo?: SQLiteLocationRepository;
  private worldSettingRepo?: SQLiteWorldSettingRepository;
  private timelineRepo?: SQLiteTimelineRepository;
  private relationshipRepo?: SQLiteRelationshipRepository;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * 初始化数据库表
   */
  static async initializeDatabase(db: Database): Promise<void> {
    // 创建人物表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS characters (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        appearance TEXT NOT NULL,
        personality TEXT NOT NULL,
        abilities TEXT NOT NULL,
        background TEXT,
        tags TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // 创建事件表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        event_type TEXT NOT NULL,
        importance TEXT NOT NULL,
        start_time TEXT,
        end_time TEXT,
        location_ids TEXT NOT NULL,
        character_ids TEXT NOT NULL,
        cause_event_ids TEXT NOT NULL,
        effect_event_ids TEXT NOT NULL,
        foreshadowing_ids TEXT NOT NULL,
        tags TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // 创建地点表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        location_type TEXT NOT NULL,
        atmosphere TEXT NOT NULL,
        parent_location_id TEXT,
        child_location_ids TEXT NOT NULL,
        world_setting_ids TEXT NOT NULL,
        event_ids TEXT NOT NULL,
        character_ids TEXT NOT NULL,
        coordinates TEXT,
        physical_description TEXT,
        history TEXT,
        tags TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // 创建世界观表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS world_settings (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        overview TEXT NOT NULL,
        time_period TEXT,
        rule_systems TEXT NOT NULL,
        factions TEXT NOT NULL,
        timeline TEXT NOT NULL,
        location_ids TEXT NOT NULL,
        tags TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // 创建时间线表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS timelines (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        items TEXT NOT NULL,
        world_setting_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // 创建关系表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS relationships (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        source_type TEXT NOT NULL,
        source_id TEXT NOT NULL,
        target_type TEXT NOT NULL,
        target_id TEXT NOT NULL,
        relationship_type TEXT NOT NULL,
        direction TEXT NOT NULL,
        strength INTEGER NOT NULL,
        established_at TEXT,
        tags TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // 创建索引
    await db.execute('CREATE INDEX IF NOT EXISTS idx_characters_name ON characters(name)');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time)');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_locations_parent ON locations(parent_location_id)');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_relationships_source ON relationships(source_id)');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_relationships_target ON relationships(target_id)');
  }

  getCharacterRepository(): SQLiteCharacterRepository {
    if (!this.characterRepo) {
      this.characterRepo = new SQLiteCharacterRepository(this.db);
    }
    return this.characterRepo;
  }

  getEventRepository(): SQLiteEventRepository {
    if (!this.eventRepo) {
      this.eventRepo = new SQLiteEventRepository(this.db);
    }
    return this.eventRepo;
  }

  getLocationRepository(): SQLiteLocationRepository {
    if (!this.locationRepo) {
      this.locationRepo = new SQLiteLocationRepository(this.db);
    }
    return this.locationRepo;
  }

  getWorldSettingRepository(): SQLiteWorldSettingRepository {
    if (!this.worldSettingRepo) {
      this.worldSettingRepo = new SQLiteWorldSettingRepository(this.db);
    }
    return this.worldSettingRepo;
  }

  getTimelineRepository(): SQLiteTimelineRepository {
    if (!this.timelineRepo) {
      this.timelineRepo = new SQLiteTimelineRepository(this.db);
    }
    return this.timelineRepo;
  }

  getRelationshipRepository(): SQLiteRelationshipRepository {
    if (!this.relationshipRepo) {
      this.relationshipRepo = new SQLiteRelationshipRepository(this.db);
    }
    return this.relationshipRepo;
  }
}
