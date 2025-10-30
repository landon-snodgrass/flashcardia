import { createBrowserRouter } from "react-router-dom";
import { DeckDetailView } from "./pages/Deck/DeckDetailView";
import { AuthLayout } from "./layouts/AuthLayout";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { DeckCreate } from "./pages/Deck/DeckCreate";
import { DeckList } from "./pages/Deck/DeckList";
import { BattleScreen } from "./pages/BattleScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "decks",
        element: <DeckList />,
      },
      {
        path: "decks/:deckId",
        element: <DeckDetailView />,
      },
      {
        path: "decks/new",
        element: <DeckCreate />,
      },
      {
        path: "battle",
        element: <BattleScreen />,
      },
    ],
  },
  //   {
  //     path: "/battle",
  //     element: <FlashcardBattle />,
  //   },
]);
