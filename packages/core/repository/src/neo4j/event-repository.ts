import { Driver } from 'neo4j-driver';
import { Event, EventSchema } from '@shu-zhong-jie/entities';
import { BaseNeo4jRepository, Neo4jLabelConfig } from './base-neo4j-repository';

// JSON 字段配置
const JSON_FIELDS = new Set([
  'locationIds',
  'characterIds',
  'causeEventIds',
  'effectEventIds',
  'foreshadowingIds',
  'tags',
]);

export class Neo4jEventRepository extends BaseNeo4jRepository<Event, Omit<Event, 'id' | 'createdAt' | 'updatedAt'>> {
  protected readonly config: Neo4jLabelConfig = {
    label: 'Event',
    jsonFields: JSON_FIELDS,
    orderBy: 'startTime',
  };

  constructor(driver: Driver) {
    super(driver);
  }

  /**
   * 查找事件的因果关系
   */
  async findCausalRelationships(eventId: string): Promise<{
    causes: Event[];
    effects: Event[];
  }> {
    const causesCypher = `
      MATCH (c:Event)-[:CAUSES]->(e:Event {id: $id})
      RETURN c
    `;

    const effectsCypher = `
      MATCH (e:Event {id: $id})-[:CAUSES]->(f:Event)
      RETURN f
    `;

    const [causes, effects] = await Promise.all([
      this.runQuery<Event>(causesCypher, { id: eventId }),
      this.runQuery<Event>(effectsCypher, { id: eventId }),
    ]);

    return { causes, effects };
  }

  /**
   * 查找事件相关的人物
   */
  async findCharacters(eventId: string): Promise<any[]> {
    const cypher = `
      MATCH (e:Event {id: $id})<-[:PARTICIPATED_IN]-(c:Character)
      RETURN c
    `;
    return await this.runQuery(cypher, { id: eventId });
  }

  /**
   * 查找事件相关的地点
   */
  async findLocations(eventId: string): Promise<any[]> {
    const cypher = `
      MATCH (e:Event {id: $id})<-[:OCCURRED_AT]-(l:Location)
      RETURN l
    `;
    return await this.runQuery(cypher, { id: eventId });
  }

  /**
   * 按时间范围搜索事件
   */
  async findByTimeRange(startTime: string, endTime: string): Promise<Event[]> {
    const cypher = `
      MATCH (e:Event)
      WHERE e.startTime >= $startTime AND e.startTime <= $endTime
      RETURN e ORDER BY e.startTime
    `;
    return await this.runQuery<Event>(cypher, { startTime, endTime });
  }

  /**
   * 按事件类型搜索
   */
  async findByType(eventType: string): Promise<Event[]> {
    const cypher = `
      MATCH (e:Event {eventType: $eventType})
      RETURN e ORDER BY e.startTime
    `;
    return await this.runQuery<Event>(cypher, { eventType });
  }

  /**
   * 按重要性搜索事件
   */
  async findByImportance(importance: string): Promise<Event[]> {
    const cypher = `
      MATCH (e:Event {importance: $importance})
      RETURN e ORDER BY e.startTime
    `;
    return await this.runQuery<Event>(cypher, { importance });
  }
}
