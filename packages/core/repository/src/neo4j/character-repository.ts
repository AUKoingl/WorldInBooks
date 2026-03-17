import { Driver } from 'neo4j-driver';
import { generateId, Character, CharacterAppearance, CharacterPersonality, CharacterAbility } from '@shu-zhong-jie/entities';
import { BaseNeo4jRepository } from './base-neo4j-repository';

/**
 * Neo4j 人物仓储 - 用于图关系查询
 */
export class Neo4jCharacterRepository extends BaseNeo4jRepository {
  constructor(driver: Driver) {
    super(driver);
  }

  async create(entity: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>): Promise<Character> {
    const now = new Date().toISOString();
    const id = generateId();

    const cypher = `
      CREATE (c:Character {
        id: $id,
        name: $name,
        description: $description,
        type: $type,
        appearance: $appearance,
        personality: $personality,
        abilities: $abilities,
        background: $background,
        tags: $tags,
        createdAt: $createdAt,
        updatedAt: $updatedAt
      })
      RETURN c
    `;

    const params = {
      id,
      name: entity.name,
      description: entity.description,
      type: 'character',
      appearance: JSON.stringify(entity.appearance),
      personality: JSON.stringify(entity.personality),
      abilities: JSON.stringify(entity.abilities),
      background: entity.background || '',
      tags: JSON.stringify(entity.tags),
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.runWriteQuery<any>(cypher, params);
    return this.nodeToEntity<Character>(result);
  }

  async findById(id: string): Promise<Character | null> {
    const cypher = `
      MATCH (c:Character {id: $id})
      RETURN c
    `;

    const result = await this.runQuery<Character>(cypher, { id });
    return result[0] || null;
  }

  async findAll(): Promise<Character[]> {
    const cypher = `
      MATCH (c:Character)
      RETURN c ORDER BY c.name
    `;

    return await this.runQuery<Character>(cypher);
  }

  async update(id: string, entity: Partial<Character>): Promise<Character | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const setClauses: string[] = [];
    const params: Record<string, unknown> = { id };

    const updatableFields = ['name', 'description', 'appearance', 'personality', 'abilities', 'background', 'tags'];

    for (const field of updatableFields) {
      if (entity[field as keyof Character] !== undefined) {
        const value = entity[field as keyof Character];
        const jsonFields = ['appearance', 'personality', 'abilities', 'tags'];
        if (jsonFields.includes(field)) {
          setClauses.push(`c.${field} = ${JSON.stringify(value)}`);
        } else {
          setClauses.push(`c.${field} = $${field}`);
          params[field] = value;
        }
      }
    }

    setClauses.push('c.updatedAt = $updatedAt');
    params.updatedAt = new Date().toISOString();

    const cypher = `
      MATCH (c:Character {id: $id})
      SET ${setClauses.join(', ')}
      RETURN c
    `;

    const result = await this.runWriteQuery<any>(cypher, params);
    return this.nodeToEntity<Character>(result);
  }

  async delete(id: string): Promise<boolean> {
    const cypher = `
      MATCH (c:Character {id: $id})
      DETACH DELETE c
    `;

    await this.runWriteQuery(cypher, { id });
    return true;
  }

  async createMany(entities: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Character[]> {
    const results: Character[] = [];
    for (const entity of entities) {
      results.push(await this.create(entity));
    }
    return results;
  }

  /**
   * 查找人物的关系网络
   */
  async findRelationships(characterId: string): Promise<{
    source: Character;
    relationship: any;
    target: Character;
  }[]> {
    const cypher = `
      MATCH (c:Character {id: $id})-[r]-(other:Character)
      RETURN c, r, other
    `;

    const session = this.getSession();
    try {
      const result = await session.run(cypher, { id: characterId });
      return result.records.map(record => ({
        source: this.nodeToEntity<Character>(record.get('c')),
        relationship: record.get('r')?.properties || {},
        target: this.nodeToEntity<Character>(record.get('other')),
      }));
    } finally {
      await session.close();
    }
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
