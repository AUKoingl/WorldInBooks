import { WorldSetting, WorldSettingSchema } from '@shu-zhong-jie/entities';
import { BaseSQLiteRepository, FieldMapping } from './base-sqlite-repository';

/**
 * 世界观数据库行类型
 */
interface WorldSettingDbRow {
  id: string;
  name: string;
  description: string;
  type: string;
  overview: string;
  time_period: string;
  rule_systems: string;
  factions: string;
  timeline: string;
  location_ids: string;
  tags: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

/**
 * SQLite 世界观仓储
 */
export class SQLiteWorldSettingRepository extends BaseSQLiteRepository<WorldSetting, Omit<WorldSetting, 'id' | 'createdAt' | 'updatedAt'>, WorldSettingDbRow> {
  protected readonly tableName = 'world_settings';
  protected readonly fieldMapping: FieldMapping = {
    camelToSnake: {
      id: 'id',
      name: 'name',
      description: 'description',
      type: 'type',
      overview: 'overview',
      timePeriod: 'time_period',
      ruleSystems: 'rule_systems',
      factions: 'factions',
      timeline: 'timeline',
      locationIds: 'location_ids',
      tags: 'tags',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    jsonFields: ['ruleSystems', 'factions', 'timeline', 'locationIds', 'tags'],
  };

  /**
   * 重写 findById，添加 type 字段的类型断言
   */
  async findById(id: string): Promise<WorldSetting | null> {
    const result = await this.db.select<WorldSettingDbRow[]>(
      'SELECT * FROM world_settings WHERE id = ? LIMIT 1',
      [id]
    );

    if (!result || result.length === 0) return null;

    const entity = this.toEntity(result[0]);
    return { ...entity, type: 'world-setting' as const };
  }

  /**
   * 重写 findAll，添加 type 字段的类型断言
   */
  async findAll(): Promise<WorldSetting[]> {
    const results = await this.db.select<WorldSettingDbRow[]>('SELECT * FROM world_settings ORDER BY name');
    return results.map(row => ({ ...this.toEntity(row), type: 'world-setting' as const }));
  }

  /**
   * 重写 create，确保 type 字段正确
   */
  async create(entity: Omit<WorldSetting, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorldSetting> {
    const worldSetting = await super.create(entity);
    return { ...worldSetting, type: 'world-setting' as const };
  }
}
