import { Driver } from 'neo4j-driver';
import { generateId, Relationship } from '@shu-zhong-jie/entities';
import { BaseNeo4jRepository } from './base-neo4j-repository';

/**
 * Neo4j 关系仓储 - 用于图关系查询（核心关系图谱）
 */
export class Neo4jRelationshipRepository extends BaseNeo4jRepository {
  constructor(driver: Driver) {
    super(driver);
  }

  async create(entity: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'>): Promise<Relationship> {
    const now = new Date().toISOString();
    const id = generateId();

    const cypher = `
      CREATE (r:Relationship {
        id: $id,
        name: $name,
        description: $description,
        type: $type,
        sourceType: $sourceType,
        sourceId: $sourceId,
        targetType: $targetType,
        targetId: $targetId,
        relationshipType: $relationshipType,
        direction: $direction,
        strength: $strength,
        establishedAt: $establishedAt,
        tags: $tags,
        createdAt: $createdAt,
        updatedAt: $updatedAt
      })
      RETURN r
    `;

    const params = {
      id,
      name: entity.name,
      description: entity.description || '',
      type: 'relationship',
      sourceType: entity.sourceType,
      sourceId: entity.sourceId,
      targetType: entity.targetType,
      targetId: entity.targetId,
      relationshipType: entity.relationshipType,
      direction: entity.direction,
      strength: entity.strength,
      establishedAt: entity.establishedAt || null,
      tags: JSON.stringify(entity.tags),
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.runWriteQuery<any>(cypher, params);
    return this.nodeToEntity<Relationship>(result);
  }

  async findById(id: string): Promise<Relationship | null> {
    const cypher = `
      MATCH (r:Relationship {id: $id})
      RETURN r
    `;

    const result = await this.runQuery<Relationship>(cypher, { id });
    return result[0] || null;
  }

  async findAll(): Promise<Relationship[]> {
    const cypher = `
      MATCH (r:Relationship)
      RETURN r ORDER BY r.createdAt DESC
    `;

    return await this.runQuery<Relationship>(cypher);
  }

  async update(id: string, entity: Partial<Relationship>): Promise<Relationship | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const setClauses: string[] = [];
    const params: Record<string, unknown> = { id };

    const updatableFields = [
      'name', 'description', 'relationshipType',
      'direction', 'strength', 'establishedAt', 'tags'
    ];

    for (const field of updatableFields) {
      if (entity[field as keyof Relationship] !== undefined) {
        const value = entity[field as keyof Relationship];
        if (field === 'tags') {
          setClauses.push(`r.${field} = ${JSON.stringify(value)}`);
        } else if (value !== null) {
          setClauses.push(`r.${field} = $${field}`);
          params[field] = value;
        } else {
          setClauses.push(`r.${field} = null`);
        }
      }
    }

    setClauses.push('r.updatedAt = $updatedAt');
    params.updatedAt = new Date().toISOString();

    const cypher = `
      MATCH (r:Relationship {id: $id})
      SET ${setClauses.join(', ')}
      RETURN r
    `;

    const result = await this.runWriteQuery<any>(cypher, params);
    return this.nodeToEntity<Relationship>(result);
  }

  async delete(id: string): Promise<boolean> {
    const cypher = `
      MATCH (r:Relationship {id: $id})
      DETACH DELETE r
    `;

    await this.runWriteQuery(cypher, { id });
    return true;
  }

