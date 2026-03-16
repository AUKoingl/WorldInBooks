import { Event, EventSchema } from '@shu-zhong-jie/entities';
import { BaseSQLiteRepository, FieldMapping } from './base-sqlite-repository';

/**
 * 事件数据库行类型
 */
interface EventDbRow {
  id: string;
  name: string;
  description: string;
  type: string;
  event_type: string;
  importance: string;
  start_time: string;
  end_time: string;
  location_ids: string;
  character_ids: string;
  cause_event_ids: string;
  effect_event_ids: string;
  foreshadowing_ids: string;
  tags: string;
  notes: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

/**
 * SQLite 事件仓储
 */
export class SQLiteEventRepository extends BaseSQLiteRepository<Event, Omit<Event, 'id' | 'createdAt' | 'updatedAt'>, EventDbRow> {
  protected readonly tableName = 'events';
  protected readonly fieldMapping: FieldMapping = {
    camelToSnake: {
      id: 'id',
      name: 'name',
      description: 'description',
      type: 'type',
      eventType: 'event_type',
      importance: 'importance',
      startTime: 'start_time',
      endTime: 'end_time',
      locationIds: 'location_ids',
      characterIds: 'character_ids',
      causeEventIds: 'cause_event_ids',
      effectEventIds: 'effect_event_ids',
      foreshadowingIds: 'foreshadowing_ids',
      tags: 'tags',
      notes: 'notes',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    jsonFields: [
      'locationIds',
      'characterIds',
      'causeEventIds',
      'effectEventIds',
      'foreshadowingIds',
      'tags',
    ],
  };

  /**
   * 重写 findById，添加 type 字段的类型断言
   */
  async findById(id: string): Promise<Event | null> {
    const result = await this.db.select<EventDbRow[]>(
      'SELECT * FROM events WHERE id = ? LIMIT 1',
      [id]
    );

    if (!result || result.length === 0) return null;

    const entity = this.toEntity(result[0]);
    return { ...entity, type: 'event' as const };
  }

  /**
   * 重写 findAll，添加 type 字段的类型断言
   */
  async findAll(): Promise<Event[]> {
    const results = await this.db.select<EventDbRow[]>('SELECT * FROM events ORDER BY start_time');
    return results.map(row => ({ ...this.toEntity(row), type: 'event' as const }));
  }

  /**
   * 重写 create，确保 type 字段正确
   */
  async create(entity: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    const event = await super.create(entity);
    return { ...event, type: 'event' as const };
  }
}
