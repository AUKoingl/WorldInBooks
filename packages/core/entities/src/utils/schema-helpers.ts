import { z } from 'zod';

/**
 * Schema 工具函数 - 用于从 Zod Schema 生成数据库操作所需的数据
 */

/**
 * 从 Zod Schema 获取字段名
 * @param schema - Zod 对象 schema
 * @returns 字段名数组
 */
export function getSchemaFields<T extends z.ZodObject<z.ZodRawShape>>(schema: T): string[] {
  return Object.keys(schema.shape);
}

/**
 * 从 Zod Schema 获取 JSON 字段（对象、数组等需要序列化的字段）
 * 注意：这是一个简化的实现，完整实现需要访问 Zod 内部类型
 * @param schema - Zod 对象 schema
 * @returns JSON 字段名数组
 */
export function getJsonFields<T extends z.ZodObject<z.ZodRawShape>>(schema: T): string[] {
  const shape = schema.shape;
  const jsonFields: string[] = [];

  for (const [key, value] of Object.entries(shape)) {
    const def = (value as z.ZodType)._def as z.ZodTypeDef & {
      typeName?: string;
      innerType?: z.ZodType;
    };

    // 检查是否为数组、对象或记录类型
    if (
      def.typeName === 'ZodArray' ||
      def.typeName === 'ZodObject' ||
      def.typeName === 'ZodRecord' ||
      def.typeName === 'ZodTuple' ||
      def.typeName === 'ZodSet'
    ) {
      jsonFields.push(key);
    }
    // 检查是否为可选的数组/对象
    if (def.typeName === 'ZodOptional' && def.innerType) {
      const innerDef = (def.innerType._def as z.ZodTypeDef & { typeName?: string });
      if (innerDef.typeName && ['ZodArray', 'ZodObject', 'ZodRecord'].includes(innerDef.typeName)) {
        jsonFields.push(key);
      }
    }
  }

  return jsonFields;
}

/**
 * 将实体数据转换为数据库插入格式
 * @param data - 实体数据
 * @param jsonFields - 需要 JSON 序列化的字段
 * @returns 数据库记录
 */
export function toDbRecord<T extends Record<string, unknown>>(
  data: T,
  jsonFields: string[]
): Record<string, unknown> {
  const record: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    record[key] = jsonFields.includes(key) ? JSON.stringify(value) : value;
  }

  return record;
}

/**
 * 将数据库记录转换为实体数据
 * @param row - 数据库记录
 * @param jsonFields - 需要 JSON 反序列化的字段
 * @returns 实体数据
 */
export function toEntity<T extends Record<string, unknown>>(
  row: Record<string, unknown>,
  jsonFields: string[]
): T {
  const entity: Record<string, unknown> = { ...row };

  for (const field of jsonFields) {
    if (field in entity && typeof entity[field] === 'string') {
      entity[field] = JSON.parse(entity[field] as string);
    }
  }

  // 转换时间字段
  if ('created_at' in entity && typeof entity.created_at === 'string') {
    entity.createdAt = new Date(entity.created_at as string);
    delete entity.created_at;
  }

  if ('updated_at' in entity && typeof entity.updated_at === 'string') {
    entity.updatedAt = new Date(entity.updated_at as string);
    delete entity.updated_at;
  }

  return entity as T;
}

/**
 * 将 camelCase 字段名转换为 snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * 将 snake_case 字段名转换为 camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * 将对象的字段名从 camelCase 转换为 snake_case
 */
export function objectToSnakeCase<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    result[camelToSnake(key)] = value;
  }

  return result;
}

/**
 * 将对象的字段名从 snake_case 转换为 camelCase
 */
export function objectToCamelCase<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    result[snakeToCamel(key)] = value;
  }

  return result;
}
