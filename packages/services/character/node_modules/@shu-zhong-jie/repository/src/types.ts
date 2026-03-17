import { z } from '@shu-zhong-jie/entities';

/**
 * 仓储接口 - 定义数据访问的基本操作
 */
export interface IRepository<T extends { id: string }> {
  /**
   * 创建新实体
   */
  create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;

  /**
   * 根据 ID 查找实体
   */
  findById(id: string): Promise<T | null>;

  /**
   * 查找所有实体
   */
  findAll(): Promise<T[]>;

  /**
   * 更新实体
   */
  update(id: string, entity: Partial<T>): Promise<T | null>;

  /**
   * 删除实体
   */
  delete(id: string): Promise<boolean>;

  /**
   * 批量创建
   */
  createMany(entities: Omit<T, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<T[]>;
}

/**
 * 仓储工厂接口
 */
export interface IRepositoryFactory {
  getCharacterRepository(): CharacterRepository;
  getEventRepository(): EventRepository;
  getLocationRepository(): LocationRepository;
  getFactionRepository(): FactionRepository;
  getWorldSettingRepository(): WorldSettingRepository;
  getTimelineRepository(): TimelineRepository;
  getRelationshipRepository(): RelationshipRepository;
}

// 导入实体类型（用于类型检查）
import type {
  Character,
  Event,
  Location,
  Faction,
  WorldSetting,
  Timeline,
  Relationship,
} from '@shu-zhong-jie/entities';

/**
 * 特定类型的仓储接口
 */
export type CharacterRepository = IRepository<Character>;
export type EventRepository = IRepository<Event>;
export type LocationRepository = IRepository<Location>;
export type FactionRepository = IRepository<Faction>;
export type WorldSettingRepository = IRepository<WorldSetting>;
export type TimelineRepository = IRepository<Timeline>;
export type RelationshipRepository = IRepository<Relationship>;
