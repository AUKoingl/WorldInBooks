import { Timeline, TimelineSchema } from '@shu-zhong-jie/entities';
import { BaseSQLiteRepository, FieldMapping } from './base-sqlite-repository';

/**
 * 时间线数据库行类型
 */
interface TimelineDbRow {
  id: string;
  name: string;
  description: string;
  type: string;
  items: string;
  world_setting_id: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

/**
 * SQLite 时间线仓储
 */
export class SQLiteTimelineRepository extends BaseSQLiteRepository<Timeline, Omit<Timeline, 'id' | 'createdAt' | 'updatedAt'>, TimelineDbRow> {
  protected readonly tableName = 'timelines';
  protected readonly fieldMapping: FieldMapping = {
    camelToSnake: {
      id: 'id',
      name: 'name',
      description: 'description',
      type: 'type',
      items: 'items',
      worldSettingId: 'world_setting_id',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    jsonFields: ['items'],
  };

  /**
   * 重写 findById，添加 type 字段的类型断言
   */
  async findById(id: string): Promise<Timeline | null> {
    const result = await this.db.select<TimelineDbRow[]>(
      'SELECT * FROM timelines WHERE id = ? LIMIT 1',
      [id]
    );

    if (!result || result.length === 0) return null;

    const entity = this.toEntity(result[0]);
    return { ...entity, type: 'timeline' as const };
  }

  /**
   * 重写 findAll，添加 type 字段的类型断言
   */
  async findAll(): Promise<Timeline[]> {
    const results = await this.db.select<TimelineDbRow[]>('SELECT * FROM timelines ORDER BY name');
    return results.map(row => ({ ...this.toEntity(row), type: 'timeline' as const }));
  }

  /**
   * 重写 create，确保 type 字段正确
   */
  async create(entity: Omit<Timeline, 'id' | 'createdAt' | 'updatedAt'>): Promise<Timeline> {
    const timeline = await super.create(entity);
    return { ...timeline, type: 'timeline' as const };
  }
}
