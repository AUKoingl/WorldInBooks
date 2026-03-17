# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

**WorldInBooks (书中界)** - 小说辅助创作平台，基于 Tauri v2 的桌面应用。

### 产品定位
面向小说创作者的辅助工具，帮助作者管理小说核心要素：**人物、事件、地点、世界观**，并提供关系图谱可视化和一致性检查功能。

## 架构设计

### Monorepo 管理
- **包管理器**: pnpm (v8.15.0) + workspace
- **构建工具**: Turborepo (`turbo.json`)
- **包依赖**: `workspace:*` 协议

### 核心包依赖关系

```
apps/desktop
  ├── @shu-zhong-jie/entities    # 实体定义
  ├── @shu-zhong-jie/repository  # 数据访问
  └── @shu-zhong-jie/ui          # UI 组件

packages/core/repository
  └── @shu-zhong-jie/entities    # 依赖实体定义
```

### 实体模型

位于 `packages/core/entities/src/types/`:
- `Character` - 人物角色
- `Event` - 事件
- `Location` - 地点
- `WorldSetting` - 世界观
- `Timeline` - 时间线
- `Relationship` - 关系

所有实体使用 **Zod** 进行 schema 验证，继承自 `BaseEntity` (包含 `id`, `name`, `description`, `createdAt`, `updatedAt`)。

### 仓储模式

位于 `packages/core/repository/src/`:
- **BaseRepository** - 基础仓储接口 (`IRepository<T>`)
- **SQLite 实现** - `packages/core/repository/src/sqlite/`
  - 使用 `@tauri-apps/plugin-sql`
  - 表结构定义在 `V1__initial_schema.sql`
  - 工厂类：`SQLiteRepositoryFactory`
- **Neo4j 实现** - `packages/core/repository/src/neo4j/`
  - 图数据库适配器 (基础框架)
  - 工厂类：`Neo4jRepositoryFactory`

### 技术栈

| 层级 | 技术 |
|------|------|
| 应用框架 | Tauri v2 |
| 前端 | React 18 + TypeScript |
| UI | TailwindCSS |
| 状态管理 | Zustand |
| 本地数据库 | SQLite |
| 图数据库 | Neo4j (可选) |
| 数据验证 | Zod |
| 构建工具 | Vite |

## 开发规范

### TypeScript
- 严格模式 (`strict: true`)
- 禁止使用 `any` 类型
- 所有导出必须有类型定义

### 模块化通信
所有模块通过 Repository 层定义的接口进行数据访问，不直接操作数据库：

```typescript
// 正确：通过 Repository 访问
const characters = await characterRepository.findAll();

// 错误：直接操作数据库
const characters = await db.select('*').from('characters');
```

### Git 提交格式

```
<type>(<scope>): <description>

示例:
feat(entities): add character schema
fix(repository): sqlite connection leak
docs: update README
```

## 相关文档

- 开发指南：[DEVELOPMENT.md](./DEVELOPMENT.md) - 详细开发手册（含完整命令和故障排除）
- 设计规格：`C:\Users\55438\docs\superpowers\specs\2026-03-16-shu-zhong-jie-design.md`
- 实现计划：`C:\Users\55438\docs\superpowers\plans\2026-03-16-shu-zhong-jie-plan-001-scaffold.md`
