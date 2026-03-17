import { Driver } from 'neo4j-driver';
import { Relationship, RelationshipSchema } from '@shu-zhong-jie/entities';
import { BaseNeo4jRepository, Neo4jLabelConfig } from './base-neo4j-repository';

// JSON 字段配置
const JSON_FIELDS = new Set(['tags']);

export class Neo4jRelationshipRepository extends BaseNeo4jRepository<Relationship, Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'>> {
  protected readonly config: Neo4jLabelConfig = {
    label: 'Relationship',
    jsonFields: JSON_FIELDS,
    orderBy: 'createdAt DESC',
  };

  constructor(driver: Driver) {
    super(driver);
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
    return this.runInReadSession(async (session) => {
      const result = await session.run(`
        MATCH (start {id: $sourceId})
        WHERE start:Character OR start:Event OR start:Location
        MATCH (end {id: $targetId})
        WHERE end:Character OR end:Event OR end:Location
        MATCH path = shortestPath((start)-[*..10]-(end))
        RETURN path
      `, { sourceId, targetId });

      return result.records.map(record => {
        const path = record.get('path');
        return {
          nodes: path.nodes.map((n: any) => this.nodeToEntity(n)),
          relationships: path.relationships.map((r: any) => this.nodeToEntity(r)),
        };
      });
    });
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
    return this.runInReadSession(async (session) => {
      let cypher: string;
      const params: Record<string, any> = { depth, centerId: centerEntityId };

      if (centerEntityType && centerEntityId) {
        // 有中心实体：查找从中心出发的深度路径
        cypher = `
          MATCH (center {id: $centerId})
          WHERE center:Character OR center:Event OR center:Location
          MATCH path = (center)-[*1..$depth]-(related)
          WITH collect(DISTINCT nodes(path)) as allNodes, collect(DISTINCT relationships(path)) as allRels
          UNWIND allNodes as nodes
          UNWIND nodes as n
          WITH DISTINCT n, allRels
          UNWIND allRels as rels
          UNWIND rels as r
          RETURN collect(DISTINCT n) as nodes, collect(DISTINCT r) as edges
        `;
      } else {
        // 无中心实体：限制返回节点总数
        cypher = `
          MATCH (n)
          WITH n LIMIT 50
          OPTIONAL MATCH (n)-[r]-(m)
          WITH collect(DISTINCT n) + collect(DISTINCT m) as allNodes, collect(DISTINCT r) as allRels
          UNWIND allNodes as n
          WITH DISTINCT n, allRels
          UNWIND allRels as r
          RETURN collect(DISTINCT n) as nodes, collect(DISTINCT r) as edges
        `;
      }

      const result = await session.run(cypher, params);
      const nodes = new Map<string, any>();
      const edges = new Map<string, any>();

      if (result.records.length > 0) {
        const record = result.records[0];
        const nodeRecords = record.get('nodes') || [];
        const edgeRecords = record.get('edges') || [];

        for (const n of nodeRecords) {
          if (n && !nodes.has(n.properties.id)) {
            nodes.set(n.properties.id, this.nodeToEntity(n));
          }
        }

        for (const rel of edgeRecords) {
          if (rel) {
            const sourceId = rel.start?.properties?.id;
            const targetId = rel.end?.properties?.id;
            const edgeKey = `${sourceId}-${targetId}-${rel.properties.id}`;
            if (!edges.has(edgeKey)) {
              edges.set(edgeKey, {
                source: sourceId,
                target: targetId,
                ...this.nodeToEntity(rel),
              });
            }
          }
        }
      }

      return {
        nodes: Array.from(nodes.values()),
        edges: Array.from(edges.values()),
      };
    });
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
