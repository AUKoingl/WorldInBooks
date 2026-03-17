import { z } from '@shu-zhong-jie/entities';
import type { IRepository } from './types';

/**
 * 基础仓储类 - 实现通用的 CRUD 操作
 */
export abstract class BaseRepository<T extends { id: string }> implements IRepository<T> {
  protected abstract tableName: string;

  /**
   * 创建新实体
   */
  abstract create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;

  /**
   * 根据 ID 查找实体
   */
  abstract findById(id: string): Promise<T | null>;

  /**
   * 查找所有实体
   */
  abstract findAll(): Promise<T[]>;

  /**
   * 更新实体
   */
  abstract update(id: string, entity: Partial<T>): Promise<T | null>;

  /**
   * 删除实体
   */
  abstract delete(id: string): Promise<boolean>;

  /**
   * 批量创建
   */
  abstract createMany(entities: Omit<T, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<T[]>;
}
