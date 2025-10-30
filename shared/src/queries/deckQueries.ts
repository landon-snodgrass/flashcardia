import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryClient";
import { DeckService } from "../services/deckService";
import { FlashcardService } from "../services/flashcardService";
import { Deck, Flashcard } from "../types";

export const useGetUserDecks = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.decks.all(),
    queryFn: async () => {
      const response = await DeckService.getUserDecks(userId);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useGetDeckDetail = (deckId: string) => {
  return useQuery({
    queryKey: queryKeys.decks.detail(deckId),
    queryFn: async () => {
      const deckResponse = await DeckService.getDeck(deckId);
      if (deckResponse.error) throw new Error(deckResponse.error);
      const cardsResponse = await FlashcardService.getDeckCards(deckId);
      if (cardsResponse.error) throw new Error(cardsResponse.error);
      return { deck: deckResponse.data, cards: cardsResponse.data };
    },
    enabled: !!deckId,
  });
};

export const useAddDeckMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deckData: Omit<Deck, "id">) => {
      return DeckService.createDeck(deckData);
    },
    onSuccess: (_, _2, _3, _4) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.decks.all() });
    },
  });
};

export const useAddFlaschcardMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cardData: Omit<Flashcard, "id">) => {
      return FlashcardService.createCard(cardData);
    },
    onSuccess: (data, _1, _2, _3) => {
      //TODO: this invalidation logic may be off, we need to invalidate the card list for the deck and possible the deck list not sure
      // Invalidate all of the cards
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.all() });
      // Invalidate the deck that this card is apart of
      const deckId = data.data?.deckId || "";
      if (deckId != "") {
        queryClient.invalidateQueries({
          queryKey: queryKeys.decks.detail(deckId),
        });
      }
    },
  });
};

export const useDeleteFlashcardMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cardId: string) => {
      return FlashcardService.deleteCard(cardId);
    },
    onSuccess: (data, _1, _2, _3) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.all() });
      // Invalidate the deck that this card is apart of
      const deckId = data.data || "";
      if (deckId != "") {
        queryClient.invalidateQueries({
          queryKey: queryKeys.decks.detail(deckId),
        });
      }
    },
  });
};

export const useUpdateFlashcardMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      cardId: string;
      updates: Partial<Flashcard>;
    }) => {
      return FlashcardService.updateCard(variables.cardId, variables.updates);
    },
    onSuccess: (data, _1, _2, _3) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.all() });
      // Invalidate the deck that this card is apart of
      const deckId = data.data?.deckId || "";
      if (deckId != "") {
        queryClient.invalidateQueries({
          queryKey: queryKeys.decks.detail(deckId),
        });
      }
    },
  });
};
