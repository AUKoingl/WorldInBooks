import { Driver } from 'neo4j-driver';
import { generateId, Timeline } from '@shu-zhong-jie/entities';
import { BaseNeo4jRepository } from './base-neo4j-repository';

/**
 * Neo4j 时间线仓储 - 用于图关系查询（时间线项关联）
 */
export class Neo4jTimelineRepository extends BaseNeo4jRepository {
  constructor(driver: Driver) {
    super(driver);
  }

  async create(entity: Omit<Timeline, 'id' | 'createdAt' | 'updatedAt'>): Promise<Timeline> {
    const now = new Date().toISOString();
    const id = generateId();

    const cypher = `
      CREATE (t:Timeline {
        id: $id,
        name: $name,
        description: $description,
        type: $type,
        items: $items,
        worldSettingId: $worldSettingId,
        createdAt: $createdAt,
        updatedAt: $updatedAt
      })
      RETURN t
    `;

    const params = {
      id,
      name: entity.name,
      description: entity.description || '',
      type: 'timeline',
      items: JSON.stringify(entity.items),
      worldSettingId: entity.worldSettingId || null,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.runWriteQuery<any>(cypher, params);
    return this.nodeToEntity<Timeline>(result);
  }

  async findById(id: string): Promise<Timeline | null> {
    const cypher = `
      MATCH (t:Timeline {id: $id})
      RETURN t
    `;

    const result = await this.runQuery<Timeline>(cypher, { id });
    return result[0] || null;
  }

  async findAll(): Promise<Timeline[]> {
    const cypher = `
      MATCH (t:Timeline)
      RETURN t ORDER BY t.name
    `;

    return await this.runQuery<Timeline>(cypher);
  }

  async update(id: string, entity: Partial<Timeline>): Promise<Timeline | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const setClauses: string[] = [];
    const params: Record<string, unknown> = { id };

    const updatableFields = ['name', 'description', 'items', 'worldSettingId'];

    for (const field of updatableFields) {
      if (entity[field as keyof Timeline] !== undefined) {
        const value = entity[field as keyof Timeline];
        if (field === 'items') {
          setClauses.push(`t.${field} = ${JSON.stringify(value)}`);
        } else if (value !== null) {
          setClauses.push(`t.${field} = $${field}`);
          params[field] = value;
        } else {
          setClauses.push(`t.${field} = null`);
        }
      }
    }

    setClauses.push('t.updatedAt = $updatedAt');
    params.updatedAt = new Date().toISOString();

    const cypher = `
      MATCH (t:Timeline {id: $id})
      SET ${setClauses.join(', ')}
      RETURN t
    `;

    const result = await this.runWriteQuery<any>(cypher, params);
    return this.nodeToEntity<Timeline>(result);
  }

  async delete(id: string): Promise<boolean> {
    const cypher = `
      MATCH (t:Timeline {id: $id})
      DETACH DELETE t
    `;

    await this.runWriteQuery(cypher, { id });
    return true;
  }

  async createMany(entities: Omit<Timeline, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Timeline[]> {
    const results: Timeline[] = [];
    for (const entity of entities) {
      results.push(await this.create(entity));
    }
    return results;
  }

  /**
   * 查找时间线项关联的实体
   */
  async findRelatedEntities(timelineId: string): Promise<{
    events: any[];
    characters: any[];
    locations: any[];
  }> {
    const session = this.getSession();
    try {
      // 首先获取时间线的 items
      const result = await session.run(`
        MATCH (t:Timeline {id: $id})
        RETURN t.items as items
      `, { id: timelineId });

      if (result.records.length === 0) {
        return { events: [], characters: [], locations: [] };
      }

      const items = JSON.parse(result.records[0].get('items') as string);
      const eventIds: string[] = [];
      const characterIds: string[] = [];
      const locationIds: string[] = [];

      // 收集相关 ID
      for (const item of items) {
        if (item.relatedEventIds) eventIds.push(...item.relatedEventIds);
        if (item.relatedCharacterIds) characterIds.push(...item.relatedCharacterIds);
        if (item.relatedLocationIds) locationIds.push(...item.relatedLocationIds);
      }

      // 并行查询相关实体
      const [events, characters, locations] = await Promise.all([
        eventIds.length > 0
          ? session.run(`
              MATCH (e:Event)
              WHERE e.id IN $ids
              RETURN e
            `, { ids: eventIds })
          : Promise.resolve({ records: [] }),
        characterIds.length > 0
          ? session.run(`
              MATCH (c:Character)
              WHERE c.id IN $ids
              RETURN c
            `, { ids: characterIds })
          : Promise.resolve({ records: [] }),
        locationIds.length > 0
          ? session.run(`
              MATCH (l:Location)
              WHERE l.id IN $ids
              RETURN l
            `, { ids: locationIds })
          : Promise.resolve({ records: [] }),
      ]);

      return {
        events: events.records.map(r => this.nodeToEntity(r.get('e'))),
        characters: characters.records.map(r => this.nodeToEntity(r.get('c'))),
        locations: locations.records.map(r => this.nodeToEntity(r.get('l'))),
      };
    } finally {
      await session.close();
    }
  }

  /**
   * 检测时间线冲突（同一实体在不同位置）
   */
  async detectConflicts(timelineId: string): Promise<{
    item1: any;
    item2: any;
    conflict: string;
  }[]> {
    const session = this.getSession();
    try {
      const result = await session.run(`
        MATCH (t:Timeline {id: $id})
        RETURN t.items as items
      `, { id: timelineId });

      if (result.records.length === 0) return [];

      const items = JSON.parse(result.records[0].get('items') as string);
      const conflicts: any[] = [];

      // 检查同一时间同一人物出现在不同地点
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const item1 = items[i];
          const item2 = items[j];

          // 检查时间重叠
          const timeOverlap =
            item1.startTime <= item2.endTime &&
            item2.startTime <= item1.endTime;

          if (!timeOverlap) continue;

          // 检查是否有相同人物在不同地点
          const commonCharacters = item1.relatedCharacterIds?.filter((id: string) =>
            item2.relatedCharacterIds?.includes(id)
          );

          if (commonCharacters && commonCharacters.length > 0) {
            const loc1 = item1.relatedLocationIds?.[0];
            const loc2 = item2.relatedLocationIds?.[0];

            if (loc1 && loc2 && loc1 !== loc2) {
              conflicts.push({
                item1,
                item2,
                conflict: `同一时间同一人物出现在不同地点 (${loc1} vs ${loc2})`,
              });
            }
          }
        }
      }

      return conflicts;
    } finally {
      await session.close();
    }
  }

  /**
   * 按世界观 ID 查找时间线
   */
  async findByWorldSetting(worldSettingId: string): Promise<Timeline[]> {
    const cypher = `
      MATCH (t:Timeline {worldSettingId: $worldSettingId})
      RETURN t ORDER BY t.name
    `;

    return await this.runQuery<Timeline>(cypher, { worldSettingId });
  }
}
