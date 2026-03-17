# Plan 001: Monorepo 项目脚手架初始化

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建基于 pnpm + Turborepo 的 Monorepo 项目结构，为模块化开发奠定基础。

**Architecture:** 使用 pnpm workspace 管理多包依赖，Turborepo 处理构建管道。项目分为 apps/（应用入口）和 packages/（共享代码）两部分。

**Tech Stack:** pnpm, Turborepo, TypeScript, Tauri v2, React, TailwindCSS

---

### Chunk 1: 根项目配置

**Files:**
- Create: `shu-zhong-jie/package.json`
- Create: `shu-zhong-jie/pnpm-workspace.yaml`
- Create: `shu-zhong-jie/turbo.json`
- Create: `shu-zhong-jie/tsconfig.json`
- Create: `shu-zhong-jie/.gitignore`

- [ ] **Step 1: 创建根 package.json**

```json
{
  "name": "shu-zhong-jie",
  "version": "0.0.1",
  "description": "书中界 - 小说辅助创作平台",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.0"
  },
  "packageManager": "pnpm@8.15.0",
  "engines": {
    "node": ">=18.0.0"
  }
}
```

- [ ] **Step 2: 创建 pnpm-workspace.yaml**

```yaml
packages:
  - "apps/*"
  - "packages/core/*"
  - "packages/features/*"
  - "packages/services/*"
  - "packages/ui/*"
```

- [ ] **Step 3: 创建 turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**", "src-tauri/target/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

- [ ] **Step 4: 创建 tsconfig.json（根配置）**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "exclude": ["node_modules", "**/dist", "**/build", "**/src-tauri/target"]
}
```

- [ ] **Step 5: 创建 .gitignore**

```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
out/
**/src-tauri/target/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# IDE
.idea/
.vscode/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Env
.env
.env.local
.env.*.local

# Turbo
.turbo/

# Tauri
src-tauri/target/
src-tauri/icons/icon.icns
src-tauri/icons/icon.ico

