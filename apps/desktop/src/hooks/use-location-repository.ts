import { useState, useEffect, useCallback, useRef } from 'react';
import { Location } from '@shu-zhong-jie/entities';
import { SQLiteRepositoryFactory } from '@shu-zhong-jie/repository';
import Database from '@tauri-apps/plugin-sql';

const DB_PATH = 'sqlite:novel_creator.db';

export interface UseLocationRepositoryReturn {
  locations: Location[];
  isLoading: boolean;
  error: string | null;
  createLocation: (data: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateLocation: (id: string, data: Partial<Location>) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useLocationRepository(): UseLocationRepositoryReturn {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const factoryRef = useRef<SQLiteRepositoryFactory | null>(null);
  const isInitializedRef = useRef(false);

  // 初始化数据库和仓储工厂（只执行一次）
  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        const db = await Database.load(DB_PATH);
        const repositoryFactory = new SQLiteRepositoryFactory(db);

        // 初始化数据库表
        await SQLiteRepositoryFactory.initializeDatabase(db);

        if (mounted) {
          factoryRef.current = repositoryFactory;
          isInitializedRef.current = true;
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : '数据库初始化失败');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  // 加载所有地点
  const loadLocations = useCallback(async () => {
    if (!factoryRef.current) return;

    try {
      const repository = factoryRef.current.getLocationRepository();
      const allLocations = await repository.findAll();
      setLocations(allLocations);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载地点失败');
    }
  }, []);

  // 初始加载
  useEffect(() => {
    if (isInitializedRef.current) {
      loadLocations();
    }
  }, [loadLocations]);

  // 创建地点（乐观更新）
  const createLocation = useCallback(async (data: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!factoryRef.current) throw new Error('Repository not initialized');

    const repository = factoryRef.current.getLocationRepository();
    const created = await repository.create(data);
    // 乐观更新：直接添加到列表，避免全量刷新
    setLocations(prev => [...prev, created]);
  }, []);

  // 更新地点（乐观更新）
  const updateLocation = useCallback(async (id: string, data: Partial<Location>) => {
    if (!factoryRef.current) throw new Error('Repository not initialized');

    const repository = factoryRef.current.getLocationRepository();
    await repository.update(id, data);
    // 乐观更新：直接更新列表中的项
    setLocations(prev => prev.map(loc =>
      loc.id === id ? { ...loc, ...data, updatedAt: new Date() } : loc
    ));
  }, []);

  // 删除地点（乐观更新）
  const deleteLocation = useCallback(async (id: string) => {
    if (!factoryRef.current) throw new Error('Repository not initialized');

    const repository = factoryRef.current.getLocationRepository();
    await repository.delete(id);
    // 乐观更新：直接从列表移除
    setLocations(prev => prev.filter(loc => loc.id !== id));
  }, []);

  // 手动刷新
  const refresh = useCallback(async () => {
    await loadLocations();
  }, [loadLocations]);

  return {
    locations,
    isLoading,
    error,
    createLocation,
    updateLocation,
    deleteLocation,
    refresh,
  };
}
