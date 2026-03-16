import { Location, LocationSchema } from '@shu-zhong-jie/entities';
import { BaseSQLiteRepository, FieldMapping } from './base-sqlite-repository';

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
 * SQLite 地点仓储
 */
export class SQLiteLocationRepository extends BaseSQLiteRepository<Location, Omit<Location, 'id' | 'createdAt' | 'updatedAt'>, LocationDbRow> {
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

  /**
   * 重写 findById，添加 type 字段的类型断言
   */
  async findById(id: string): Promise<Location | null> {
    const result = await this.db.select<LocationDbRow[]>(
      'SELECT * FROM locations WHERE id = ? LIMIT 1',
      [id]
    );

    if (!result || result.length === 0) return null;

    const entity = this.toEntity(result[0]);
    // 处理可选字段
    return {
      ...entity,
      type: 'location' as const,
      coordinates: entity.coordinates || undefined,
    };
  }

  /**
   * 重写 findAll，添加 type 字段的类型断言
   */
  async findAll(): Promise<Location[]> {
    const results = await this.db.select<LocationDbRow[]>('SELECT * FROM locations ORDER BY name');
    return results.map(row => ({
      ...this.toEntity(row),
      type: 'location' as const,
      coordinates: row.coordinates ? JSON.parse(row.coordinates) : undefined,
    }));
  }

  /**
   * 重写 create，确保 type 字段正确
   */
  async create(entity: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>): Promise<Location> {
    const location = await super.create(entity);
    return { ...location, type: 'location' as const };
  }
}