# Test
coverage/
```

- [ ] **Step 6: 初始化 git 并提交**

```bash
cd shu-zhong-jie
git init
git add .
git commit -m "chore: initialize monorepo scaffold"
```

---

### Chunk 2: 核心层 - Entities 包

**Files:**
- Create: `packages/core/entities/package.json`
- Create: `packages/core/entities/tsconfig.json`
- Create: `packages/core/entities/src/index.ts`
- Create: `packages/core/entities/src/types/base.ts`
- Create: `packages/core/entities/src/types/character.ts`
- Create: `packages/core/entities/src/types/event.ts`
- Create: `packages/core/entities/src/types/location.ts`
- Create: `packages/core/entities/src/types/world.ts`
- Create: `packages/core/entities/src/types/timeline.ts`
- Create: `packages/core/entities/src/types/relationship.ts`

- [ ] **Step 1: 创建 Entities package.json**

```json
{
  "name": "@shu-zhong-jie/entities",
  "version": "0.0.1",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "clean": "rm -rf node_modules"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vitest": "^1.0.0",
    "zod": "^3.22.0"
  },
  "peerDependencies": {
    "zod": "^3.22.0"
  }
}
```

- [ ] **Step 2: 创建 Entities tsconfig.json**

```json
{
  "extends": "../../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

- [ ] **Step 3: 创建基础类型定义 src/types/base.ts**

```typescript
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
```

- [ ] **Step 4: 创建人物实体 src/types/character.ts**

```typescript
import { z } from 'zod';
import { BaseEntity, BaseEntitySchema, EntityId } from './base';

/**
 * 人物外貌特征
 */
export interface CharacterAppearance {
  age: number;
  height?: number;
  build?: string;
  eyeColor?: string;
  hairColor?: string;
  distinguishingFeatures?: string[];
}

export const CharacterAppearanceSchema = z.object({
  age: z.number().min(0).max(150),
  height: z.number().min(0).optional(),
  build: z.string().optional(),
  eyeColor: z.string().optional(),
  hairColor: z.string().optional(),
  distinguishingFeatures: z.array(z.string()).optional(),
});

/**
 * 人物性格特征
 */
export interface CharacterPersonality {
  traits: string[];
  mbti?: string;
  alignment?: string;
  likes?: string[];
  dislikes?: string[];
  fears?: string[];
  goals?: string[];
}

export const CharacterPersonalitySchema = z.object({
  traits: z.array(z.string()),
  mbti: z.string().optional(),
  alignment: z.string().optional(),
  likes: z.array(z.string()).optional(),
  dislikes: z.array(z.string()).optional(),
  fears: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
});

/**
 * 人物能力
 */
export interface CharacterAbility {
  name: string;
  description: string;
  level: number; // 1-100
  category?: string;
}

export const CharacterAbilitySchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  level: z.number().min(1).max(100),
  category: z.string().optional(),
});

/**
 * 人物实体
 */
export interface Character extends BaseEntity {
  type: 'character';
  appearance: CharacterAppearance;
  personality: CharacterPersonality;
  abilities: CharacterAbility[];
  background?: string;
  tags: string[];
}

/**
 * 人物 Schema
 */
export const CharacterSchema = BaseEntitySchema.extend({
  type: z.literal('character'),
  appearance: CharacterAppearanceSchema,
  personality: CharacterPersonalitySchema,
  abilities: z.array(CharacterAbilitySchema),
  background: z.string().optional(),
  tags: z.array(z.string()),
});
```

- [ ] **Step 5: 创建事件实体 src/types/event.ts**

```typescript
import { z } from 'zod';
import { BaseEntity, BaseEntitySchema, EntityId } from './base';

/**
 * 事件类型
 */
export type EventType =
  | 'plot'      // 主线情节
  | 'subplot'   // 支线情节
  | 'conflict'  // 冲突事件
  | 'turning'   // 转折点
  | 'revelation' // 揭示/发现
  | 'meeting'   // 会面
  | 'battle'    // 战斗
  | 'other';    // 其他

/**
 * 事件重要性
 */
export type EventImportance = 'low' | 'medium' | 'high' | 'critical';

/**
 * 事件实体
 */
export interface Event extends BaseEntity {
  type: 'event';
  eventType: EventType;
  importance: EventImportance;
  startTime?: string; // ISO 日期或相对时间
  endTime?: string;
  locationIds: EntityId[];
  characterIds: EntityId[];
  causeEventIds: EntityId[]; // 导致此事件的事件
  effectEventIds: EntityId[]; // 此事件导致的结果
  foreshadowingIds: EntityId[]; // 相关伏笔
  tags: string[];
  notes?: string;
}

export const EventSchema = BaseEntitySchema.extend({
  type: z.literal('event'),
  eventType: z.enum(['plot', 'subplot', 'conflict', 'turning', 'revelation', 'meeting', 'battle', 'other']),
  importance: z.enum(['low', 'medium', 'high', 'critical']),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  locationIds: z.array(z.string().uuid()),
  characterIds: z.array(z.string().uuid()),
  causeEventIds: z.array(z.string().uuid()),
  effectEventIds: z.array(z.string().uuid()),
  foreshadowingIds: z.array(z.string().uuid()),
  tags: z.array(z.string()),
  notes: z.string().optional(),
});
```

- [ ] **Step 6: 创建地点实体 src/types/location.ts**

```typescript
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
```

- [ ] **Step 7: 创建世界观实体 src/types/world.ts**

```typescript
import { z } from 'zod';
import { BaseEntity, BaseEntitySchema, EntityId } from './base';

/**
 * 规则类型
 */
export type RuleType = 'magic' | 'technology' | 'social' | 'physical' | 'metaphysical';

/**
 * 规则体系
 */
export interface RuleSystem {
  name: string;
  description: string;
  type: RuleType;
  rules: string[];
  exceptions?: string[];
}

export const RuleSystemSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  type: z.enum(['magic', 'technology', 'social', 'physical', 'metaphysical']),
  rules: z.array(z.string()),
  exceptions: z.array(z.string()).optional(),
});

/**
 * 势力/组织
 */
export interface Faction {
  name: string;
  description: string;
  type: string;
  goal?: string;
  allies?: EntityId[];
  enemies?: EntityId[];
  members?: EntityId[]; // Character IDs
  influenceLevel: number; // 1-100
}

export const FactionSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  type: z.string(),
  goal: z.string().optional(),
  allies: z.array(z.string().uuid()).optional(),
  enemies: z.array(z.string().uuid()).optional(),
  members: z.array(z.string().uuid()).optional(),
  influenceLevel: z.number().min(1).max(100),
});

/**
 * 世界观实体
 */
export interface WorldSetting extends BaseEntity {
  type: 'world-setting';
  overview: string;
  timePeriod?: string;
  ruleSystems: RuleSystem[];
  factions: Faction[];
  timeline: {
    era: string;
    year: number;
    description: string;
  }[];
  locationIds: EntityId[];
  tags: string[];
}

export const WorldSettingSchema = BaseEntitySchema.extend({
  type: z.literal('world-setting'),
  overview: z.string(),
  timePeriod: z.string().optional(),
  ruleSystems: z.array(RuleSystemSchema),
  factions: z.array(FactionSchema),
  timeline: z.array(z.object({
    era: z.string(),
    year: z.number(),
    description: z.string(),
  })),
  locationIds: z.array(z.string().uuid()),
  tags: z.array(z.string()),
});
```

- [ ] **Step 8: 创建时间线实体 src/types/timeline.ts**

```typescript
import { z } from 'zod';
import { BaseEntity, BaseEntitySchema, EntityId } from './base';

/**
 * 时间线项类型
 */
export type TimelineItemType =
  | 'event'       // 事件
  | 'character'   // 人物相关
  | 'world'       // 世界观/历史
  | 'milestone';  // 里程碑

/**
 * 时间线项
 */
export interface TimelineItem {
  id: EntityId;
  type: TimelineItemType;
  title: string;
  description: string;
  startTime: string; // ISO 日期或相对时间格式
  endTime?: string;
  relatedEventIds?: EntityId[];
  relatedCharacterIds?: EntityId[];
  relatedLocationIds?: EntityId[];
  isCanonical: boolean; // 是否为正史
  tags: string[];
}

export const TimelineItemSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['event', 'character', 'world', 'milestone']),
  title: z.string().min(1),
  description: z.string(),
  startTime: z.string(),
  endTime: z.string().optional(),
  relatedEventIds: z.array(z.string().uuid()).optional(),
  relatedCharacterIds: z.array(z.string().uuid()).optional(),
  relatedLocationIds: z.array(z.string().uuid()).optional(),
  isCanonical: z.boolean(),
  tags: z.array(z.string()),
});

/**
 * 时间线集合
 */
export interface Timeline extends BaseEntity {
  type: 'timeline';
  items: TimelineItem[];
  worldSettingId?: EntityId;
}

export const TimelineSchema = BaseEntitySchema.extend({
  type: z.literal('timeline'),
  items: z.array(TimelineItemSchema),
  worldSettingId: z.string().uuid().optional(),
});
```

- [ ] **Step 9: 创建关系实体 src/types/relationship.ts**

```typescript
import { z } from 'zod';
import { BaseEntity, BaseEntitySchema, EntityId } from './base';

/**
 * 关系类型
 */
export type RelationshipType =
  // 人物关系
  | 'family'      // 家人
  | 'friend'      // 朋友
  | 'enemy'       // 敌人
  | 'lover'       // 恋人
  | 'master'      // 师徒
  | 'colleague'   // 同事
  | 'rival'       // 对手
  // 人物与事件
  | 'participant' // 参与者
  | 'witness'     // 见证者
  | 'victim'      // 受害者
  | 'beneficiary' // 受益者
  // 人物与地点
  | 'resident'    // 居住
  | 'visitor'     // 访问
  | 'owner'       // 拥有
  // 事件与地点
  | 'occurred_at' // 发生于
  // 事件与事件
  | 'causes'      // 导致
  | 'precedes'    // 先于
  | 'correlates'; // 相关

/**
 * 关系方向
 */
export type RelationshipDirection = 'unidirectional' | 'bidirectional';

/**
 * 关系实体
 */
export interface Relationship extends BaseEntity {
  type: 'relationship';
  sourceType: 'character' | 'event' | 'location';
  sourceId: EntityId;
  targetType: 'character' | 'event' | 'location';
  targetId: EntityId;
  relationshipType: RelationshipType;
  direction: RelationshipDirection;
  strength: number; // 1-100
  description?: string;
  establishedAt?: string;
  tags: string[];
}

export const RelationshipSchema = BaseEntitySchema.extend({
  type: z.literal('relationship'),
  sourceType: z.enum(['character', 'event', 'location']),
  sourceId: z.string().uuid(),
  targetType: z.enum(['character', 'event', 'location']),
  targetId: z.string().uuid(),
  relationshipType: z.enum([
    'family', 'friend', 'enemy', 'lover', 'master', 'colleague', 'rival',
    'participant', 'witness', 'victim', 'beneficiary',
    'resident', 'visitor', 'owner',
    'occurred_at',
    'causes', 'precedes', 'correlates',
  ]),
  direction: z.enum(['unidirectional', 'bidirectional']),
  strength: z.number().min(1).max(100),
  description: z.string().optional(),
  establishedAt: z.string().optional(),
  tags: z.array(z.string()),
});
```

- [ ] **Step 10: 创建统一导出 src/index.ts**

```typescript
// Base types
export * from './types/base';

// Entity types
export * from './types/character';
export * from './types/event';
export * from './types/location';
export * from './types/world';
export * from './types/timeline';
export * from './types/relationship';

// Re-export Zod schemas
import { z } from 'zod';
export { z };
```

- [ ] **Step 11: 提交**

```bash
git add packages/core/entities/
git commit -m "feat(entities): add all entity type definitions with Zod schemas"
```

---

### Chunk 3: 核心层 - Repository 包

**Files:**
- Create: `packages/core/repository/package.json`
- Create: `packages/core/repository/tsconfig.json`
- Create: `packages/core/repository/src/index.ts`
- Create: `packages/core/repository/src/types.ts`
- Create: `packages/core/repository/src/base-repository.ts`
- Create: `packages/core/repository/src/sqlite/`
- Create: `packages/core/repository/src/neo4j/`

（由于篇幅限制，Repository 包的详细代码将在 Plan 002 中展开）

- [ ] **Step 1: 创建 Repository 包结构**
- [ ] **Step 2: 定义 Repository 接口**
- [ ] **Step 3: 实现 SQLite 适配器**
- [ ] **Step 4: 实现 Neo4j 适配器（基础）**
- [ ] **Step 5: 添加单元测试**
- [ ] **Step 6: 提交**

---

## 执行检查

在执行此计划前，请确认：

- [ ] 已安装 Node.js >= 18.0.0
- [ ] 已安装 pnpm >= 8.0.0
- [ ] 已配置 Git
- [ ] 有足够的磁盘空间（建议 >= 5GB）

## 参考文档

- Spec: `docs/superpowers/specs/2026-03-16-shu-zhong-jie-design.md`
- Related: Tauri v2 文档，pnpm workspace 文档，Turborepo 文档
