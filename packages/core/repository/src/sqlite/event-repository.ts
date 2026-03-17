import { Event, EventSchema } from '@shu-zhong-jie/entities';
import { BaseSQLiteRepository, FieldMapping, BaseRepositoryConfig } from './base-sqlite-repository';

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
 * SQLite 事件仓储配置
 */
const config: BaseRepositoryConfig<'event'> = {
  typeLiteral: 'event',
  orderBy: 'start_time',
};

/**
 * SQLite 事件仓储
 */
export class SQLiteEventRepository extends BaseSQLiteRepository<Event, Omit<Event, 'id' | 'createdAt' | 'updatedAt'>, EventDbRow, 'event'> {
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
  protected readonly config = config;
}
