import { generateId, Timeline, TimelineSchema } from '@shu-zhong-jie/entities';
import { BaseRepository } from '../base-repository';
import { Database } from 'tauri-plugin-sql-api';

export class SQLiteTimelineRepository extends BaseRepository<Timeline> {
  protected tableName = 'timelines';
  private db: Database;

  constructor(db: Database) {
    super();
    this.db = db;
  }

  async create(entity: Omit<Timeline, 'id' | 'createdAt' | 'updatedAt'>): Promise<Timeline> {
    const now = new Date().toISOString();
    const id = generateId();
    const timeline: Timeline = {
      ...entity,
      id,
      type: 'timeline',
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };

    await this.db.execute(`
      INSERT INTO timelines (
        id, name, description, type, items, world_setting_id,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      timeline.id,
      timeline.name,
      timeline.description,
      timeline.type,
      JSON.stringify(timeline.items),
      timeline.worldSettingId,
      timeline.createdAt.toISOString(),
      timeline.updatedAt.toISOString(),
    ]);

    return timeline;
  }

  async findById(id: string): Promise<Timeline | null> {
    const result = await this.db.select<{
      id: string;
      name: string;
      description: string;
      type: string;
      items: string;
      world_setting_id: string;
      created_at: string;
      updated_at: string;
    }>('SELECT * FROM timelines WHERE id = ? LIMIT 1', [id]);

    if (!result || result.length === 0) return null;

    const row = result[0];
    return {
      ...row,
      type: 'timeline' as const,
      items: JSON.parse(row.items),
      worldSettingId: row.world_setting_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async findAll(): Promise<Timeline[]> {
    const results = await this.db.select<Array<{
      id: string;
      name: string;
      description: string;
      type: string;
      items: string;
      world_setting_id: string;
      created_at: string;
      updated_at: string;
    }>>('SELECT * FROM timelines ORDER BY name');

    return results.map(row => ({
      ...row,
      type: 'timeline' as const,
      items: JSON.parse(row.items),
      worldSettingId: row.world_setting_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async update(id: string, entity: Partial<Timeline>): Promise<Timeline | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated: Timeline = {
      ...existing,
      ...entity,
      updatedAt: new Date(),
    };

    await this.db.execute(`
      UPDATE timelines SET
        name = ?, description = ?, items = ?, world_setting_id = ?,
        updated_at = ?
      WHERE id = ?
    `, [
      updated.name,
      updated.description,
      JSON.stringify(updated.items),
      updated.worldSettingId,
      updated.updatedAt.toISOString(),
      id,
    ]);

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    await this.db.execute('DELETE FROM timelines WHERE id = ?', [id]);
    return true;
  }

  async createMany(entities: Omit<Timeline, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Timeline[]> {
    const results: Timeline[] = [];
    for (const entity of entities) {
      results.push(await this.create(entity));
    }
    return results;
  }
}
