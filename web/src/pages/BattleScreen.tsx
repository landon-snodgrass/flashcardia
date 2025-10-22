import { useGameStore } from "@flashcard-rpg/shared";
import { useSessionStats } from "@flashcard-rpg/shared";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const BattleScreen = () => {
  const navigate = useNavigate();
  const { currentSession, submitAnswer, abandonSession, spawnNextMonster } =
    useGameStore();
  const sessionStats = useSessionStats();

  const [userAnswer, setUserAnswer] = useState<string>("");
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(
    null
  );
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [transitionMessage, setTransitionMessage] = useState<string>("");

  // Cleanup: Clear completed sessions when leaving the page
  useEffect(() => {
    return () => {
      const session = useGameStore.getState().currentSession;
      // Only clear if session is completed (not active)
      if (session && session.status !== "active") {
        useGameStore.setState({ currentSession: null });
      }
    };
  }, []);

  const handleSubmitAnswer = () => {
    if (!sessionStats?.currentCard || showFeedback) return;

    const currentCard = sessionStats.currentCard;
    const isCorrect =
      userAnswer.trim().toLowerCase() === currentCard.back.trim().toLowerCase();

    setLastAnswerCorrect(isCorrect);
    setShowFeedback(true);

    // Submit answer to game store
    const result = submitAnswer(isCorrect);

    // Auto-advance after showing feedback
    setTimeout(() => {
      if (result?.monsterKilled && isCorrect) {
        // Show transition animation
        setIsTransitioning(true);
        setTransitionMessage("Monster defeated! 💀");

        setTimeout(() => {
          // Spawn next monster after transition
          spawnNextMonster();
          setIsTransitioning(false);
          setShowFeedback(false);
          setUserAnswer("");
          setLastAnswerCorrect(null);
        }, 1000);
      } else {
        // No transition needed, jsut continue
        setShowFeedback(false);
        setUserAnswer("");
        setLastAnswerCorrect(null);
      }
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !showFeedback) {
      handleSubmitAnswer();
    }
  };

  const handleAbandon = () => {
    if (
      window.confirm(
        "Are you sure you want to abandon this session? You will lose all progress."
      )
    ) {
      abandonSession();
      navigate("/");
    }
  };

  const handleBackToDashboard = () => {
    // Clear the session when leaving
    useGameStore.setState({ currentSession: null });
    navigate("/");
  };

  const handleStartTestBattle = () => {
    const { startStudySession, playerData } = useGameStore.getState();
    const player = playerData.data;
    console.log(player);
    if (!player) return;

    // Create mock flashcards for testing
    const mockCards = [
      {
        id: "test-1",
        front: "What is 2 + 2?",
        back: "4",
        deckId: "test-deck",
        createdAt: new Date(),
        interval: 1,
        repetitions: 0,
        easeFactor: 2.5,
        nextReviewDate: new Date(),
      },
      {
        id: "test-2",
        front: "What is the capital of France?",
        back: "paris",
        deckId: "test-deck",
        createdAt: new Date(),
        interval: 1,
        repetitions: 0,
        easeFactor: 2.5,
        nextReviewDate: new Date(),
      },
      {
        id: "test-3",
        front: "What color is the sky?",
        back: "blue",
        deckId: "test-deck",
        createdAt: new Date(),
        interval: 1,
        repetitions: 0,
        easeFactor: 2.5,
        nextReviewDate: new Date(),
      },
      {
        id: "test-4",
        front: "How many sides does a triangle have?",
        back: "3",
        deckId: "test-deck",
        createdAt: new Date(),
        interval: 1,
        repetitions: 0,
        easeFactor: 2.5,
        nextReviewDate: new Date(),
      },
      {
        id: "test-5",
        front: "What is 10 * 10?",
        back: "100",
        deckId: "test-deck",
        createdAt: new Date(),
        interval: 1,
        repetitions: 0,
        easeFactor: 2.5,
        nextReviewDate: new Date(),
      },
    ];

    startStudySession(mockCards, "custom", "medium");
  };

  // No active session
  if (!currentSession) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#1a1a2e",
          color: "#eee",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: "500px",
          }}
        >
          <h1 style={{ fontSize: "48px", marginBottom: "20px" }}>⚔️</h1>
          <h2 style={{ marginBottom: "20px" }}>No Active Battle</h2>
          <p style={{ marginBottom: "30px", color: "#aaa" }}>
            Start a study session to begin your battle!
          </p>
          <button
            onClick={handleStartTestBattle}
            style={{
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              padding: "12px 30px",
              fontSize: "16px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Start test battle
          </button>
          <button
            onClick={handleBackToDashboard}
            style={{
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              padding: "12px 30px",
              fontSize: "16px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Session complete - show result
  if (currentSession.status !== "active") {
    const isVictory = currentSession.status === "victory";
    const isDefeat = currentSession.status === "defeat";

    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#1a1a2e",
          color: "#eee",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: "600px",
            backgroundColor: "#2a2a4a",
            borderRadius: "16px",
            padding: "40px",
          }}
        >
          <h1 style={{ fontSize: "64px", marginBottom: "20px" }}>
            {isVictory ? "🎉" : isDefeat ? "💀" : "🚪"}
          </h1>
          <h2
            style={{
              marginBottom: "20px",
              color: isVictory ? "#4CAF50" : isDefeat ? "#F44336" : "#FFA726",
            }}
          >
            {isVictory
              ? "Victory!"
              : isDefeat
              ? "Defeated!"
              : "Session Abandoned"}
          </h2>

          <div
            style={{
              backgroundColor: "#1a1a2e",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "30px",
              textAlign: "left",
            }}
          >
            <h3 style={{ marginBottom: "15px", color: "#FFA726" }}>Results</h3>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <span>Cards Completed:</span>
              <span style={{ fontWeight: "bold" }}>
                {currentSession.cardReviews.length} /{" "}
                {currentSession.cards.length}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <span>Monsters Defeated:</span>
              <span style={{ fontWeight: "bold" }}>
                {currentSession.monstersKilled}
              </span>
            </div>
            {currentSession.totalXpEarned !== undefined && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <span>XP Earned:</span>
                <span style={{ fontWeight: "bold", color: "#4CAF50" }}>
                  +{currentSession.totalXpEarned}
                </span>
              </div>
            )}
            {currentSession.totalGoldEarned !== undefined && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Gold Earned:</span>
                <span style={{ fontWeight: "bold", color: "#FFC107" }}>
                  +{currentSession.totalGoldEarned}
                </span>
              </div>
            )}
            {isDefeat && (
              <div
                style={{
                  marginTop: "15px",
                  padding: "10px",
                  backgroundColor: "#3a2a2a",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#aaa",
                }}
              >
                💡 You received half rewards for your effort
              </div>
            )}
          </div>

          <button
            onClick={handleBackToDashboard}
            style={{
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              padding: "12px 30px",
              fontSize: "16px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Active battle UI
  if (!sessionStats) return null;

  const currentCard = sessionStats.currentCard;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#1a1a2e",
        color: "#eee",
        padding: "20px",
      }}
    >
      {/* Header with abandon button */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto 20px",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={handleAbandon}
          style={{
            backgroundColor: "#666",
            color: "white",
            border: "none",
            padding: "8px 16px",
            fontSize: "14px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Abandon Session
        </button>
      </div>

      {/* Monster Transition Overlay */}
      {isTransitioning && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            animation: "fadeIn 0.3s ease-in",
          }}
        >
          <h2
            style={{
              fontSize: "48px",
              color: "#4CAF50",
              animation: "bounce 0.5s ease-in-out",
            }}
          >
            {transitionMessage}
          </h2>
        </div>
      )}

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Combat Area */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "40px",
            marginBottom: "40px",
          }}
        >
          {/* Player Side */}
          <div style={{ textAlign: "center" }}>
            <h3 style={{ marginBottom: "10px" }}>
              {useGameStore.getState().player?.name || "Hero"}
            </h3>
            <div style={{ fontSize: "48px", marginBottom: "15px" }}>🧙</div>
            <div style={{ marginBottom: "10px" }}>
              Level {useGameStore.getState().player?.level}
            </div>

            {/* Player HP Bar */}
            <div
              style={{
                width: "100%",
                height: "30px",
                backgroundColor: "#333",
                borderRadius: "15px",
                overflow: "hidden",
                marginBottom: "8px",
                border: "2px solid #555",
              }}
            >
              <div
                style={{
                  width: `${sessionStats.playerHealthPercentage}%`,
                  height: "100%",
                  backgroundColor:
                    sessionStats.playerHealthPercentage > 50
                      ? "#4CAF50"
                      : sessionStats.playerHealthPercentage > 25
                      ? "#FF9800"
                      : "#F44336",
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            <div style={{ fontSize: "14px", color: "#aaa" }}>
              {sessionStats.playerCurrentHp} / {sessionStats.playerMaxHp} HP
            </div>
          </div>

          {/* Monster Side */}
          <div style={{ textAlign: "center" }}>
            <h3 style={{ marginBottom: "10px" }}>{sessionStats.monsterName}</h3>
            <div style={{ fontSize: "64px", marginBottom: "15px" }}>
              {sessionStats.monsterSprite}
            </div>
            <div style={{ marginBottom: "10px" }}>
              Level {sessionStats.monsterLevel}
            </div>

            {/* Monster HP Bar */}
            <div
              style={{
                width: "100%",
                height: "30px",
                backgroundColor: "#333",
                borderRadius: "15px",
                overflow: "hidden",
                marginBottom: "8px",
                border: "2px solid #555",
              }}
            >
              <div
                style={{
                  width: `${sessionStats.monsterHealthPercentage}%`,
                  height: "100%",
                  backgroundColor: "#E53E3E",
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            <div style={{ fontSize: "14px", color: "#aaa" }}>
              {sessionStats.monsterCurrentHp} / {sessionStats.monsterMaxHp} HP
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "20px",
            fontSize: "18px",
            color: "#FFA726",
          }}
        >
          Card {sessionStats.currentCardIndex + 1} of {sessionStats.totalCards}{" "}
          | Monsters Defeated: {sessionStats.monstersKilled}
        </div>

        {/* Flashcard Area */}
        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            backgroundColor: "#2a2a4a",
            borderRadius: "16px",
            padding: "40px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          {/* Question */}
          <div
            style={{
              backgroundColor: showFeedback
                ? lastAnswerCorrect
                  ? "#1b5e20"
                  : "#b71c1c"
                : "#1a1a2e",
              borderRadius: "12px",
              padding: "30px",
              marginBottom: "30px",
              minHeight: "120px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: "bold",
              transition: "background-color 0.3s ease",
            }}
          >
            {currentCard.front}
          </div>

          {/* Answer Input */}
          {!showFeedback ? (
            <>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your answer..."
                autoFocus
                style={{
                  width: "100%",
                  padding: "15px",
                  fontSize: "18px",
                  borderRadius: "8px",
                  border: "2px solid #555",
                  backgroundColor: "#1a1a2e",
                  color: "#eee",
                  marginBottom: "20px",
                  outline: "none",
                }}
              />
              <button
                onClick={handleSubmitAnswer}
                disabled={!userAnswer.trim()}
                style={{
                  width: "100%",
                  padding: "15px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: userAnswer.trim() ? "#4CAF50" : "#333",
                  color: userAnswer.trim() ? "white" : "#666",
                  cursor: userAnswer.trim() ? "pointer" : "not-allowed",
                  transition: "all 0.2s ease",
                }}
              >
                Submit Answer
              </button>
            </>
          ) : (
            <>
              {/* Feedback */}
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    fontSize: "48px",
                    marginBottom: "10px",
                  }}
                >
                  {lastAnswerCorrect ? "✅" : "❌"}
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    marginBottom: "10px",
                    color: lastAnswerCorrect ? "#4CAF50" : "#F44336",
                  }}
                >
                  {lastAnswerCorrect ? "Correct!" : "Incorrect!"}
                </div>
                <div
                  style={{
                    backgroundColor: "#1a1a2e",
                    borderRadius: "8px",
                    padding: "15px",
                    fontSize: "18px",
                  }}
                >
                  <div
                    style={{
                      color: "#aaa",
                      fontSize: "14px",
                      marginBottom: "5px",
                    }}
                  >
                    Correct Answer:
                  </div>
                  <div style={{ fontWeight: "bold" }}>{currentCard.back}</div>
                </div>
              </div>

              <div
                style={{
                  textAlign: "center",
                  color: "#aaa",
                  fontSize: "14px",
                }}
              >
                {lastAnswerCorrect ? "⚔️ Attacking..." : "🛡️ Taking damage..."}
              </div>
            </>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};
