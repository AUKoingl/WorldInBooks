import { Driver } from 'neo4j-driver';
import { BaseNeo4jRepository, Neo4jLabelConfig } from './base-neo4j-repository';
import type { Faction } from '@shu-zhong-jie/entities';

/**
 * Neo4j 势力仓储 - 用于管理 Faction 实体的图数据库操作
 */
export class Neo4jFactionRepository extends BaseNeo4jRepository<Faction, Omit<Faction, 'id' | 'createdAt' | 'updatedAt'>> {
  protected readonly config: Neo4jLabelConfig = {
    label: 'Faction',
    jsonFields: new Set(['childFactionIds', 'memberIds', 'enemyFactionIds', 'allyFactionIds', 'ranks', 'rules', 'tags']),
    orderBy: 'name',
  };

  constructor(driver: Driver) {
    super(driver);
  }
}
