import { DailyStudyDashboard } from "@/components/DailyStudyDashboard";
import { useGameStore } from "@flashcard-rpg/shared";
import { useNavigate } from "react-router-dom";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { dashboardData, startStudySession } = useGameStore();

  const handleStartBattle = () => {
    const dueCards = dashboardData.data?.dueCards;

    if (!dueCards || dueCards.length === 0) {
      console.error("No due cards available");
      return;
    }

    startStudySession(dueCards, 'daily');
    navigate("/battle");
  };

  const handleManageDecks = () => {
    navigate("/decks");
  };

  return (
    <DailyStudyDashboard
      onStartBattle={handleStartBattle}
      onManageDecks={handleManageDecks}
    />
  );
};
