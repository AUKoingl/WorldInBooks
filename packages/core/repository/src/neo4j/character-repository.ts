import { Driver } from 'neo4j-driver';
import { generateId, Character, CharacterSchema } from '@shu-zhong-jie/entities';
import { BaseNeo4jRepository, Neo4jLabelConfig } from './base-neo4j-repository';

// JSON 字段配置
const JSON_FIELDS = new Set(['appearance', 'personality', 'abilities', 'tags']);

export class Neo4jCharacterRepository extends BaseNeo4jRepository<Character, Omit<Character, 'id' | 'createdAt' | 'updatedAt'>> {
  protected readonly config: Neo4jLabelConfig = {
    label: 'Character',
    jsonFields: JSON_FIELDS,
    orderBy: 'name',
  };

  constructor(driver: Driver) {
    super(driver);
  }

  /**
   * 查找人物的关系网络
   */
  async findRelationships(characterId: string): Promise<{
    source: Character;
    relationship: any;
    target: Character;
  }[]> {
    return this.runInReadSession(async (session) => {
      const result = await session.run(`
        MATCH (c:Character {id: $id})-[r]-(other:Character)
        RETURN c, r, other
      `, { id: characterId });

      return result.records.map(record => ({
        source: this.nodeToEntity<Character>(record.get('c'))!,
        relationship: record.get('r')?.properties || {},
        target: this.nodeToEntity<Character>(record.get('other'))!,
      }));
    });
  }

  /**
   * 查找人物参与的事件
   */
  async findEvents(characterId: string): Promise<any[]> {
    const cypher = `
      MATCH (c:Character {id: $id})-[:PARTICIPATED_IN]->(e:Event)
      RETURN e ORDER BY e.startTime
    `;
    return await this.runQuery(cypher, { id: characterId });
  }

  /**
   * 查找人物所在的地点
   */
  async findLocations(characterId: string): Promise<any[]> {
    const cypher = `
      MATCH (c:Character {id: $id})-[:LOCATED_AT]->(l:Location)
      RETURN l
    `;
    return await this.runQuery(cypher, { id: characterId });
  }

  /**
   * 搜索人物（按名称模糊匹配）
   */
  async searchByName(nameQuery: string): Promise<Character[]> {
    const cypher = `
      MATCH (c:Character)
      WHERE c.name CONTAINS $nameQuery
      RETURN c ORDER BY c.name
    `;
    return await this.runQuery<Character>(cypher, { nameQuery });
  }

  /**
   * 按标签搜索人物
   */
  async searchByTag(tag: string): Promise<Character[]> {
    const cypher = `
      MATCH (c:Character)
      WHERE $tag IN c.tags
      RETURN c ORDER BY c.name
    `;
    return await this.runQuery<Character>(cypher, { tag });
  }
}
