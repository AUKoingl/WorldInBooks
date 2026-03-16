import { generateId, Location, LocationSchema } from '@shu-zhong-jie/entities';
import { BaseRepository } from '../base-repository';
import { Database } from 'tauri-plugin-sql-api';

export class SQLiteLocationRepository extends BaseRepository<Location> {
  protected tableName = 'locations';
  private db: Database;

  constructor(db: Database) {
    super();
    this.db = db;
  }

  async create(entity: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>): Promise<Location> {
    const now = new Date().toISOString();
    const id = generateId();
    const location: Location = {
      ...entity,
      id,
      type: 'location',
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };

    await this.db.execute(`
      INSERT INTO locations (
        id, name, description, type, location_type, atmosphere,
        parent_location_id, child_location_ids, world_setting_ids,
        event_ids, character_ids, coordinates, physical_description,
        history, tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      location.id,
      location.name,
      location.description,
      location.type,
      location.locationType,
      JSON.stringify(location.atmosphere),
      location.parentLocationId,
      JSON.stringify(location.childLocationIds),
      JSON.stringify(location.worldSettingIds),
      JSON.stringify(location.eventIds),
      JSON.stringify(location.characterIds),
      location.coordinates ? JSON.stringify(location.coordinates) : null,
      location.physicalDescription,
      location.history,
      JSON.stringify(location.tags),
      location.createdAt.toISOString(),
      location.updatedAt.toISOString(),
    ]);

    return location;
  }

  async findById(id: string): Promise<Location | null> {
    const result = await this.db.select<{
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
    }>('SELECT * FROM locations WHERE id = ? LIMIT 1', [id]);

    if (!result || result.length === 0) return null;

    const row = result[0];
    return {
      ...row,
      type: 'location' as const,
      locationType: row.location_type,
      atmosphere: JSON.parse(row.atmosphere),
      parentLocationId: row.parent_location_id,
      childLocationIds: JSON.parse(row.child_location_ids),
      worldSettingIds: JSON.parse(row.world_setting_ids),
      eventIds: JSON.parse(row.event_ids),
      characterIds: JSON.parse(row.character_ids),
      coordinates: row.coordinates ? JSON.parse(row.coordinates) : undefined,
      physicalDescription: row.physical_description,
      history: row.history,
      tags: JSON.parse(row.tags),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async findAll(): Promise<Location[]> {
    const results = await this.db.select<Array<{
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
    }>>('SELECT * FROM locations ORDER BY name');

    return results.map(row => ({
      ...row,
      type: 'location' as const,
      locationType: row.location_type,
      atmosphere: JSON.parse(row.atmosphere),
      parentLocationId: row.parent_location_id,
      childLocationIds: JSON.parse(row.child_location_ids),
      worldSettingIds: JSON.parse(row.world_setting_ids),
      eventIds: JSON.parse(row.event_ids),
      characterIds: JSON.parse(row.character_ids),
      coordinates: row.coordinates ? JSON.parse(row.coordinates) : undefined,
      physicalDescription: row.physical_description,
      history: row.history,
      tags: JSON.parse(row.tags),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async update(id: string, entity: Partial<Location>): Promise<Location | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated: Location = {
      ...existing,
      ...entity,
      updatedAt: new Date(),
    };

    await this.db.execute(`
      UPDATE locations SET
        name = ?, description = ?, location_type = ?, atmosphere = ?,
        parent_location_id = ?, child_location_ids = ?, world_setting_ids = ?,
        event_ids = ?, character_ids = ?, coordinates = ?,
        physical_description = ?, history = ?, tags = ?, updated_at = ?
      WHERE id = ?
    `, [
      updated.name,
      updated.description,
      updated.locationType,
      JSON.stringify(updated.atmosphere),
      updated.parentLocationId,
      JSON.stringify(updated.childLocationIds),
      JSON.stringify(updated.worldSettingIds),
      JSON.stringify(updated.eventIds),
      JSON.stringify(updated.characterIds),
      updated.coordinates ? JSON.stringify(updated.coordinates) : null,
      updated.physicalDescription,
      updated.history,
      JSON.stringify(updated.tags),
      updated.updatedAt.toISOString(),
      id,
    ]);

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    await this.db.execute('DELETE FROM locations WHERE id = ?', [id]);
    return true;
  }

  async createMany(entities: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Location[]> {
    const results: Location[] = [];
    for (const entity of entities) {
      results.push(await this.create(entity));
    }
    return results;
  }
}
