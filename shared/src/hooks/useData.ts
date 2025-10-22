import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { createDataState, DataState } from "../types/dataState";
import { Deck } from "../types";

/**
 * Hook for dashboard data with automatic loading
 */
export const useDashboardData = (autoload: boolean = true) => {
  const { dashboardData, loadDashboard } = useGameStore();

  useEffect(() => {
    if (autoload && !dashboardData.data && !dashboardData.isLoading) {
      loadDashboard();
    }
  }, [autoload, dashboardData.data, dashboardData.isLoading, loadDashboard]);

  return dashboardData;
};

/**
 * Hook for decks data with automatic loading
 */
export const useDeckListData = (autoload: boolean = true) => {
  const { decksData, loadDecks } = useGameStore();

  useEffect(() => {
    if (autoload && !decksData.data && !decksData.isLoading) {
      loadDecks();
    }
  }, [autoload, decksData.data, decksData.isLoading, loadDecks]);

  return decksData;
};

/**
 * Hook for deck detail view
 */
export const useDeckDetailData = (deckId: string, autoload: boolean = true) => {
  const { deckDetailData, loadDeckDetail, playerData } = useGameStore();

  useEffect(() => {
    // Only load if player is ready
    if (autoload && playerData.data && deckId !== "") {
      loadDeckDetail(deckId);
    }
  }, [autoload, deckId, loadDeckDetail, playerData.data]);

  return deckDetailData;
};

/**
 * Generic hook for any data state with automatic loading
 */
export const useDataState = <T>(
  dataState: DataState<T>,
  loadFunction: () => Promise<void>,
  autoload: boolean = true
) => {
  useEffect(() => {
    if (autoload && !dataState.data && !dataState.isLoading) {
      loadFunction();
    }
  }, [autoload, dataState.data, dataState.isLoading, loadFunction]);

  return dataState;
};