  async createMany(entities: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Relationship[]> {
    const results: Relationship[] = [];
    for (const entity of entities) {
      results.push(await this.create(entity));
    }
    return results;
  }

  /**
   * 查找实体的所有关系
   */
  async findByEntity(entityType: 'character' | 'event' | 'location', entityId: string): Promise<Relationship[]> {
    const cypher = `
      MATCH (r:Relationship)
      WHERE (r.sourceType = $type AND r.sourceId = $id)
         OR (r.targetType = $type AND r.targetId = $id)
      RETURN r ORDER BY r.createdAt DESC
    `;

    return await this.runQuery<Relationship>(cypher, { type: entityType, id: entityId });
  }

  /**
   * 查找两个实体之间的路径
   */
  async findPath(
    sourceType: string,
    sourceId: string,
    targetType: string,
    targetId: string
  ): Promise<{
    nodes: any[];
    relationships: any[];
  }[]> {
    const session = this.getSession();
    try {
      const result = await session.run(`
        MATCH (start {id: $sourceId, sourceType: $sourceType})
        MATCH (end {id: $targetId, targetType: $targetType})
        MATCH path = shortestPath((start)-[*..10]-(end))
        RETURN path
      `, { sourceId, sourceType, targetId, targetType });

      return result.records.map(record => {
        const path = record.get('path');
        return {
          nodes: path.nodes.map((n: any) => this.nodeToEntity(n)),
          relationships: path.relationships.map((r: any) => this.nodeToEntity(r)),
        };
      });
    } finally {
      await session.close();
    }
  }

  /**
   * 计算实体的影响力（基于关系数量和强度）
   */
  async calculateInfluence(entityType: string, entityId: string): Promise<number> {
    const cypher = `
      MATCH (r:Relationship)
      WHERE (r.sourceType = $type AND r.sourceId = $id)
         OR (r.targetType = $type AND r.targetId = $id)
      RETURN sum(r.strength) as influence
    `;

    const result = await this.runQuery<{ influence: number }>(cypher, { type: entityType, id: entityId });
    return result[0]?.influence || 0;
  }

  /**
   * 查找关系图谱（用于可视化）
   */
  async findGraph(
    centerEntityType?: string,
    centerEntityId?: string,
    depth: number = 2
  ): Promise<{
    nodes: any[];
    edges: any[];
  }> {
    const session = this.getSession();
    try {
      let cypher: string;
      const params: Record<string, any> = { depth };

      if (centerEntityType && centerEntityId) {
        // 从中心节点展开
        cypher = `
          MATCH (center {id: $centerId, sourceType: $centerType})
          MATCH (center)-[r*1..$depth]-(related)
          RETURN center, r, related
        `;
        params.centerId = centerEntityId;
        params.centerType = centerEntityType;
      } else {
        // 返回整个图谱（限制数量）
        cypher = `
          MATCH (n)
          MATCH (n)-[r]-(m)
          RETURN n, r, m
          LIMIT 100
        `;
      }

      const result = await session.run(cypher, params);
      const nodes = new Map<string, any>();
      const edges: any[] = [];

      for (const record of result.records) {
        // 处理路径中的节点和关系
        const startNode = record.get('n') || record.get('center');
        const endNode = record.get('m') || record.get('related');
        const rel = record.get('r');

        if (startNode && !nodes.has(startNode.properties.id)) {
          nodes.set(startNode.properties.id, this.nodeToEntity(startNode));
        }
        if (endNode && !nodes.has(endNode.properties.id)) {
          nodes.set(endNode.properties.id, this.nodeToEntity(endNode));
        }
        if (rel) {
          edges.push({
            source: rel.start.properties.id,
            target: rel.end.properties.id,
            ...this.nodeToEntity(rel),
          });
        }
      }

      return {
        nodes: Array.from(nodes.values()),
        edges,
      };
    } finally {
      await session.close();
    }
  }

  /**
   * 按关系类型搜索
   */
  async findByRelationshipType(relationshipType: string): Promise<Relationship[]> {
    const cypher = `
      MATCH (r:Relationship {relationshipType: $relationshipType})
      RETURN r ORDER BY r.createdAt DESC
    `;

    return await this.runQuery<Relationship>(cypher, { relationshipType });
  }

  /**
   * 查找指定强度以上的关系
   */
  async findByMinStrength(minStrength: number): Promise<Relationship[]> {
    const cypher = `
      MATCH (r:Relationship)
      WHERE r.strength >= $minStrength
      RETURN r ORDER BY r.strength DESC
    `;

    return await this.runQuery<Relationship>(cypher, { minStrength });
  }
}
