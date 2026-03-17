import { Driver } from 'neo4j-driver';
import { WorldSetting, WorldSettingSchema } from '@shu-zhong-jie/entities';
import { BaseNeo4jRepository, Neo4jLabelConfig } from './base-neo4j-repository';

// JSON 字段配置
const JSON_FIELDS = new Set([
  'ruleSystems',
  'factions',
  'timeline',
  'locationIds',
  'tags',
]);

export class Neo4jWorldSettingRepository extends BaseNeo4jRepository<WorldSetting, Omit<WorldSetting, 'id' | 'createdAt' | 'updatedAt'>> {
  protected readonly config: Neo4jLabelConfig = {
    label: 'WorldSetting',
    jsonFields: JSON_FIELDS,
    orderBy: 'name',
  };

  constructor(driver: Driver) {
    super(driver);
  }

  /**
   * 查找世界观关联的地点
   */
  async findAssociatedLocations(worldSettingId: string): Promise<any[]> {
    const cypher = `
      MATCH (w:WorldSetting {id: $id})<-[:PART_OF_WORLD]-(l:Location)
      RETURN l ORDER BY l.name
    `;
    return await this.runQuery(cypher, { id: worldSettingId });
  }

  /**
   * 查找势力关系网络
   */
  async findFactionRelationships(worldSettingId: string): Promise<{
    faction1: any;
    relationship: string;
    faction2: any;
  }[]> {
    return this.runInReadSession(async (session) => {
      const result = await session.run(`
        MATCH (w:WorldSetting {id: $id})
        RETURN w.factions as factions
      `, { id: worldSettingId });

      if (result.records.length === 0) return [];

      const factions = JSON.parse(result.records[0].get('factions') as string);
      const relationships: any[] = [];

      for (let i = 0; i < factions.length; i++) {
        for (let j = i + 1; j < factions.length; j++) {
          const f1 = factions[i];
          const f2 = factions[j];

          if (f1.allies?.includes(f2.name) || f2.allies?.includes(f1.name)) {
            relationships.push({ faction1: f1, relationship: 'allied', faction2: f2 });
          }

          if (f1.enemies?.includes(f2.name) || f2.enemies?.includes(f1.name)) {
            relationships.push({ faction1: f1, relationship: 'hostile', faction2: f2 });
          }
        }
      }

      return relationships;
    });
  }

  /**
   * 查找包含特定规则体系的世界观
   */
  async findByRuleType(ruleType: string): Promise<WorldSetting[]> {
    const cypher = `
      MATCH (w:WorldSetting)
      WHERE w.ruleSystems CONTAINS $ruleType
      RETURN w ORDER BY w.name
    `;
    return await this.runQuery<WorldSetting>(cypher, { ruleType });
  }

  /**
   * 搜索世界观（按名称模糊匹配）
   */
  async searchByName(nameQuery: string): Promise<WorldSetting[]> {
    const cypher = `
      MATCH (w:WorldSetting)
      WHERE w.name CONTAINS $nameQuery
      RETURN w ORDER BY w.name
    `;
    return await this.runQuery<WorldSetting>(cypher, { nameQuery });
  }
}
