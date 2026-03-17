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
