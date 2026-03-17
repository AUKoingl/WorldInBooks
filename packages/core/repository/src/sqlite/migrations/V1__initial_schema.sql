-- V1__initial_schema.sql
-- 初始数据库表结构

-- 人物表
CREATE TABLE IF NOT EXISTS characters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  appearance TEXT NOT NULL,
  personality TEXT NOT NULL,
  abilities TEXT NOT NULL,
  background TEXT,
  tags TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 事件表
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  event_type TEXT NOT NULL,
  importance TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  location_ids TEXT NOT NULL,
  character_ids TEXT NOT NULL,
  cause_event_ids TEXT NOT NULL,
  effect_event_ids TEXT NOT NULL,
  foreshadowing_ids TEXT NOT NULL,
  tags TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 地点表
CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  location_type TEXT NOT NULL,
  atmosphere TEXT NOT NULL,
  parent_location_id TEXT,
  child_location_ids TEXT NOT NULL,
  world_setting_ids TEXT NOT NULL,
  event_ids TEXT NOT NULL,
  character_ids TEXT NOT NULL,
  coordinates TEXT,
  physical_description TEXT,
  history TEXT,
  tags TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 世界观表
CREATE TABLE IF NOT EXISTS world_settings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  overview TEXT NOT NULL,
  time_period TEXT,
  rule_systems TEXT NOT NULL,
  factions TEXT NOT NULL,
  timeline TEXT NOT NULL,
  location_ids TEXT NOT NULL,
  tags TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 时间线表
CREATE TABLE IF NOT EXISTS timelines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  items TEXT NOT NULL,
  world_setting_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 关系表
CREATE TABLE IF NOT EXISTS relationships (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL,
  direction TEXT NOT NULL,
  strength INTEGER NOT NULL,
  established_at TEXT,
  tags TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 势力表
CREATE TABLE IF NOT EXISTS factions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  faction_type TEXT NOT NULL,
  scale TEXT NOT NULL,
  alignment TEXT NOT NULL,
  motto TEXT,
  headquarters TEXT,
  parent_faction_id TEXT,
  child_faction_ids TEXT NOT NULL,
  member_ids TEXT NOT NULL,
  enemy_faction_ids TEXT NOT NULL,
  ally_faction_ids TEXT NOT NULL,
  ranks TEXT NOT NULL,
  influence_level INTEGER NOT NULL,
  wealth_level INTEGER NOT NULL,
  military_level INTEGER NOT NULL,
  rules TEXT,
  history TEXT,
  tags TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (headquarters) REFERENCES locations(id),
  FOREIGN KEY (parent_faction_id) REFERENCES factions(id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_characters_name ON characters(name);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_locations_parent ON locations(parent_location_id);
CREATE INDEX IF NOT EXISTS idx_relationships_source ON relationships(source_id);
CREATE INDEX IF NOT EXISTS idx_relationships_target ON relationships(target_id);
CREATE INDEX IF NOT EXISTS idx_factions_name ON factions(name);
CREATE INDEX IF NOT EXISTS idx_factions_parent ON factions(parent_faction_id);
