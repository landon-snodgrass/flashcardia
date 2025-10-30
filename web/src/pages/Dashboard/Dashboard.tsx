import { DailyStudyDashboard } from "@/components/DailyStudyDashboard";
import { useGameStore, useGetUserCurrentSession, useGetUserDashboardData } from "@flashcard-rpg/shared";
import { useNavigate } from "react-router-dom";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { playerData } = useGameStore();

  const { data: currentSession } = useGetUserCurrentSession(playerData.data?.userId || "");
  const { data: dashboardData } = useGetUserDashboardData(playerData.data?.userId || "")

  const handleStartBattle = () => {
    const dueCards = dashboardData?.dueCards;

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
