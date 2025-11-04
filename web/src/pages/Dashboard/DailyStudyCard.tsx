import { StatBox } from "@/components/Common/StatBox";
import {
    formatDuration,
  getBattleTypeColor,
  StudySession,
  useCreateSessionMutation,
  useGameStore,
  useGetUserCurrentSession,
  useGetUserDashboardData,
} from "@flashcard-rpg/shared";
import { useNavigate } from "react-router-dom";

export const DailyStudyCard = () => {
  const navigate = useNavigate();
  const { playerData } = useGameStore();

  const { data: currentSession } = useGetUserCurrentSession(
    playerData.data?.userId || ""
  );
  const createSession = useCreateSessionMutation();
  const { data: dashboardData } = useGetUserDashboardData(
    playerData.data?.userId || ""
  );

  const summary = dashboardData?.summary;

  const onStartBattle = () => {
    if (!dashboardData?.dueCards || !playerData.data) return;
    if (!currentSession) {
        const newSession: Omit<StudySession, "id"> = {
            userId: playerData.data?.userId || "",
            startTime: new Date(),
            endTime: null,
            sessionType: "daily",
            cards: dashboardData?.dueCards,
            currentCardIndex: 0,
            cardReviews: [],
            monstersKilled: [],
            playerStartingHp: playerData.data.maxHp,
            playerCurrentHp: playerData.data.maxHp,
            status: "active",
        }
        createSession.mutate({userId: playerData.data?.userId || "", sessionData: newSession})
    }
    navigate('/battle');
  }

  if (!summary) {
    return <p>No summary!</p>
  }

  return (
    <div>
      {/* Today's Battle Plan */}
      <div
        style={{
          backgroundColor: "white",
          border: "2px solid #4CAF50",
          borderRadius: "12px",
          padding: "25px",
          marginBottom: "30px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginBottom: "20px", color: "#4CAF50" }}>
          ⚔️ Today's Battle Plan
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "20px",
            marginBottom: "25px",
          }}
        >
          <StatBox value={summary.totalDue} label="Cards Due" color="#E53E3E" />
          <StatBox value={summary.newCards} label="New Cards" color="#2196F3" />
          <StatBox
            value={summary.reviewCards}
            label="Reviews"
            color="#FF9800"
          />
          <StatBox
            value={formatDuration(summary.estimatedTime)}
            label="Est. Time"
            color="#9C27B0"
          />
        </div>

        {summary.totalDue > 0 ? (
          <div>
            <div
              style={{
                marginBottom: "20px",
                textAlign: "center",
                fontSize: "16px",
              }}
            >
              <strong>Recommended Battle:</strong> Fight a{" "}
              <span
                style={{
                  color: getBattleTypeColor(summary.recommendedBattleType),
                  textTransform: "capitalize",
                  fontWeight: "bold",
                }}
              >
                {summary.recommendedBattleType}
              </span>{" "}
              ({summary.totalDue} cards)
            </div>

            <button
              onClick={onStartBattle}
              style={{
                width: "100%",
                padding: "15px",
                backgroundColor: "#E53E3E",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "18px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {currentSession ? "Continue Battle" : "Start Battle"}
            </button>
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "15px" }}>🎉</div>
            <h3 style={{ color: "#4CAF50" }}>All Caught Up!</h3>
            <p style={{ color: "#666" }}>
              Great job! You've completed all your due cards for today.
              <br />
              Come back tomorrow for more battles!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
