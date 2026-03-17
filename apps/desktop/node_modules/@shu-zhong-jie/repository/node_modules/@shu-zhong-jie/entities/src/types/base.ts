import { z } from 'zod';

/**
 * 基础实体 ID 类型
 */
export type EntityId = string;

/**
 * 生成 UUID
 */
export function generateId(): EntityId {
  return crypto.randomUUID();
}

/**
 * 审计字段 - 记录创建和修改时间
 */
export interface AuditFields {
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * 审计字段 Schema
 */
export const AuditFieldsSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

/**
 * 基础实体类型
 */
export interface BaseEntity extends AuditFields {
  id: EntityId;
  name: string;
  description?: string;
}

/**
 * 基础实体 Schema
 */
export const BaseEntitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  ...AuditFieldsSchema.shape,
});
