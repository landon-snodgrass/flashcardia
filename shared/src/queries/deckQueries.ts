import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryClient";
import { DeckService } from "../services/deckService";
import { FlashcardService } from "../services/flashcardService";
import { Deck } from "../types";

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
      console.log("USING OUR QUERY");
      return DeckService.createDeck(deckData);
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      console.log("INVALIDATING QUEIRES!!!!");
      queryClient.invalidateQueries({ queryKey: queryKeys.decks.all() });
    },
  });
};
