# 数据库迁移脚本

本目录包含数据库迁移脚本，用于管理 SQLite 数据库的 schema 变更。

## 使用方法

```bash
# 运行迁移
pnpm migrate

# 回滚迁移
pnpm migrate:rollback
```

## 迁移文件命名规范

`V{版本号}__{描述}.sql`

例如：
- `V1__initial_schema.sql`
- `V2__add_indexes.sql`
