import { z } from 'zod';
import { BaseEntity, BaseEntitySchema, EntityId } from './base';

/**
 * 地点类型
 */
export type LocationType =
  | 'city'       // 城市
  | 'building'   // 建筑
  | 'room'       // 房间
  | 'wilderness' // 野外
  | 'dungeon'    // 副本/迷宫
  | 'realm'      // 领域/位面
  | 'other';     // 其他

/**
 * 地点氛围标签
 */
export type LocationAtmosphere =
  | 'peaceful'   // 宁静
  | 'tense'      // 紧张
  | 'mysterious' // 神秘
  | 'dangerous'  // 危险
  | 'sacred'     // 神圣
  | 'cursed'     // 被诅咒
  | 'lively'     // 热闹
  | 'desolate';  // 荒凉

/**
 * 地点实体
 */
export interface Location extends BaseEntity {
  type: 'location';
  locationType: LocationType;
  atmosphere: LocationAtmosphere[];
  parentLocationId?: EntityId; // 父地点（如：房间->建筑->城市）
  childLocationIds: EntityId[];
  worldSettingIds: EntityId[]; // 所属世界观
  eventIds: EntityId[]; // 发生在此地的事件
  characterIds: EntityId[]; // 相关人物
  coordinates?: {
    x?: number;
    y?: number;
    description?: string;
  };
  physicalDescription?: string;
  history?: string;
  tags: string[];
}

export const LocationSchema = BaseEntitySchema.extend({
  type: z.literal('location'),
  locationType: z.enum(['city', 'building', 'room', 'wilderness', 'dungeon', 'realm', 'other']),
  atmosphere: z.array(z.enum(['peaceful', 'tense', 'mysterious', 'dangerous', 'sacred', 'cursed', 'lively', 'desolate'])),
  parentLocationId: z.string().uuid().optional(),
  childLocationIds: z.array(z.string().uuid()),
  worldSettingIds: z.array(z.string().uuid()),
  eventIds: z.array(z.string().uuid()),
  characterIds: z.array(z.string().uuid()),
  coordinates: z.object({
    x: z.number().optional(),
    y: z.number().optional(),
    description: z.string().optional(),
  }).optional(),
  physicalDescription: z.string().optional(),
  history: z.string().optional(),
  tags: z.array(z.string()),
});
