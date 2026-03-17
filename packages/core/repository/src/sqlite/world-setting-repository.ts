import { WorldSetting, WorldSettingSchema } from '@shu-zhong-jie/entities';
import { BaseSQLiteRepository, FieldMapping, BaseRepositoryConfig } from './base-sqlite-repository';

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
 * SQLite 世界观仓储配置
 */
const config: BaseRepositoryConfig<'world-setting'> = {
  typeLiteral: 'world-setting',
  orderBy: 'name',
};

/**
 * SQLite 世界观仓储
 */
export class SQLiteWorldSettingRepository extends BaseSQLiteRepository<WorldSetting, Omit<WorldSetting, 'id' | 'createdAt' | 'updatedAt'>, WorldSettingDbRow, 'world-setting'> {
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
  protected readonly config = config;
}
