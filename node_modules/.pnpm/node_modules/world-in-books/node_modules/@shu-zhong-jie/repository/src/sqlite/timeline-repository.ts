import { Timeline } from '@shu-zhong-jie/entities';
import { BaseSQLiteRepository, FieldMapping, BaseRepositoryConfig } from './base-sqlite-repository';

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
 * SQLite 时间线仓储配置
 */
const config: BaseRepositoryConfig<'timeline'> = {
  typeLiteral: 'timeline',
  orderBy: 'name',
};

/**
 * SQLite 时间线仓储
 */
export class SQLiteTimelineRepository extends BaseSQLiteRepository<Timeline, Omit<Timeline, 'id' | 'createdAt' | 'updatedAt'>, TimelineDbRow, 'timeline'> {
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
    jsonFieldsSet: new Set(['items']),
  };
  protected readonly config = config;
}
