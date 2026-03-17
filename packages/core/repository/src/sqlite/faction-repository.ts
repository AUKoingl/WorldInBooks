import { Faction } from '@shu-zhong-jie/entities';
import { BaseSQLiteRepository, FieldMapping, BaseRepositoryConfig } from './base-sqlite-repository';

/**
 * 势力数据库行类型
 */
interface FactionDbRow {
  id: string;
  name: string;
  description: string;
  type: string;
  faction_type: string;
  scale: string;
  alignment: string;
  motto: string;
  headquarters: string;
  parent_faction_id: string;
  child_faction_ids: string;
  member_ids: string;
  enemy_faction_ids: string;
  ally_faction_ids: string;
  ranks: string;
  influence_level: number;
  wealth_level: number;
  military_level: number;
  rules: string;
  history: string;
  tags: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

/**
 * SQLite 势力仓储配置
 */
const config: BaseRepositoryConfig<'faction'> = {
  typeLiteral: 'faction',
  orderBy: 'name',
};

/**
 * SQLite 势力仓储
 */
export class SQLiteFactionRepository extends BaseSQLiteRepository<Faction, Omit<Faction, 'id' | 'createdAt' | 'updatedAt'>, FactionDbRow, 'faction'> {
  protected readonly tableName = 'factions';
  protected readonly fieldMapping: FieldMapping = {
    camelToSnake: {
      id: 'id',
      name: 'name',
      description: 'description',
      type: 'type',
      factionType: 'faction_type',
      scale: 'scale',
      alignment: 'alignment',
      motto: 'motto',
      headquarters: 'headquarters',
      parentFactionId: 'parent_faction_id',
      childFactionIds: 'child_faction_ids',
      memberIds: 'member_ids',
      enemyFactionIds: 'enemy_faction_ids',
      allyFactionIds: 'ally_faction_ids',
      ranks: 'ranks',
      influenceLevel: 'influence_level',
      wealthLevel: 'wealth_level',
      militaryLevel: 'military_level',
      rules: 'rules',
      history: 'history',
      tags: 'tags',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    jsonFieldsSet: new Set([
      'child_faction_ids',
      'member_ids',
      'enemy_faction_ids',
      'ally_faction_ids',
      'ranks',
      'rules',
      'tags',
    ]),
  };
  protected readonly config = config;
}
