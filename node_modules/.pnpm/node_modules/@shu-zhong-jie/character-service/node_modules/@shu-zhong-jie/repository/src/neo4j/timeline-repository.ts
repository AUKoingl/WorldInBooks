import { Driver } from 'neo4j-driver';
import { Timeline, TimelineSchema } from '@shu-zhong-jie/entities';
import { BaseNeo4jRepository, Neo4jLabelConfig } from './base-neo4j-repository';

// JSON 字段配置
const JSON_FIELDS = new Set(['items']);

export class Neo4jTimelineRepository extends BaseNeo4jRepository<Timeline, Omit<Timeline, 'id' | 'createdAt' | 'updatedAt'>> {
  protected readonly config: Neo4jLabelConfig = {
    label: 'Timeline',
    jsonFields: JSON_FIELDS,
    orderBy: 'name',
  };

  constructor(driver: Driver) {
    super(driver);
  }

  /**
   * 查找时间线项关联的实体
   */
  async findRelatedEntities(timelineId: string): Promise<{
    events: any[];
    characters: any[];
    locations: any[];
  }> {
    return this.runInReadSession(async (session) => {
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

      for (const item of items) {
        if (item.relatedEventIds) eventIds.push(...item.relatedEventIds);
        if (item.relatedCharacterIds) characterIds.push(...item.relatedCharacterIds);
        if (item.relatedLocationIds) locationIds.push(...item.relatedLocationIds);
      }

      const [events, characters, locations] = await Promise.all([
        eventIds.length > 0
          ? session.run(`MATCH (e:Event) WHERE e.id IN $ids RETURN e`, { ids: eventIds })
          : Promise.resolve({ records: [] }),
        characterIds.length > 0
          ? session.run(`MATCH (c:Character) WHERE c.id IN $ids RETURN c`, { ids: characterIds })
          : Promise.resolve({ records: [] }),
        locationIds.length > 0
          ? session.run(`MATCH (l:Location) WHERE l.id IN $ids RETURN l`, { ids: locationIds })
          : Promise.resolve({ records: [] }),
      ]);

      return {
        events: events.records.map(r => this.nodeToEntity(r.get('e'))),
        characters: characters.records.map(r => this.nodeToEntity(r.get('c'))),
        locations: locations.records.map(r => this.nodeToEntity(r.get('l'))),
      };
    });
  }

  /**
   * 检测时间线冲突（同一实体在不同位置）
   */
  async detectConflicts(timelineId: string): Promise<{
    item1: any;
    item2: any;
    conflict: string;
  }[]> {
    return this.runInReadSession(async (session) => {
      const result = await session.run(`
        MATCH (t:Timeline {id: $id})
        RETURN t.items as items
      `, { id: timelineId });

      if (result.records.length === 0) return [];

      const items = JSON.parse(result.records[0].get('items') as string);
      const conflicts: any[] = [];

      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const item1 = items[i];
          const item2 = items[j];

          const timeOverlap =
            item1.startTime <= item2.endTime &&
            item2.startTime <= item1.endTime;

          if (!timeOverlap) continue;

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
    });
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
