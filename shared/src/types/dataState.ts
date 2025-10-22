/**
 * Generic wrapper for data with loading states
 */
export interface DataState<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
}

/**
 * Helper to create initial data state
 */
export const createDataState = <T>(): DataState<T> => ({
    data: null,
    isLoading: false,
    error: null,
    lastUpdated: null
})

/**
 * Helper to set loading state
 */
export const setLoading = <T>(prevState: DataState<T>): DataState<T> => ({
    ...prevState,
    isLoading: true,
    error: null
})

/**
 * Helper to set success state
 */
export const setSuccess = <T>(data: T): DataState<T> => ({
    data,
    isLoading: false,
    error: null,
    lastUpdated: new Date(),
});

/**
 * Helper to set error state
 */
export const setError = <T>(error: string): DataState<T> => ({
    data: null,
    isLoading: false,
    error,
    lastUpdated: null,
});

/**
 * Check if data is stale (older than X minutes)
 */
export const isStale = (lastUpdated: Date| null, maxAgeMinutes: number = 5): boolean => {
    if (!lastUpdated) return true;
    const ageMs = Date.now() - lastUpdated.getTime();
    return ageMs > maxAgeMinutes * 60 * 1000;
};