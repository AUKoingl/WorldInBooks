import { Driver } from 'neo4j-driver';
import { generateId, Event } from '@shu-zhong-jie/entities';
import { BaseNeo4jRepository } from './base-neo4j-repository';

/**
 * Neo4j 事件仓储 - 用于图关系查询（事件因果链）
 */
export class Neo4jEventRepository extends BaseNeo4jRepository {
  constructor(driver: Driver) {
    super(driver);
  }

  async create(entity: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    const now = new Date().toISOString();
    const id = generateId();

    const cypher = `
      CREATE (e:Event {
        id: $id,
        name: $name,
        description: $description,
        type: $type,
        eventType: $eventType,
        importance: $importance,
        startTime: $startTime,
        endTime: $endTime,
        locationIds: $locationIds,
        characterIds: $characterIds,
        causeEventIds: $causeEventIds,
        effectEventIds: $effectEventIds,
        foreshadowingIds: $foreshadowingIds,
        tags: $tags,
        notes: $notes,
        createdAt: $createdAt,
        updatedAt: $updatedAt
      })
      RETURN e
    `;

    const params = {
      id,
      name: entity.name,
      description: entity.description || '',
      type: 'event',
      eventType: entity.eventType,
      importance: entity.importance,
      startTime: entity.startTime || null,
      endTime: entity.endTime || null,
      locationIds: JSON.stringify(entity.locationIds),
      characterIds: JSON.stringify(entity.characterIds),
      causeEventIds: JSON.stringify(entity.causeEventIds),
      effectEventIds: JSON.stringify(entity.effectEventIds),
      foreshadowingIds: JSON.stringify(entity.foreshadowingIds),
      tags: JSON.stringify(entity.tags),
      notes: entity.notes || '',
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.runWriteQuery<any>(cypher, params);
    return this.nodeToEntity<Event>(result);
  }

  async findById(id: string): Promise<Event | null> {
    const cypher = `
      MATCH (e:Event {id: $id})
      RETURN e
    `;

    const result = await this.runQuery<Event>(cypher, { id });
    return result[0] || null;
  }

  async findAll(): Promise<Event[]> {
    const cypher = `
      MATCH (e:Event)
      RETURN e ORDER BY e.startTime
    `;

    return await this.runQuery<Event>(cypher);
  }

  async update(id: string, entity: Partial<Event>): Promise<Event | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const setClauses: string[] = [];
    const params: Record<string, unknown> = { id };

    const updatableFields = [
      'name', 'description', 'eventType', 'importance',
      'startTime', 'endTime', 'locationIds', 'characterIds',
      'causeEventIds', 'effectEventIds', 'foreshadowingIds',
      'tags', 'notes'
    ];

    for (const field of updatableFields) {
      if (entity[field as keyof Event] !== undefined) {
        const value = entity[field as keyof Event];
        const jsonFields = ['locationIds', 'characterIds', 'causeEventIds', 'effectEventIds', 'foreshadowingIds', 'tags'];
        if (jsonFields.includes(field)) {
          setClauses.push(`e.${field} = ${JSON.stringify(value)}`);
        } else if (value !== null) {
          setClauses.push(`e.${field} = $${field}`);
          params[field] = value;
        } else {
          setClauses.push(`e.${field} = null`);
        }
      }
    }

    setClauses.push('e.updatedAt = $updatedAt');
    params.updatedAt = new Date().toISOString();

    const cypher = `
      MATCH (e:Event {id: $id})
      SET ${setClauses.join(', ')}
      RETURN e
    `;

    const result = await this.runWriteQuery<any>(cypher, params);
    return this.nodeToEntity<Event>(result);
  }

  async delete(id: string): Promise<boolean> {
    const cypher = `
      MATCH (e:Event {id: $id})
      DETACH DELETE e
    `;

    await this.runWriteQuery(cypher, { id });
    return true;
  }

  async createMany(entities: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Event[]> {
    const results: Event[] = [];
    for (const entity of entities) {
      results.push(await this.create(entity));
    }
    return results;
  }

  /**
   * 查找事件的因果关系
   */
  async findCausalRelationships(eventId: string): Promise<{
    causes: Event[];
    effects: Event[];
  }> {
    const cypher = `
      MATCH (c:Event)-[:CAUSES]->(e:Event {id: $id})
      MATCH (e:Event {id: $id})-[:CAUSES]->(f:Event)
      RETURN c, f
    `;

    const session = this.getSession();
    try {
      const result = await session.run(cypher, { id: eventId });
      const causes: Event[] = [];
      const effects: Event[] = [];

      for (const record of result.records) {
        const cause = record.get('c');
        const effect = record.get('f');
        if (cause) causes.push(this.nodeToEntity<Event>(cause));
        if (effect) effects.push(this.nodeToEntity<Event>(effect));
      }

      return { causes, effects };
    } finally {
      await session.close();
    }
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
