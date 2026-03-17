import neo4j, { Driver, Session, Result, QueryResult } from 'neo4j-driver';

/**
 * Neo4j 基础仓储类 - 提供数据库会话管理和 Cypher 执行
 */
export abstract class BaseNeo4jRepository {
  protected readonly driver: Driver;

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
   * 执行查询（只读）
   */
  protected async runQuery<T>(
    cypher: string,
    parameters?: Record<string, unknown>
  ): Promise<T[]> {
    const session = this.getSession();
    try {
      const result: QueryResult = await session.run(cypher, parameters);
      return this.extractRecords<T>(result);
    } finally {
      await session.close();
    }
  }

  /**
   * 执行写入操作
   */
  protected async runWriteQuery<T>(
    cypher: string,
    parameters?: Record<string, unknown>
  ): Promise<T> {
    const session = this.getWriteSession();
    try {
      const result: QueryResult = await session.run(cypher, parameters);
      return this.extractSingleRecord<T>(result);
    } finally {
      await session.close();
    }
  }

  /**
   * 从查询结果中提取记录数组
   */
  protected extractRecords<T>(result: QueryResult): T[] {
    return result.records.map(record => {
      const value = record.get(0);
      if (value && typeof value === 'object' && 'properties' in value) {
        return value.properties as unknown as T;
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
      return value.properties as unknown as T;
    }
    return value as T;
  }

  /**
   * 转换 Neo4j 节点为实体对象
   */
  protected nodeToEntity<T>(node: any): T {
    if (!node) return null as T;
    const properties = node.properties || node;
    return this.convertProperties(properties);
  }

  /**
   * 转换 Neo4j 属性为实体格式
   */
  protected convertProperties<T>(properties: Record<string, unknown>): T {
    const entity: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(properties)) {
      const camelKey = this.snakeToCamel(key);
      // JSON 字符串需要解析
      if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
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
}
