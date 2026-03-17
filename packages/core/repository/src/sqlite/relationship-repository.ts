import { Relationship } from '@shu-zhong-jie/entities';
import { BaseSQLiteRepository, FieldMapping, BaseRepositoryConfig } from './base-sqlite-repository';

/**
 * 关系数据库行类型
 */
interface RelationshipDbRow {
  id: string;
  name: string;
  description: string;
  type: string;
  source_type: string;
  source_id: string;
  target_type: string;
  target_id: string;
  relationship_type: string;
  direction: string;
  strength: number;
  established_at: string;
  tags: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

/**
 * SQLite 关系仓储配置
 */
const config: BaseRepositoryConfig<'relationship'> = {
  typeLiteral: 'relationship',
  orderBy: 'created_at DESC',
};

/**
 * SQLite 关系仓储
 */
export class SQLiteRelationshipRepository extends BaseSQLiteRepository<Relationship, Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'>, RelationshipDbRow, 'relationship'> {
  protected readonly tableName = 'relationships';
  protected readonly fieldMapping: FieldMapping = {
    camelToSnake: {
      id: 'id',
      name: 'name',
      description: 'description',
      type: 'type',
      sourceType: 'source_type',
      sourceId: 'source_id',
      targetType: 'target_type',
      targetId: 'target_id',
      relationshipType: 'relationship_type',
      direction: 'direction',
      strength: 'strength',
      establishedAt: 'established_at',
      tags: 'tags',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    jsonFieldsSet: new Set(['tags']),
  };
  protected readonly config = config;
}
