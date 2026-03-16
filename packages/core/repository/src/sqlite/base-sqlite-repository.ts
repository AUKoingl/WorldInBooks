import { generateId } from '@shu-zhong-jie/entities';
import Database from '@tauri-apps/plugin-sql';
import type { IRepository } from '../types';

/**
 * 字段映射配置 - 定义 camelCase 实体字段到 snake_case 数据库字段的映射
 */
export interface FieldMapping {
  camelToSnake: Record<string, string>;
  jsonFields: string[]; // 需要 JSON 序列化/反序列化的字段
}

/**
 * SQLite 基础仓储类 - 实现通用的 CRUD 操作
 *
 * @template T - 实体类型
 * @template TCreate - 创建实体类型（不含 id, createdAt, updatedAt）
 * @template TDbRow - 数据库行类型（所有字段为 snake_case）
 */
export abstract class BaseSQLiteRepository<
  T extends { id: string; createdAt: Date; updatedAt: Date },
  TCreate extends Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
  TDbRow extends Record<string, unknown>
> implements IRepository<T> {
  protected abstract readonly tableName: string;
  protected abstract readonly fieldMapping: FieldMapping;
  protected readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * 将 camelCase 实体转换为 snake_case 数据库记录
   */
  protected toDbRecord(entity: T | TCreate): Record<string, unknown> {
    const record: Record<string, unknown> = {};
    const { camelToSnake, jsonFields } = this.fieldMapping;

    for (const [camelKey, snakeKey] of Object.entries(camelToSnake)) {
      if (camelKey in entity) {
        const value = entity[camelKey as keyof typeof entity];
        record[snakeKey] = jsonFields.includes(camelKey) ? JSON.stringify(value) : value;
      }
    }

    return record;
  }

  /**
   * 将 snake_case 数据库记录转换为 camelCase 实体
   */
  protected toEntity(row: TDbRow): T {
    const entity: Record<string, unknown> = {};
    const { camelToSnake, jsonFields } = this.fieldMapping;

    // 创建反向映射
    const snakeToCamel = Object.fromEntries(
      Object.entries(camelToSnake).map(([camel, snake]) => [snake, camel])
    );

    for (const snakeKey of Object.keys(row)) {
      const camelKey = snakeToCamel[snakeKey] || snakeKey;
      let value = row[snakeKey];

      // JSON 字段需要解析
      if (jsonFields.includes(camelKey) && typeof value === 'string') {
        value = JSON.parse(value as string);
      }

      // 时间字段需要转换
      if ((camelKey === 'createdAt' || camelKey === 'updatedAt') && typeof value === 'string') {
        value = new Date(value as string);
      }

      entity[camelKey] = value;
    }

    return entity as T;
  }

  /**
   * 生成插入 SQL 语句
   */
  protected generateInsertSql(): string {
    const columns = Object.values(this.fieldMapping.camelToSnake);
    const placeholders = columns.map(() => '?').join(', ');
    return `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
  }

  /**
   * 生成插入值数组
   */
  protected toInsertValues(entity: TCreate): unknown[] {
    const dbRecord = this.toDbRecord(entity);
    const { camelToSnake } = this.fieldMapping;

    // 按照字段映射的顺序返回值
    return Object.values(camelToSnake).map(snakeKey => dbRecord[snakeKey]);
  }

  /**
   * 生成更新 SQL 语句
   */
  protected generateUpdateSql(): string {
    const columns = Object.values(this.fieldMapping.camelToSnake)
      .filter(col => col !== 'id'); // ID 不参与更新
    const setClause = columns.map(col => `${col} = ?`).join(', ');
    return `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
  }

  /**
   * 生成更新值数组（包含 ID 用于 WHERE 子句）
   */
  protected toUpdateValues(entity: Partial<T>, id: string): unknown[] {
    const dbRecord = this.toDbRecord(entity as T);
    const { camelToSnake } = this.fieldMapping;

    // 只更新提供的字段，但保持顺序
    const values = Object.values(camelToSnake)
      .filter(snakeKey => snakeKey !== 'id' && snakeKey in dbRecord)
      .map(snakeKey => dbRecord[snakeKey]);

    return [...values, id];
  }

  async create(entity: TCreate): Promise<T> {
    const id = generateId();
    const now = new Date().toISOString();

    const fullEntity = {
      ...entity,
      id,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    } as unknown as T;

    const sql = this.generateInsertSql();
    const values = this.toInsertValues(fullEntity as unknown as TCreate);

    await this.db.execute(sql, values);

    return fullEntity;
  }

  async findById(id: string): Promise<T | null> {
    const sql = `SELECT * FROM ${this.tableName} WHERE id = ? LIMIT 1`;
    const result = await this.db.select<TDbRow[]>(sql, [id]);

    if (!result || result.length === 0) return null;
    return this.toEntity(result[0]);
  }

  async findAll(): Promise<T[]> {
    const sql = `SELECT * FROM ${this.tableName} ORDER BY name`;
    const results = await this.db.select<TDbRow[]>(sql);
    return results.map(row => this.toEntity(row));
  }

  async update(id: string, entity: Partial<T>): Promise<T | null> {
    const updated = {
      ...entity,
      updatedAt: new Date(),
    } as unknown as T;

    const sql = this.generateUpdateSql();
    const values = this.toUpdateValues(updated, id);

    const result = await this.db.execute(sql, values);

    // 如果没有影响任何行，说明实体不存在
    if (result && typeof result === 'object' && 'changes' in result && result.changes === 0) {
      return null;
    }

    // 返回更新后的实体（合并默认值）
    return {
      ...updated,
      id,
    } as unknown as T;
  }

  async delete(id: string): Promise<boolean> {
    const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
    await this.db.execute(sql, [id]);
    return true;
  }

  async createMany(entities: TCreate[]): Promise<T[]> {
    const results: T[] = [];
    const now = new Date().toISOString();

    // 使用事务批量插入，提升性能
    // 注意：tauri-plugin-sql-api 的 transaction 方法可能需要根据实际 API 调整
    // 如果底层不支持事务，这个方法会退化为串行执行
    try {
      // 预先生成所有 ID 和时间戳
      for (const entity of entities) {
        const id = generateId();
        const fullEntity = {
          ...entity,
          id,
          createdAt: new Date(now),
          updatedAt: new Date(now),
        } as unknown as T;

        const sql = this.generateInsertSql();
        const values = this.toInsertValues(fullEntity as unknown as TCreate);

        await this.db.execute(sql, values);
        results.push(fullEntity);
      }
    } catch (error) {
      // 如果有任何插入失败，抛出错误以便调用方处理
      // 注意：SQLite 默认 autocommit，这里需要手动回滚的话需要事务支持
      throw new Error(`createMany failed: ${error}`);
    }

    return results;
  }
}
