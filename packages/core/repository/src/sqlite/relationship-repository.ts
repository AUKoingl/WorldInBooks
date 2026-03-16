import { generateId, Relationship, RelationshipSchema } from '@shu-zhong-jie/entities';
import { BaseRepository } from '../base-repository';
import { Database } from 'tauri-plugin-sql-api';

export class SQLiteRelationshipRepository extends BaseRepository<Relationship> {
  protected tableName = 'relationships';
  private db: Database;

  constructor(db: Database) {
    super();
    this.db = db;
  }

  async create(entity: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'>): Promise<Relationship> {
    const now = new Date().toISOString();
    const id = generateId();
    const relationship: Relationship = {
      ...entity,
      id,
      type: 'relationship',
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };

    await this.db.execute(`
      INSERT INTO relationships (
        id, name, description, type, source_type, source_id,
        target_type, target_id, relationship_type, direction,
        strength, established_at, tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      relationship.id,
      relationship.name,
      relationship.description,
      relationship.type,
      relationship.sourceType,
      relationship.sourceId,
      relationship.targetType,
      relationship.targetId,
      relationship.relationshipType,
      relationship.direction,
      relationship.strength,
      relationship.establishedAt,
      JSON.stringify(relationship.tags),
      relationship.createdAt.toISOString(),
      relationship.updatedAt.toISOString(),
    ]);

    return relationship;
  }

  async findById(id: string): Promise<Relationship | null> {
    const result = await this.db.select<{
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
    }>('SELECT * FROM relationships WHERE id = ? LIMIT 1', [id]);

    if (!result || result.length === 0) return null;

    const row = result[0];
    return {
      ...row,
      type: 'relationship' as const,
      sourceType: row.source_type,
      sourceId: row.source_id,
      targetType: row.target_type,
      targetId: row.target_id,
      relationshipType: row.relationship_type,
      direction: row.direction,
      strength: row.strength,
      establishedAt: row.established_at,
      tags: JSON.parse(row.tags),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async findAll(): Promise<Relationship[]> {
    const results = await this.db.select<Array<{
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
    }>>('SELECT * FROM relationships ORDER BY created_at DESC');

    return results.map(row => ({
      ...row,
      type: 'relationship' as const,
      sourceType: row.source_type,
      sourceId: row.source_id,
      targetType: row.target_type,
      targetId: row.target_id,
      relationshipType: row.relationship_type,
      direction: row.direction,
      strength: row.strength,
      establishedAt: row.established_at,
      tags: JSON.parse(row.tags),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async update(id: string, entity: Partial<Relationship>): Promise<Relationship | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated: Relationship = {
      ...existing,
      ...entity,
      updatedAt: new Date(),
    };

    await this.db.execute(`
      UPDATE relationships SET
        name = ?, description = ?, source_type = ?, source_id = ?,
        target_type = ?, target_id = ?, relationship_type = ?,
        direction = ?, strength = ?, established_at = ?,
        tags = ?, updated_at = ?
      WHERE id = ?
    `, [
      updated.name,
      updated.description,
      updated.sourceType,
      updated.sourceId,
      updated.targetType,
      updated.targetId,
      updated.relationshipType,
      updated.direction,
      updated.strength,
      updated.establishedAt,
      JSON.stringify(updated.tags),
      updated.updatedAt.toISOString(),
      id,
    ]);

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    await this.db.execute('DELETE FROM relationships WHERE id = ?', [id]);
    return true;
  }

  async createMany(entities: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Relationship[]> {
    const results: Relationship[] = [];
    for (const entity of entities) {
      results.push(await this.create(entity));
    }
    return results;
  }
}
