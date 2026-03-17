import { Driver } from 'neo4j-driver';
import { generateId, Location } from '@shu-zhong-jie/entities';
import { BaseNeo4jRepository } from './base-neo4j-repository';

/**
 * Neo4j 地点仓储 - 用于图关系查询（空间层次关系）
 */
export class Neo4jLocationRepository extends BaseNeo4jRepository {
  constructor(driver: Driver) {
    super(driver);
  }

  async create(entity: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>): Promise<Location> {
    const now = new Date().toISOString();
    const id = generateId();

    const cypher = `
      CREATE (l:Location {
        id: $id,
        name: $name,
        description: $description,
        type: $type,
        locationType: $locationType,
        atmosphere: $atmosphere,
        parentLocationId: $parentLocationId,
        childLocationIds: $childLocationIds,
        worldSettingIds: $worldSettingIds,
        eventIds: $eventIds,
        characterIds: $characterIds,
        coordinates: $coordinates,
        physicalDescription: $physicalDescription,
        history: $history,
        tags: $tags,
        createdAt: $createdAt,
        updatedAt: $updatedAt
      })
      RETURN l
    `;

    const params = {
      id,
      name: entity.name,
      description: entity.description || '',
      type: 'location',
      locationType: entity.locationType,
      atmosphere: JSON.stringify(entity.atmosphere),
      parentLocationId: entity.parentLocationId || null,
      childLocationIds: JSON.stringify(entity.childLocationIds),
      worldSettingIds: JSON.stringify(entity.worldSettingIds),
      eventIds: JSON.stringify(entity.eventIds),
      characterIds: JSON.stringify(entity.characterIds),
      coordinates: entity.coordinates ? JSON.stringify(entity.coordinates) : null,
      physicalDescription: entity.physicalDescription || '',
      history: entity.history || '',
      tags: JSON.stringify(entity.tags),
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.runWriteQuery<any>(cypher, params);
    return this.nodeToEntity<Location>(result);
  }

  async findById(id: string): Promise<Location | null> {
    const cypher = `
      MATCH (l:Location {id: $id})
      RETURN l
    `;

    const result = await this.runQuery<Location>(cypher, { id });
    return result[0] || null;
  }

  async findAll(): Promise<Location[]> {
    const cypher = `
      MATCH (l:Location)
      RETURN l ORDER BY l.name
    `;

    return await this.runQuery<Location>(cypher);
  }

  async update(id: string, entity: Partial<Location>): Promise<Location | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const setClauses: string[] = [];
    const params: Record<string, unknown> = { id };

    const updatableFields = [
      'name', 'description', 'locationType', 'atmosphere',
      'parentLocationId', 'childLocationIds', 'worldSettingIds',
      'eventIds', 'characterIds', 'coordinates',
      'physicalDescription', 'history', 'tags'
    ];

    for (const field of updatableFields) {
      if (entity[field as keyof Location] !== undefined) {
        const value = entity[field as keyof Location];
        const jsonFields = ['atmosphere', 'childLocationIds', 'worldSettingIds', 'eventIds', 'characterIds', 'coordinates', 'tags'];
        if (jsonFields.includes(field)) {
          setClauses.push(`l.${field} = ${JSON.stringify(value)}`);
        } else if (value !== null) {
          setClauses.push(`l.${field} = $${field}`);
          params[field] = value;
        } else {
          setClauses.push(`l.${field} = null`);
        }
      }
    }

    setClauses.push('l.updatedAt = $updatedAt');
    params.updatedAt = new Date().toISOString();

    const cypher = `
      MATCH (l:Location {id: $id})
      SET ${setClauses.join(', ')}
      RETURN l
    `;

    const result = await this.runWriteQuery<any>(cypher, params);
    return this.nodeToEntity<Location>(result);
  }

  async delete(id: string): Promise<boolean> {
    const cypher = `
      MATCH (l:Location {id: $id})
      DETACH DELETE l
    `;

    await this.runWriteQuery(cypher, { id });
    return true;
  }

  async createMany(entities: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Location[]> {
    const results: Location[] = [];
    for (const entity of entities) {
      results.push(await this.create(entity));
    }
    return results;
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
      RETURN p, c
    `;

    const session = this.getSession();
    try {
      const result = await session.run(cypher, { id: locationId });
      const parents: Location[] = [];
      const children: Location[] = [];

      for (const record of result.records) {
        const parent = record.get('p');
        const child = record.get('c');
        if (parent) parents.push(this.nodeToEntity<Location>(parent));
        if (child) children.push(this.nodeToEntity<Location>(child));
      }

      return {
        parent: parents[0] || null,
        children,
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
