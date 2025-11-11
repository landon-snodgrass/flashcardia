import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryClient";
import { StudySessionService } from "../services/studySessionService";
import { StudySession } from "../types";
import { DeckService } from "../services/deckService";
import { FlashcardService } from "../services/flashcardService";
import { SpacedRepetitionEngine } from "../algorithms/spacedRepetition";
import { DailyStudyData } from "../types/dailyStudy";

export const useGetUserCurrentSession = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.studySession,
    queryFn: async () => {
      const response = await StudySessionService.getUserCurrentSession(userId);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useCreateSessionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: {
      userId: string;
      sessionData: Omit<StudySession, "id">;
    }) => {
      return StudySessionService.createSession(args.userId, args.sessionData);
    },
    onSuccess: (_, _2, _3, _4) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.studySession });
    },
  });
};

export const useUpdateSessionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: {
      sessionId: string;
      updates: StudySession;
    }) => {
      return StudySessionService.updateSession(args.sessionId, args.updates);
    },
    onSuccess: (_, _2, _3, _4) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.studySession });
    },
  });
};

export const useGetUserDashboardData = (userId: string) => {
  return useQuery({
    queryKey: [...queryKeys.cards.all(), ...queryKeys.decks.all(), ...queryKeys.studySession],
    queryFn: async () => {
      const decksResponse = await DeckService.getUserDecks(userId);
      const decks = decksResponse.data || [];

      const cardsResponse = await FlashcardService.getAllUserCards(userId);
      const cards = cardsResponse.data || [];

      const activeDeckIds = decks.filter((d) => d.isActive).map((d) => d.id);
      const activeCards = cards.filter((c) => activeDeckIds.includes(c.deckId));

      // TODO: The '20' here should actually be the user's settings for daily cards
      const summary = SpacedRepetitionEngine.getDueCardsSummary(
        activeCards,
        20
      );
      const dueCards = SpacedRepetitionEngine.createStudyQueue(activeCards, 20);
      const stats = SpacedRepetitionEngine.getStudyStats(cards);

      const activeDecksWithDue = decks
        .filter((d) => d.isActive)
        .map((deck) => {
          const deckCards = cards.filter((c) => c.deckId === deck.id);
          const deckDueCards = SpacedRepetitionEngine.createStudyQueue(
            deckCards,
            deck.newCardsPerDay || 20
          );
          const allDueCards = SpacedRepetitionEngine.getDueCards(deckCards);

          return {
            deck,
            dueToday: deckDueCards.length,
            totalDue: allDueCards.length,
          };
        });
      const dailyData: DailyStudyData = {
        dueCards,
        summary,
        stats,
        activeDecksWithDue,
      };

      return dailyData;
    },
  });
};
