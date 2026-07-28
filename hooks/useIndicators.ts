// useIndicators.ts
import { useState, useEffect } from 'react';
import { IndicatorManager, ActiveIndicator, IndicatorMeta, INDICATOR_METAS } from '../services/IndicatorManager';

export const useIndicators = () => {
  const [activeIndicators, setActiveIndicators] = useState<ActiveIndicator[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const manager = IndicatorManager.getInstance();

    const handleActiveChange = (indicators: ActiveIndicator[]) => {
      setActiveIndicators(indicators);
    };

    const handleMetaChange = () => {
      setFavorites(manager.getFavorites());
      setRecentlyUsed(manager.getRecentlyUsed());
    };

    manager.registerListener(handleActiveChange);
    manager.registerMetaListener(handleMetaChange);

    // Initial load
    setFavorites(manager.getFavorites());
    setRecentlyUsed(manager.getRecentlyUsed());

    return () => {
      manager.unregisterListener(handleActiveChange);
      manager.unregisterMetaListener(handleMetaChange);
    };
  }, []);

  const addIndicator = (type: string) => {
    return IndicatorManager.getInstance().addIndicator(type);
  };

  const removeIndicator = (id: string) => {
    IndicatorManager.getInstance().removeIndicator(id);
  };

  const toggleVisibility = (id: string) => {
    IndicatorManager.getInstance().toggleVisibility(id);
  };

  const setParams = (id: string, params: any) => {
    IndicatorManager.getInstance().setIndicatorParams(id, params);
  };

  const toggleFavorite = (type: string) => {
    IndicatorManager.getInstance().toggleFavorite(type);
  };

  const clearAll = () => {
    IndicatorManager.getInstance().clearAll();
  };

  const filteredMetas = INDICATOR_METAS.filter(meta => 
    meta.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meta.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    activeIndicators,
    favorites,
    recentlyUsed,
    allIndicators: INDICATOR_METAS,
    filteredIndicators: filteredMetas,
    searchQuery,
    setSearchQuery,
    addIndicator,
    removeIndicator,
    toggleVisibility,
    setParams,
    toggleFavorite,
    clearAll
  };
};
