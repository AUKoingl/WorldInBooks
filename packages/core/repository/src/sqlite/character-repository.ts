import { generateId, Character, CharacterSchema } from '@shu-zhong-jie/entities';
import { BaseRepository } from '../base-repository';
import { Database } from 'tauri-plugin-sql-api';

export class SQLiteCharacterRepository extends BaseRepository<Character> {
  protected tableName = 'characters';
  private db: Database;

  constructor(db: Database) {
    super();
    this.db = db;
  }

  async create(entity: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>): Promise<Character> {
    const now = new Date().toISOString();
    const id = generateId();
    const character: Character = {
      ...entity,
      id,
      type: 'character',
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };

    await this.db.execute(`
      INSERT INTO characters (
        id, name, description, type, appearance, personality, abilities,
        background, tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      character.id,
      character.name,
      character.description,
      character.type,
      JSON.stringify(character.appearance),
      JSON.stringify(character.personality),
      JSON.stringify(character.abilities),
      character.background,
      JSON.stringify(character.tags),
      character.createdAt.toISOString(),
      character.updatedAt.toISOString(),
    ]);

    return character;
  }

  async findById(id: string): Promise<Character | null> {
    const result = await this.db.select<{
      id: string;
      name: string;
      description: string;
      type: string;
      appearance: string;
      personality: string;
      abilities: string;
      background: string;
      tags: string;
      created_at: string;
      updated_at: string;
    }>('SELECT * FROM characters WHERE id = ? LIMIT 1', [id]);

    if (!result || result.length === 0) return null;

    const row = result[0];
    return {
      ...row,
      type: 'character' as const,
      appearance: JSON.parse(row.appearance),
      personality: JSON.parse(row.personality),
      abilities: JSON.parse(row.abilities),
      tags: JSON.parse(row.tags),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async findAll(): Promise<Character[]> {
    const results = await this.db.select<Array<{
      id: string;
      name: string;
      description: string;
      type: string;
      appearance: string;
      personality: string;
      abilities: string;
      background: string;
      tags: string;
      created_at: string;
      updated_at: string;
    }>>('SELECT * FROM characters ORDER BY name');

    return results.map(row => ({
      ...row,
      type: 'character' as const,
      appearance: JSON.parse(row.appearance),
      personality: JSON.parse(row.personality),
      abilities: JSON.parse(row.abilities),
      tags: JSON.parse(row.tags),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async update(id: string, entity: Partial<Character>): Promise<Character | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated: Character = {
      ...existing,
      ...entity,
      updatedAt: new Date(),
    };

    await this.db.execute(`
      UPDATE characters SET
        name = ?, description = ?, appearance = ?, personality = ?,
        abilities = ?, background = ?, tags = ?, updated_at = ?
      WHERE id = ?
    `, [
      updated.name,
      updated.description,
      JSON.stringify(updated.appearance),
      JSON.stringify(updated.personality),
      JSON.stringify(updated.abilities),
      updated.background,
      JSON.stringify(updated.tags),
      updated.updatedAt.toISOString(),
      id,
    ]);

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    await this.db.execute('DELETE FROM characters WHERE id = ?', [id]);
    return true;
  }

  async createMany(entities: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Character[]> {
    const results: Character[] = [];
    for (const entity of entities) {
      results.push(await this.create(entity));
    }
    return results;
  }
}
