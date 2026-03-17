import { Location, LocationSchema } from '@shu-zhong-jie/entities';
import { BaseSQLiteRepository, FieldMapping, BaseRepositoryConfig } from './base-sqlite-repository';

/**
 * 地点数据库行类型
 */
interface LocationDbRow {
  id: string;
  name: string;
  description: string;
  type: string;
  location_type: string;
  atmosphere: string;
  parent_location_id: string;
  child_location_ids: string;
  world_setting_ids: string;
  event_ids: string;
  character_ids: string;
  coordinates: string;
  physical_description: string;
  history: string;
  tags: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

/**
 * SQLite 地点仓储配置
 */
const config: BaseRepositoryConfig<'location'> = {
  typeLiteral: 'location',
  orderBy: 'name',
};

/**
 * SQLite 地点仓储
 */
export class SQLiteLocationRepository extends BaseSQLiteRepository<Location, Omit<Location, 'id' | 'createdAt' | 'updatedAt'>, LocationDbRow, 'location'> {
  protected readonly tableName = 'locations';
  protected readonly fieldMapping: FieldMapping = {
    camelToSnake: {
      id: 'id',
      name: 'name',
      description: 'description',
      type: 'type',
      locationType: 'location_type',
      atmosphere: 'atmosphere',
      parentLocationId: 'parent_location_id',
      childLocationIds: 'child_location_ids',
      worldSettingIds: 'world_setting_ids',
      eventIds: 'event_ids',
      characterIds: 'character_ids',
      coordinates: 'coordinates',
      physicalDescription: 'physical_description',
      history: 'history',
      tags: 'tags',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    jsonFields: [
      'atmosphere',
      'childLocationIds',
      'worldSettingIds',
      'eventIds',
      'characterIds',
      'coordinates',
      'tags',
    ],
  };
  protected readonly config = config;
}
