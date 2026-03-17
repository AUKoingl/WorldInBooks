import neo4j, { Driver, Session, QueryResult } from 'neo4j-driver';
import type { IRepository } from '../types';

/**
 * Neo4j 标签配置 - 定义节点标签
 */
export interface Neo4jLabelConfig {
  /** 节点标签（如 'Character', 'Event'） */
  label: string;
  /** 需要 JSON 序列化/反序列化的字段集合 */
  jsonFields: Set<string>;
  /** 查询结果排序字段，默认为 'name' */
  orderBy?: string;
}

/**
 * Neo4j 基础仓储类 - 实现通用的 CRUD 操作
 *
 * @template T - 实体类型（必须包含 id, type, createdAt, updatedAt）
 * @template TCreate - 创建实体类型（不含 id, createdAt, updatedAt）
 */
export abstract class BaseNeo4jRepository<
  T extends { id: string; type: string; createdAt: Date; updatedAt: Date },
  TCreate extends Omit<T, 'id' | 'createdAt' | 'updatedAt'>
> implements IRepository<T> {
  protected readonly driver: Driver;
  protected abstract readonly config: Neo4jLabelConfig;

  constructor(driver: Driver) {
    this.driver = driver;
  }

  /**
   * 获取只读会话
   */
  protected getSession(): Session {
    return this.driver.session({ defaultAccessMode: neo4j.session.READ });
  }

  /**
   * 获取读写会话
   */
  protected getWriteSession(): Session {
    return this.driver.session({ defaultAccessMode: neo4j.session.WRITE });
  }

  /**
   * 在会话中执行读取操作
   */
  protected async runInReadSession<T>(action: (session: Session) => Promise<T>): Promise<T> {
    const session = this.getSession();
    try {
      return await action(session);
    } finally {
      await session.close();
    }
  }

  /**
   * 在会话中执行写入操作
   */
  protected async runInWriteSession<T>(action: (session: Session) => Promise<T>): Promise<T> {
    const session = this.getWriteSession();
    try {
      return await action(session);
    } finally {
      await session.close();
    }
  }

  /**
   * 执行查询（只读）
   */
  protected async runQuery<T>(cypher: string, parameters?: Record<string, unknown>): Promise<T[]> {
    return this.runInReadSession(async (session) => {
      const result: QueryResult = await session.run(cypher, parameters);
      return this.extractRecords<T>(result);
    });
  }

  /**
   * 执行写入操作
   */
  protected async runWriteQuery<T>(cypher: string, parameters?: Record<string, unknown>): Promise<T> {
    return this.runInWriteSession(async (session) => {
      const result: QueryResult = await session.run(cypher, parameters);
      return this.extractSingleRecord<T>(result);
    });
  }

  /**
   * 从查询结果中提取记录数组
   */
  protected extractRecords<T>(result: QueryResult): T[] {
    return result.records.map(record => {
      const value = record.get(0);
      if (value && typeof value === 'object' && 'properties' in value) {
        return (value as any).properties as unknown as T;
      }
      return value as T;
    });
  }

  /**
   * 从查询结果中提取单条记录
   */
  protected extractSingleRecord<T>(result: QueryResult): T {
    if (result.records.length === 0) {
      return null as T;
    }
    const record = result.records[0];
    const value = record.get(0);
    if (value && typeof value === 'object' && 'properties' in value) {
      return (value as any).properties as unknown as T;
    }
    return value as T;
  }

  /**
   * 转换 Neo4j 属性为实体格式
   */
  protected convertProperties<T>(properties: Record<string, unknown>): T {
    const entity: Record<string, unknown> = {};
    const { jsonFields } = this.config;

    for (const [key, value] of Object.entries(properties)) {
      const camelKey = this.snakeToCamel(key);

      // JSON 字段需要解析
      if (jsonFields.has(camelKey) && typeof value === 'string') {
        try {
          entity[camelKey] = JSON.parse(value);
        } catch {
          entity[camelKey] = value;
        }
      } else if (typeof value === 'bigint') {
        entity[camelKey] = Number(value);
      } else {
        entity[camelKey] = value;
      }
    }
    return entity as T;
  }

  /**
   * 转换 Neo4j 节点为实体对象
   */
  protected nodeToEntity<T>(node: any): T | null {
    if (!node) return null as T;
    const properties = node.properties || node;
    return this.convertProperties<T>(properties);
  }

  /**
   * 蛇形转驼峰
   */
  protected snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
   * 驼峰转蛇形
   */
  protected camelToSnake(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
  }

  /**
   * 构建 Cypher CREATE 语句
   */
  protected buildCreateCypher(entity: TCreate): { cypher: string; params: Record<string, unknown> } {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const { label, jsonFields } = this.config;

    // 构建参数字段
    const params: Record<string, unknown> = {
      id,
      type: (this as any).typeLiteral || label.toLowerCase(),
      createdAt: now,
      updatedAt: now,
    };

    // 添加实体字段
    for (const [key, value] of Object.entries(entity)) {
      params[key] = jsonFields.has(key) ? JSON.stringify(value) : value;
    }

    // 构建属性列表
    const propList = Object.keys(params)
      .map(key => `${key}: $${key}`)
      .join(',\n    ');

    const cypher = `
      CREATE (n:${label} {
        ${propList}
      })
      RETURN n
    `;

    return { cypher, params };
  }

  /**
   * 构建 Cypher UPDATE SET 子句
   */
  protected buildUpdateSetClause(
    entity: Partial<T>,
    jsonFields: Set<string>,
    nodeAlias: string = 'n'
  ): { setClauses: string[]; params: Record<string, unknown> } {
    const setClauses: string[] = [];
    const params: Record<string, unknown> = {};

    for (const [field, value] of Object.entries(entity)) {
      if (value === undefined || field === 'id' || field === 'createdAt') continue;

      if (jsonFields.has(field)) {
        setClauses.push(`${nodeAlias}.${field} = ${JSON.stringify(value)}`);
      } else if (value !== null) {
        setClauses.push(`${nodeAlias}.${field} = $${field}`);
        params[field] = value;
      } else {
        setClauses.push(`${nodeAlias}.${field} = null`);
      }
    }

    return { setClauses, params };
  }

  // ==================== 通用 CRUD 实现 ====================

  async create(entity: TCreate): Promise<T> {
    const { cypher, params } = this.buildCreateCypher(entity);
    const result = await this.runWriteQuery<any>(cypher, params);
    return this.nodeToEntity<T>(result) as T;
  }

  async findById(id: string): Promise<T | null> {
    const { label } = this.config;
    const cypher = `MATCH (n:${label} {id: $id}) RETURN n`;
    const result = await this.runQuery<T>(cypher, { id });
    return result[0] || null;
  }

  async findAll(): Promise<T[]> {
    const { label, orderBy } = this.config;
    const cypher = `MATCH (n:${label}) RETURN n ORDER BY n.${orderBy || 'name'}`;
    return await this.runQuery<T>(cypher);
  }

  async update(id: string, entity: Partial<T>): Promise<T | null> {
    const { label } = this.config;
    const { setClauses, params } = this.buildUpdateSetClause(entity, this.config.jsonFields);

    if (setClauses.length === 0) {
      // 如果没有字段需要更新，直接返回现有实体
      return this.findById(id);
    }

    setClauses.push(`n.updatedAt = $updatedAt`);
    params.updatedAt = new Date().toISOString();

    const cypher = `
      MATCH (n:${label} {id: $id})
      SET ${setClauses.join(', ')}
      RETURN n
    `;

    const result = await this.runWriteQuery<any>(cypher, { id, ...params });
    return this.nodeToEntity<T>(result);
  }

  async delete(id: string): Promise<boolean> {
    const { label } = this.config;
    const cypher = `MATCH (n:${label} {id: $id}) DETACH DELETE n`;
    await this.runWriteQuery(cypher, { id });
    return true;
  }

  async createMany(entities: TCreate[]): Promise<T[]> {
    const { label, jsonFields } = this.config;
    const now = new Date().toISOString();

    // 使用 UNWIND 进行批量创建
    const entitiesWithMeta = entities.map(entity => {
      const typedEntity = entity as Record<string, unknown>;
      return {
        ...typedEntity,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        type: (this as any).typeLiteral || label.toLowerCase(),
      };
    });

    // 获取所有非 JSON 字段
    const allKeys = new Set<string>();
    entities.forEach(entity => {
      Object.keys(entity).forEach(key => allKeys.add(key));
    });
    const nonJsonKeys = Array.from(allKeys).filter(key => !jsonFields.has(key));

    const jsonFieldsList = Array.from(jsonFields);
    const nonJsonFieldsList = nonJsonKeys;

    const jsonFieldsCypher = jsonFieldsList.map(f => `${f}: entity.${f}`).join(',\n        ');
    const nonJsonFieldsCypher = nonJsonFieldsList
      .filter(key => key !== 'id' && key !== 'type')
      .map(key => `${key}: entity.${key}`)
      .join(',\n        ');

    const cypher = `
      UNWIND $entities AS entity
      CREATE (n:${label} {
        id: entity.id,
        type: entity.type,
        ${jsonFieldsCypher}${jsonFieldsCypher && nonJsonFieldsCypher ? ',\n        ' : ''}${nonJsonFieldsCypher}
      })
      RETURN n
    `;

    const result = await this.runWriteQuery<any[]>(cypher, { entities: entitiesWithMeta });
    return result.map(r => this.nodeToEntity<T>(r) as T);
  }
}
