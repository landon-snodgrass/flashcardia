import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes
            retry: 2,
            refetchOnWindowFocus: false,
        }
    }
});

export const queryKeys = {
    // Root key
    all: ['flashcardia'] as const,
    // Deck-related keys
    decks: {
        all: () => [...queryKeys.all, 'decks'] as const,
        detail: (id: string) => [...queryKeys.decks.all(), id] as const,
    },
    // Card-related keys
    cards: {
        all: () => [...queryKeys.all, 'cards'] as const,
        detail: (id: string) => [...queryKeys.decks.all(), id] as const,
    },
    // Study session
    studySession: ['study-session'] as const,
    player: ['player'] as const,
}