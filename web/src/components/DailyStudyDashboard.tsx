import {
  formatDuration,
  getBattleTypeColor,
  useDashboardData,
} from "@flashcard-rpg/shared";
import { StatBox } from "./Common/StatBox";

interface DailyStudyDashboardProps {
  onStartBattle: () => void;
  onManageDecks: () => void;
}

export const DailyStudyDashboard: React.FC<DailyStudyDashboardProps> = ({
  onStartBattle,
  onManageDecks,
}: DailyStudyDashboardProps) => {
  const { data, isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div>📊 Calculating your daily study plan...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#F44336" }}>
        <div>❌ Error loading dashboard</div>
        <div style={{ fontSize: "14px", marginTop: "10px" }}>{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div>No study data available</div>
      </div>
    );
  }

  const { summary, stats, activeDecksWithDue } = data;
  const hasActiveDecks = activeDecksWithDue.length > 0;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "28px", marginBottom: "10px" }}>
          📚 Daily Study Plan
        </h1>
        <div style={{ color: "#666", fontSize: "16px" }}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* No Active Decks */}
      {!hasActiveDecks && (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            backgroundColor: "#f9f9f9",
            borderRadius: "12px",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>📚</div>
          <h3>No Active Study Decks</h3>
          <p style={{ marginBottom: "20px", color: "#666" }}>
            Create some flashcard decks and mark them as active to start
            studying!
          </p>
          <button
            onClick={onManageDecks}
            style={{
              padding: "12px 24px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            📚 Create Your First Deck
          </button>
        </div>
      )}

      {/* Today's Battle Plan */}
      {hasActiveDecks && (
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
            <StatBox
              value={summary.totalDue}
              label="Cards Due"
              color="#E53E3E"
            />
            <StatBox
              value={summary.newCards}
              label="New Cards"
              color="#2196F3"
            />
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
                ⚔️ Start Battle ({summary.totalDue} cards)
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
      )}

      {/* Study Progress */}
      {hasActiveDecks && (
        <div
          style={{
            backgroundColor: "white",
            border: "1px solid #ddd",
            borderRadius: "12px",
            padding: "25px",
            marginBottom: "30px",
          }}
        >
          <h2 style={{ marginBottom: "20px" }}>📊 Your Study Progress</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "20px",
            }}
          >
            <StatBox
              value={stats.totalCards}
              label="Total Cards"
              color="#333"
            />
            <StatBox value={stats.newCards} label="New" color="#2196F3" />
            <StatBox
              value={stats.learningCards}
              label="Learning"
              color="#FF9800"
            />
            <StatBox
              value={stats.matureCards}
              label="Mastered"
              color="#4CAF50"
            />
            <StatBox
              value={`${stats.retentionRate.toFixed(0)}%`}
              label="Retention"
              color="#9C27B0"
            />
          </div>
        </div>
      )}

      {/* Active Decks */}
      {hasActiveDecks && (
        <div
          style={{
            backgroundColor: "white",
            border: "1px solid #ddd",
            borderRadius: "12px",
            padding: "25px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ margin: 0 }}>🎯 Active Study Decks</h2>
            <button
              onClick={onManageDecks}
              style={{
                padding: "8px 16px",
                backgroundColor: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Manage Decks
            </button>
          </div>

          <div style={{ display: "grid", gap: "15px" }}>
            {activeDecksWithDue.map(({ deck, dueToday, totalDue }) => (
              <div
                key={deck.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "15px",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "8px",
                  border: `2px solid ${deck.color || "#4CAF50"}`,
                }}
              >
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                    {deck.name}
                  </div>
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    {deck.totalCards} total • {dueToday} due today
                    {totalDue > dueToday && ` (${totalDue} total due)`}
                  </div>
                </div>
                <div
                  style={{
                    padding: "4px 12px",
                    backgroundColor: dueToday > 0 ? "#E53E3E" : "#4CAF50",
                    color: "white",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {dueToday > 0 ? `${dueToday} due` : "Complete"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
