import { Character, CharacterSchema } from '@shu-zhong-jie/entities';
import { BaseSQLiteRepository, FieldMapping } from './base-sqlite-repository';

/**
 * 人物数据库行类型
 */
interface CharacterDbRow {
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
  [key: string]: unknown;
}

/**
 * SQLite 人物仓储
 */
export class SQLiteCharacterRepository extends BaseSQLiteRepository<Character, Omit<Character, 'id' | 'createdAt' | 'updatedAt'>, CharacterDbRow> {
  protected readonly tableName = 'characters';
  protected readonly fieldMapping: FieldMapping = {
    camelToSnake: {
      id: 'id',
      name: 'name',
      description: 'description',
      type: 'type',
      appearance: 'appearance',
      personality: 'personality',
      abilities: 'abilities',
      background: 'background',
      tags: 'tags',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    jsonFields: ['appearance', 'personality', 'abilities', 'tags'],
  };

  /**
   * 重写 findById，添加 type 字段的类型断言
   */
  async findById(id: string): Promise<Character | null> {
    const result = await this.db.select<CharacterDbRow[]>(
      'SELECT * FROM characters WHERE id = ? LIMIT 1',
      [id]
    );

    if (!result || result.length === 0) return null;

    const entity = this.toEntity(result[0]);
    // 确保 type 字段正确设置
    return { ...entity, type: 'character' as const };
  }

  /**
   * 重写 findAll，添加 type 字段的类型断言
   */
  async findAll(): Promise<Character[]> {
    const results = await this.db.select<CharacterDbRow[]>('SELECT * FROM characters ORDER BY name');
    return results.map(row => ({ ...this.toEntity(row), type: 'character' as const }));
  }

  /**
   * 重写 create，确保 type 字段正确
   */
  async create(entity: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>): Promise<Character> {
    const character = await super.create(entity);
    return { ...character, type: 'character' as const };
  }
}
