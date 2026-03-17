import { Driver } from 'neo4j-driver';
import { generateId, WorldSetting } from '@shu-zhong-jie/entities';
import { BaseNeo4jRepository } from './base-neo4j-repository';

/**
 * Neo4j 世界观仓储 - 用于图关系查询（规则体系、势力关系）
 */
export class Neo4jWorldSettingRepository extends BaseNeo4jRepository {
  constructor(driver: Driver) {
    super(driver);
  }

  async create(entity: Omit<WorldSetting, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorldSetting> {
    const now = new Date().toISOString();
    const id = generateId();

    const cypher = `
      CREATE (w:WorldSetting {
        id: $id,
        name: $name,
        description: $description,
        type: $type,
        overview: $overview,
        timePeriod: $timePeriod,
        ruleSystems: $ruleSystems,
        factions: $factions,
        timeline: $timeline,
        locationIds: $locationIds,
        tags: $tags,
        createdAt: $createdAt,
        updatedAt: $updatedAt
      })
      RETURN w
    `;

    const params = {
      id,
      name: entity.name,
      description: entity.description || '',
      type: 'world-setting',
      overview: entity.overview,
      timePeriod: entity.timePeriod || '',
      ruleSystems: JSON.stringify(entity.ruleSystems),
      factions: JSON.stringify(entity.factions),
      timeline: JSON.stringify(entity.timeline),
      locationIds: JSON.stringify(entity.locationIds),
      tags: JSON.stringify(entity.tags),
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.runWriteQuery<any>(cypher, params);
    return this.nodeToEntity<WorldSetting>(result);
  }

  async findById(id: string): Promise<WorldSetting | null> {
    const cypher = `
      MATCH (w:WorldSetting {id: $id})
      RETURN w
    `;

    const result = await this.runQuery<WorldSetting>(cypher, { id });
    return result[0] || null;
  }

  async findAll(): Promise<WorldSetting[]> {
    const cypher = `
      MATCH (w:WorldSetting)
      RETURN w ORDER BY w.name
    `;

    return await this.runQuery<WorldSetting>(cypher);
  }

  async update(id: string, entity: Partial<WorldSetting>): Promise<WorldSetting | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const setClauses: string[] = [];
    const params: Record<string, unknown> = { id };

    const updatableFields = [
      'name', 'description', 'overview', 'timePeriod',
      'ruleSystems', 'factions', 'timeline',
      'locationIds', 'tags'
    ];

    for (const field of updatableFields) {
      if (entity[field as keyof WorldSetting] !== undefined) {
        const value = entity[field as keyof WorldSetting];
        const jsonFields = ['ruleSystems', 'factions', 'timeline', 'locationIds', 'tags'];
        if (jsonFields.includes(field)) {
          setClauses.push(`w.${field} = ${JSON.stringify(value)}`);
        } else if (value !== null) {
          setClauses.push(`w.${field} = $${field}`);
          params[field] = value;
        } else {
          setClauses.push(`w.${field} = ''`);
        }
      }
    }

    setClauses.push('w.updatedAt = $updatedAt');
    params.updatedAt = new Date().toISOString();

    const cypher = `
      MATCH (w:WorldSetting {id: $id})
      SET ${setClauses.join(', ')}
      RETURN w
    `;

    const result = await this.runWriteQuery<any>(cypher, params);
    return this.nodeToEntity<WorldSetting>(result);
  }

  async delete(id: string): Promise<boolean> {
    const cypher = `
      MATCH (w:WorldSetting {id: $id})
      DETACH DELETE w
    `;

    await this.runWriteQuery(cypher, { id });
    return true;
  }

  async createMany(entities: Omit<WorldSetting, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<WorldSetting[]> {
    const results: WorldSetting[] = [];
    for (const entity of entities) {
      results.push(await this.create(entity));
    }
    return results;
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
    const session = this.getWriteSession();
    try {
      // 首先获取世界观的势力数据
      const result = await session.run(`
        MATCH (w:WorldSetting {id: $id})
        RETURN w.factions as factions
      `, { id: worldSettingId });

      if (result.records.length === 0) return [];

      const factions = JSON.parse(result.records[0].get('factions') as string);
      const relationships: any[] = [];

      // 分析势力间的关系
      for (let i = 0; i < factions.length; i++) {
        for (let j = i + 1; j < factions.length; j++) {
          const f1 = factions[i];
          const f2 = factions[j];

          // 检查是否有同盟关系
          if (f1.allies?.includes(f2.name) || f2.allies?.includes(f1.name)) {
            relationships.push({
              faction1: f1,
              relationship: 'allied',
              faction2: f2,
            });
          }

          // 检查是否有敌对关系
          if (f1.enemies?.includes(f2.name) || f2.enemies?.includes(f1.name)) {
            relationships.push({
              faction1: f1,
              relationship: 'hostile',
              faction2: f2,
            });
          }
        }
      }

      return relationships;
    } finally {
      await session.close();
    }
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
