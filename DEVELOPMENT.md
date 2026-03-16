# WorldInBooks 项目开发指南

## 项目结构

```
WorldInBooks/
├── apps/
│   └── desktop/              # Tauri 桌面应用
│       ├── src/              # React 源代码
│       ├── src-tauri/        # Tauri Rust 后端
│       ├── package.json
│       └── tauri.conf.json
├── packages/
│   ├── core/
│   │   ├── entities/         # 实体类型定义和 Zod Schema
│   │   └── repository/       # 数据访问层 (SQLite/Neo4j)
│   ├── features/             # 功能模块 (待开发)
│   ├── services/             # 服务层 (待开发)
│   └── ui/                   # 共享 UI 组件库
├── docs/
│   └── superpowers/
│       ├── specs/            # 设计规格文档
│       └── plans/            # 实现计划
├── package.json              # 根 package.json
├── pnpm-workspace.yaml       # pnpm workspace 配置
├── turbo.json                # Turborepo 配置
└── tsconfig.json             # TypeScript 根配置
```

## 快速开始

### 前置要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Rust (用于 Tauri 开发)
- Git

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# 运行所有开发服务器
pnpm dev

# 仅运行桌面应用
pnpm --filter world-in-books tauri:dev

# 仅开发 UI 组件
pnpm --filter @shu-zhong-jie/ui lint
```

### 构建

```bash
# 构建所有包
pnpm build

# 构建桌面应用
pnpm --filter world-in-books build

# 构建 Tauri 应用
pnpm --filter world-in-books tauri:build
```

### 类型检查

```bash
pnpm typecheck
```

## 模块化开发

### 添加新包

在 `packages/` 目录下创建新包：

```bash
mkdir -p packages/features/characters
cd packages/features/characters
pnpm init
```

### 包依赖关系

```json
{
  "dependencies": {
    "@shu-zhong-jie/entities": "workspace:*",
    "@shu-zhong-jie/repository": "workspace:*"
  }
}
```

## 开发规范

### 代码风格

- 使用 TypeScript 严格模式
- 不使用 `any` 类型
- 所有导出必须有类型定义
- 使用 ESLint 和 Prettier

### Git 提交

```bash
# 提交格式
<type>(<scope>): <description>

# 示例
feat(entities): add character schema
fix(repository): sqlite connection leak
docs: update README
```

### 测试

```bash
pnpm test
```

## 当前进度

- [x] Monorepo 脚手架初始化
- [x] Entities 包 - 所有实体类型定义
- [x] Repository 包 - SQLite 和 Neo4j 适配器
- [x] UI 组件包 - 基础组件
- [x] Tauri 桌面应用框架
- [ ] 人物模块 CRUD
- [ ] 事件模块 CRUD
- [ ] 地点模块 CRUD
- [ ] 世界观模块 CRUD
- [ ] 关系图谱可视化
- [ ] 时间轴组件
- [ ] 一致性检查服务

## 相关文档

- [设计规格文档](../docs/superpowers/specs/2026-03-16-shu-zhong-jie-design.md)
- [实现计划](../docs/superpowers/plans/2026-03-16-shu-zhong-jie-plan-001-scaffold.md)

## 技术栈

| 层级 | 技术 |
|------|------|
| 应用框架 | Tauri v2 |
| 前端 | React 18 + TypeScript |
| UI | TailwindCSS |
| 状态管理 | Zustand |
| 本地数据库 | SQLite |
| 图数据库 | Neo4j (可选) |
| 数据验证 | Zod |
| 构建工具 | pnpm + Turborepo |

## 故障排除

### pnpm 安装失败

```bash
pnpm clean
pnpm install --force
```

### Tauri 构建失败

确保已安装 Rust:

```bash
rustup update
```

### TypeScript 错误

```bash
pnpm typecheck
```
