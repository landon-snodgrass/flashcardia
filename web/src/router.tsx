import { createBrowserRouter } from "react-router-dom";
import { DeckDetailView } from "./pages/DeckDetailView";
import { AuthLayout } from "./layouts/AuthLayout";
import { Dashboard } from "./pages/Dashboard";
import { DeckCreate } from "./pages/DeckCreate";
import { DeckList } from "./pages/DeckList";
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
