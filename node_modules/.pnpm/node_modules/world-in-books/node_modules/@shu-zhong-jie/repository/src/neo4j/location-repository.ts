import { Driver } from 'neo4j-driver';
import { Location, LocationSchema } from '@shu-zhong-jie/entities';
import { BaseNeo4jRepository, Neo4jLabelConfig } from './base-neo4j-repository';

// JSON 字段配置
const JSON_FIELDS = new Set([
  'atmosphere',
  'childLocationIds',
  'worldSettingIds',
  'eventIds',
  'characterIds',
  'coordinates',
  'tags',
]);

export class Neo4jLocationRepository extends BaseNeo4jRepository<Location, Omit<Location, 'id' | 'createdAt' | 'updatedAt'>> {
  protected readonly config: Neo4jLabelConfig = {
    label: 'Location',
    jsonFields: JSON_FIELDS,
    orderBy: 'name',
  };

  constructor(driver: Driver) {
    super(driver);
  }

  /**
   * 查找地点的父子层次关系
   */
  async findHierarchy(locationId: string): Promise<{
    parent: Location | null;
    children: Location[];
  }> {
    const cypher = `
      MATCH (l:Location {id: $id})
      OPTIONAL MATCH (p:Location)-[:CONTAINS]->(l)
      OPTIONAL MATCH (l)-[:CONTAINS]->(c:Location)
      RETURN p, COLLECT(DISTINCT c) as children
    `;

    const session = this.getSession();
    try {
      const result = await session.run(cypher, { id: locationId });
      if (result.records.length === 0) {
        return { parent: null, children: [] };
      }

      const record = result.records[0];
      const parent = record.get('p');
      const children = record.get('children');

      return {
        parent: parent ? this.nodeToEntity<Location>(parent) : null,
        children: Array.isArray(children) ? children.filter(c => c !== null).map(c => this.nodeToEntity<Location>(c)!) : [],
      };
    } finally {
      await session.close();
    }
  }

  /**
   * 查找地点包含的事件
   */
  async findEvents(locationId: string): Promise<any[]> {
    const cypher = `
      MATCH (l:Location {id: $id})<-[:OCCURRED_AT]-(e:Event)
      RETURN e ORDER BY e.startTime
    `;
    return await this.runQuery(cypher, { id: locationId });
  }

  /**
   * 查找地点包含的人物
   */
  async findCharacters(locationId: string): Promise<any[]> {
    const cypher = `
      MATCH (l:Location {id: $id})<-[:LOCATED_AT]-(c:Character)
      RETURN c ORDER BY c.name
    `;
    return await this.runQuery(cypher, { id: locationId });
  }

  /**
   * 查找地点所属的世界观
   */
  async findWorldSettings(locationId: string): Promise<any[]> {
    const cypher = `
      MATCH (l:Location {id: $id})<-[:CONTAINS_LOCATION]-(w:WorldSetting)
      RETURN w
    `;
    return await this.runQuery(cypher, { id: locationId });
  }

  /**
   * 按地点类型搜索
   */
  async findByType(locationType: string): Promise<Location[]> {
    const cypher = `
      MATCH (l:Location {locationType: $locationType})
      RETURN l ORDER BY l.name
    `;
    return await this.runQuery<Location>(cypher, { locationType });
  }

  /**
   * 按氛围标签搜索地点
   */
  async findByAtmosphere(atmosphere: string): Promise<Location[]> {
    const cypher = `
      MATCH (l:Location)
      WHERE $atmosphere IN l.atmosphere
      RETURN l ORDER BY l.name
    `;
    return await this.runQuery<Location>(cypher, { atmosphere });
  }
}
