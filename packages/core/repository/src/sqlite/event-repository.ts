import { generateId, Event, EventSchema } from '@shu-zhong-jie/entities';
import { BaseRepository } from '../base-repository';
import { Database } from 'tauri-plugin-sql-api';

export class SQLiteEventRepository extends BaseRepository<Event> {
  protected tableName = 'events';
  private db: Database;

  constructor(db: Database) {
    super();
    this.db = db;
  }

  async create(entity: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    const now = new Date().toISOString();
    const id = generateId();
    const event: Event = {
      ...entity,
      id,
      type: 'event',
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };

    await this.db.execute(`
      INSERT INTO events (
        id, name, description, type, event_type, importance,
        start_time, end_time, location_ids, character_ids,
        cause_event_ids, effect_event_ids, foreshadowing_ids,
        tags, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      event.id,
      event.name,
      event.description,
      event.type,
      event.eventType,
      event.importance,
      event.startTime,
      event.endTime,
      JSON.stringify(event.locationIds),
      JSON.stringify(event.characterIds),
      JSON.stringify(event.causeEventIds),
      JSON.stringify(event.effectEventIds),
      JSON.stringify(event.foreshadowingIds),
      JSON.stringify(event.tags),
      event.notes,
      event.createdAt.toISOString(),
      event.updatedAt.toISOString(),
    ]);

    return event;
  }

  async findById(id: string): Promise<Event | null> {
    const result = await this.db.select<{
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
    }>('SELECT * FROM events WHERE id = ? LIMIT 1', [id]);

    if (!result || result.length === 0) return null;

    const row = result[0];
    return {
      ...row,
      type: 'event' as const,
      eventType: row.event_type,
      importance: row.importance,
      locationIds: JSON.parse(row.location_ids),
      characterIds: JSON.parse(row.character_ids),
      causeEventIds: JSON.parse(row.cause_event_ids),
      effectEventIds: JSON.parse(row.effect_event_ids),
      foreshadowingIds: JSON.parse(row.foreshadowing_ids),
      tags: JSON.parse(row.tags),
      startTime: row.start_time,
      endTime: row.end_time,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async findAll(): Promise<Event[]> {
    const results = await this.db.select<Array<{
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
    }>>('SELECT * FROM events ORDER BY start_time');

    return results.map(row => ({
      ...row,
      type: 'event' as const,
      eventType: row.event_type,
      importance: row.importance,
      locationIds: JSON.parse(row.location_ids),
      characterIds: JSON.parse(row.character_ids),
      causeEventIds: JSON.parse(row.cause_event_ids),
      effectEventIds: JSON.parse(row.effect_event_ids),
      foreshadowingIds: JSON.parse(row.foreshadowing_ids),
      tags: JSON.parse(row.tags),
      startTime: row.start_time,
      endTime: row.end_time,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async update(id: string, entity: Partial<Event>): Promise<Event | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated: Event = {
      ...existing,
      ...entity,
      updatedAt: new Date(),
    };

    await this.db.execute(`
      UPDATE events SET
        name = ?, description = ?, event_type = ?, importance = ?,
        start_time = ?, end_time = ?, location_ids = ?, character_ids = ?,
        cause_event_ids = ?, effect_event_ids = ?, foreshadowing_ids = ?,
        tags = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `, [
      updated.name,
      updated.description,
      updated.eventType,
      updated.importance,
      updated.startTime,
      updated.endTime,
      JSON.stringify(updated.locationIds),
      JSON.stringify(updated.characterIds),
      JSON.stringify(updated.causeEventIds),
      JSON.stringify(updated.effectEventIds),
      JSON.stringify(updated.foreshadowingIds),
      JSON.stringify(updated.tags),
      updated.notes,
      updated.updatedAt.toISOString(),
      id,
    ]);

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    await this.db.execute('DELETE FROM events WHERE id = ?', [id]);
    return true;
  }

  async createMany(entities: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Event[]> {
    const results: Event[] = [];
    for (const entity of entities) {
      results.push(await this.create(entity));
    }
    return results;
  }
}
