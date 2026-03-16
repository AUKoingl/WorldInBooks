import { Relationship, RelationshipSchema } from '@shu-zhong-jie/entities';
import { BaseSQLiteRepository, FieldMapping } from './base-sqlite-repository';

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
 * SQLite 关系仓储
 */
export class SQLiteRelationshipRepository extends BaseSQLiteRepository<Relationship, Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'>, RelationshipDbRow> {
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
    jsonFields: ['tags'],
  };

  /**
   * 重写 findById，添加 type 字段的类型断言
   */
  async findById(id: string): Promise<Relationship | null> {
    const result = await this.db.select<RelationshipDbRow[]>(
      'SELECT * FROM relationships WHERE id = ? LIMIT 1',
      [id]
    );

    if (!result || result.length === 0) return null;

    const entity = this.toEntity(result[0]);
    return { ...entity, type: 'relationship' as const };
  }

  /**
   * 重写 findAll，添加 type 字段的类型断言
   */
  async findAll(): Promise<Relationship[]> {
    const results = await this.db.select<RelationshipDbRow[]>('SELECT * FROM relationships ORDER BY created_at DESC');
    return results.map(row => ({ ...this.toEntity(row), type: 'relationship' as const }));
  }

  /**
   * 重写 create，确保 type 字段正确
   */
  async create(entity: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'>): Promise<Relationship> {
    const relationship = await super.create(entity);
    return { ...relationship, type: 'relationship' as const };
  }
}
