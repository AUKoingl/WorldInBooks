import { Character, CharacterSchema } from '@shu-zhong-jie/entities';
import { BaseSQLiteRepository, FieldMapping, BaseRepositoryConfig } from './base-sqlite-repository';

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
 * SQLite 人物仓储配置
 */
const config: BaseRepositoryConfig<'character'> = {
  typeLiteral: 'character',
  orderBy: 'name',
};

/**
 * SQLite 人物仓储
 */
export class SQLiteCharacterRepository extends BaseSQLiteRepository<Character, Omit<Character, 'id' | 'createdAt' | 'updatedAt'>, CharacterDbRow, 'character'> {
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
  protected readonly config = config;
}
