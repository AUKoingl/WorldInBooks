import { generateId, WorldSetting, WorldSettingSchema } from '@shu-zhong-jie/entities';
import { BaseRepository } from '../base-repository';
import { Database } from 'tauri-plugin-sql-api';

export class SQLiteWorldSettingRepository extends BaseRepository<WorldSetting> {
  protected tableName = 'world_settings';
  private db: Database;

  constructor(db: Database) {
    super();
    this.db = db;
  }

  async create(entity: Omit<WorldSetting, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorldSetting> {
    const now = new Date().toISOString();
    const id = generateId();
    const worldSetting: WorldSetting = {
      ...entity,
      id,
      type: 'world-setting',
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };

    await this.db.execute(`
      INSERT INTO world_settings (
        id, name, description, type, overview, time_period,
        rule_systems, factions, timeline, location_ids,
        tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      worldSetting.id,
      worldSetting.name,
      worldSetting.description,
      worldSetting.type,
      worldSetting.overview,
      worldSetting.timePeriod,
      JSON.stringify(worldSetting.ruleSystems),
      JSON.stringify(worldSetting.factions),
      JSON.stringify(worldSetting.timeline),
      JSON.stringify(worldSetting.locationIds),
      JSON.stringify(worldSetting.tags),
      worldSetting.createdAt.toISOString(),
      worldSetting.updatedAt.toISOString(),
    ]);

    return worldSetting;
  }

  async findById(id: string): Promise<WorldSetting | null> {
    const result = await this.db.select<{
      id: string;
      name: string;
      description: string;
      type: string;
      overview: string;
      time_period: string;
      rule_systems: string;
      factions: string;
      timeline: string;
      location_ids: string;
      tags: string;
      created_at: string;
      updated_at: string;
    }>('SELECT * FROM world_settings WHERE id = ? LIMIT 1', [id]);

    if (!result || result.length === 0) return null;

    const row = result[0];
    return {
      ...row,
      type: 'world-setting' as const,
      overview: row.overview,
      timePeriod: row.time_period,
      ruleSystems: JSON.parse(row.rule_systems),
      factions: JSON.parse(row.factions),
      timeline: JSON.parse(row.timeline),
      locationIds: JSON.parse(row.location_ids),
      tags: JSON.parse(row.tags),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async findAll(): Promise<WorldSetting[]> {
    const results = await this.db.select<Array<{
      id: string;
      name: string;
      description: string;
      type: string;
      overview: string;
      time_period: string;
      rule_systems: string;
      factions: string;
      timeline: string;
      location_ids: string;
      tags: string;
      created_at: string;
      updated_at: string;
    }>>('SELECT * FROM world_settings ORDER BY name');

    return results.map(row => ({
      ...row,
      type: 'world-setting' as const,
      overview: row.overview,
      timePeriod: row.time_period,
      ruleSystems: JSON.parse(row.rule_systems),
      factions: JSON.parse(row.factions),
      timeline: JSON.parse(row.timeline),
      locationIds: JSON.parse(row.location_ids),
      tags: JSON.parse(row.tags),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async update(id: string, entity: Partial<WorldSetting>): Promise<WorldSetting | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated: WorldSetting = {
      ...existing,
      ...entity,
      updatedAt: new Date(),
    };

    await this.db.execute(`
      UPDATE world_settings SET
        name = ?, description = ?, overview = ?, time_period = ?,
        rule_systems = ?, factions = ?, timeline = ?,
        location_ids = ?, tags = ?, updated_at = ?
      WHERE id = ?
    `, [
      updated.name,
      updated.description,
      updated.overview,
      updated.timePeriod,
      JSON.stringify(updated.ruleSystems),
      JSON.stringify(updated.factions),
      JSON.stringify(updated.timeline),
      JSON.stringify(updated.locationIds),
      JSON.stringify(updated.tags),
      updated.updatedAt.toISOString(),
      id,
    ]);

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    await this.db.execute('DELETE FROM world_settings WHERE id = ?', [id]);
    return true;
  }

  async createMany(entities: Omit<WorldSetting, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<WorldSetting[]> {
    const results: WorldSetting[] = [];
    for (const entity of entities) {
      results.push(await this.create(entity));
    }
    return results;
  }
}
