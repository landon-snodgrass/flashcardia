import {
  calculateMonsterDamage,
  calculatePlayerDamage,
  FlashcardService,
  GAME_CONSTANTS,
  Monster,
  SpacedRepetitionEngine,
  useBattleStats,
  useGameStore,
} from "@flashcard-rpg/shared";
import { useEffect, useState } from "react";

interface FlashcardBattleProps {
  dueCards?: any[];
  onBattleComplete: (results: any) => void;
  onBack: () => void;
}

export const FlashcardBattle: React.FC<FlashcardBattleProps> = ({
  dueCards = [],
  onBattleComplete,
  onBack,
}: FlashcardBattleProps) => {
  const {
    player,
    currentBattle,
    startBattle,
    endBattle,
    playerAttack,
    monsterAttack,
    nextCard,
    gainXp,
    battleUi,
    setBattleUi,
    updateSessionStats,
    startStudySession
  } = useGameStore();

  const battleStats = useBattleStats();

  const [userAnswer, setUserAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [answerResult, setAnswerResult] = useState<
    "correct" | "incorrect" | null
  >(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [cardPerformances, setCardPerformances] = useState<any[]>([]);

  useEffect(() => {
    if (!currentBattle && player) {
      startRealBattle();
      startStudySession();
    }
  }, [player, currentBattle]);

  const getMonsterSprite = (type: string): string => {
    const sprites = {
      goblin: "👹",
      orc: "👺",
      dragon: "🐉",
      skeleton: "💀",
      boss: "👑",
    };
    return sprites[type as keyof typeof sprites] || "👹";
  };

  const startRealBattle = () => {
    // Select monster based on number of due cards
    const monsterType =
      dueCards.length <= 5
        ? "goblin"
        : dueCards.length <= 15
        ? "orc"
        : dueCards.length <= 30
        ? "dragon"
        : "boss";

    const monsterStats = GAME_CONSTANTS.MONSTER_STATS[monsterType];

    const monster: Monster = {
      id: `${monsterType}-${Date.now()}`,
      name: `${
        monsterType.charAt(0).toUpperCase() + monsterType.slice(1)
      } of Ignorance`,
      level: Math.min(Math.floor(dueCards.length / 5) + 1, 10),
      maxHp: monsterStats.hp + dueCards.length * 2, // Scale with card count
      currentHp: monsterStats.hp + dueCards.length * 2,
      attackPower: monsterStats.attack,
      defense: monsterStats.defense || 0,
      xpReward: monsterStats.xp,
      goldReward: monsterStats.gold,
      sprite: getMonsterSprite(monsterType),
      description: `A fearsome creature that grows stronger with unlearned knowledge!`,
      type: monsterType,
      possibleDrops: [],
    };

    startBattle(monster, dueCards);
  };

  const handleSubmitAnswer = () => {
    if (!battleStats?.currentCard || isAnswering) return;

    setIsAnswering(true);
    const currentCard = battleStats.currentCard;
    const isCorrect =
      userAnswer.toLowerCase().trim() === currentCard.back.toLowerCase().trim();

    setAnswerResult(isCorrect ? "correct" : "incorrect");
    setShowAnswer(true);

    // Record performance for spaced repetition
    const performance = isCorrect ? "good" : "again";
    setCardPerformances((prev) => [
      ...prev,
      {
        cardId: currentCard.id,
        performance,
        responseTime: Date.now() - (window as any).cardStartTime || 5000,
      },
    ]);

    // Calculate damage
    if (isCorrect) {
      const damage = calculatePlayerDamage(player?.attackPower || 10, true, 0);
      playerAttack(damage);
      gainXp(GAME_CONSTANTS.XP_PER_CORRECT_ANSWER);

      setBattleUi({
        showDamageNumbers: true,
        lastDamage: { amount: damage, type: "player", timestamp: Date.now() },
      });
    } else {
      const damage = calculateMonsterDamage(
        currentBattle?.monster.attackPower || 8,
        false
      );
      monsterAttack(damage);

      setBattleUi({
        showDamageNumbers: true,
        lastDamage: { amount: damage, type: "monster", timestamp: Date.now() },
      });
    }

    // Update study session stats
    updateSessionStats({
      cardsReviewed: cardPerformances.length + 1,
      correctAnswers:
        cardPerformances.filter((p) => p.performance === "good").length +
        (isCorrect ? 1 : 0),
    });

    // Hide damage numbers after animation
    setTimeout(() => {
      setBattleUi({ showDamageNumbers: false, lastDamage: undefined });
    }, 1500);

    // Continue to next card after a delay
    setTimeout(() => {
      continueToNextCard();
    }, 2000);
  };

  const continueToNextCard = () => {
    if (!battleStats) return;

    // Check if battle is over
    if (battleStats.playerHealthPercentage <= 0) {
      completeBattle("defeat");
      return;
    }

    if (battleStats.monsterHealthPercentage <= 0) {
      completeBattle("victory");
      return;
    }

    // Check if we have more cards
    if (battleStats.cardsRemaining <= 1) {
      completeBattle("victory"); // Completed all cards = victory
      return;
    }

    // Move to next card
    nextCard();
    setUserAnswer("");
    setShowAnswer(false);
    setAnswerResult(null);
    setIsAnswering(false);

    // Track card start time for response time calculation
    (window as any).cardStartTime = Date.now();
  };

  const completeBattle = async (result: "victory" | "defeat") => {
    endBattle(result);

    // Update spaced repetition for all cards studied
    const cardUpdates = cardPerformances.map((perf) => ({
      id: perf.cardId,
      data: SpacedRepetitionEngine.updateCard(
        dueCards.find((card) => card.id === perf.cardId),
        perf.performance
      ),
    }));

    // Save updated cards to Firebase
    if (cardUpdates.length > 0) {
      await FlashcardService.updateMultipleCards(cardUpdates);
    }

    // Complete study session
    updateSessionStats({
      battlesWon: result === "victory" ? 1 : 0,
      xpEarned:
        cardPerformances.filter((p) => p.performance === "good").length *
        GAME_CONSTANTS.XP_PER_CORRECT_ANSWER,
    });

    // Return results
    onBattleComplete({
      result,
      cardsStudied: cardPerformances.length,
      correctAnswers: cardPerformances.filter((p) => p.performance === "good")
        .length,
      xpEarned:
        cardPerformances.filter((p) => p.performance === "good").length *
        GAME_CONSTANTS.XP_PER_CORRECT_ANSWER,
    });
  };

  // Set card start time when showing new card
  useEffect(() => {
    if (battleStats?.currentCard && !showAnswer) {
      (window as any).cardStartTime = Date.now();
    }
  }, [battleStats?.currentCard, showAnswer]);

  if (!player) {
    return <div>Loading player...</div>;
  }

  if (dueCards.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h2>No Cards Due!</h2>
        <p>Great job! You've completed all your due cards for today.</p>
        <button
          onClick={onBack}
          style={{
            padding: "12px 24px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (!currentBattle || !battleStats) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div>Preparing your battle...</div>
      </div>
    );
  }

  const { currentCard } = battleStats;
  const isGameOver = battleStats.isBattleOver;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#1a1a2e",
        color: "white",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          padding: "8px 16px",
          backgroundColor: "#333",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        ← Back
      </button>

      {/* Battle Header */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h1 style={{ margin: "0 0 10px 0", fontSize: "24px" }}>
          ⚔️ Daily Study Battle ⚔️
        </h1>
        <div style={{ fontSize: "14px", opacity: 0.8 }}>
          Card{" "}
          {battleStats.currentCard ? currentBattle.currentCardIndex + 1 : 0} of{" "}
          {currentBattle.dueCards.length}
        </div>
      </div>

      {/* Battle Arena */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "40px",
          maxWidth: "800px",
          margin: "0 auto 40px auto",
        }}
      >
        {/* Player Side */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "10px" }}>👤</div>
          <h3 style={{ margin: "0 0 10px 0" }}>{player.name}</h3>
          <div style={{ marginBottom: "10px" }}>Level {player.level}</div>

          {/* Player HP Bar */}
          <div
            style={{
              width: "100%",
              height: "20px",
              backgroundColor: "#333",
              borderRadius: "10px",
              overflow: "hidden",
              marginBottom: "5px",
            }}
          >
            <div
              style={{
                width: `${battleStats.playerHealthPercentage}%`,
                height: "100%",
                backgroundColor:
                  battleStats.playerHealthPercentage > 50
                    ? "#4CAF50"
                    : battleStats.playerHealthPercentage > 25
                    ? "#FF9800"
                    : "#F44336",
                transition: "width 0.5s ease",
              }}
            />
          </div>
          <div style={{ fontSize: "12px" }}>
            {currentBattle.player.currentHp} / {currentBattle.player.maxHp} HP
          </div>

          {/* Damage Number Animation */}
          {battleUi.showDamageNumbers &&
            battleUi.lastDamage?.type === "monster" && (
              <div
                style={{
                  position: "absolute",
                  fontSize: "24px",
                  color: "#F44336",
                  fontWeight: "bold",
                  animation: "damage-float 1.5s ease-out forwards",
                  pointerEvents: "none",
                }}
              >
                -{battleUi.lastDamage.amount}
              </div>
            )}
        </div>

        {/* Monster Side */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "10px" }}>
            {currentBattle.monster.sprite}
          </div>
          <h3 style={{ margin: "0 0 10px 0" }}>{currentBattle.monster.name}</h3>
          <div style={{ marginBottom: "10px" }}>
            Level {currentBattle.monster.level}
          </div>

          {/* Monster HP Bar */}
          <div
            style={{
              width: "100%",
              height: "20px",
              backgroundColor: "#333",
              borderRadius: "10px",
              overflow: "hidden",
              marginBottom: "5px",
            }}
          >
            <div
              style={{
                width: `${battleStats.monsterHealthPercentage}%`,
                height: "100%",
                backgroundColor: "#E53E3E",
                transition: "width 0.5s ease",
              }}
            />
          </div>
          <div style={{ fontSize: "12px" }}>
            {currentBattle.monster.currentHp} / {currentBattle.monster.maxHp} HP
          </div>

          {/* Damage Number Animation */}
          {battleUi.showDamageNumbers &&
            battleUi.lastDamage?.type === "player" && (
              <div
                style={{
                  position: "absolute",
                  fontSize: "24px",
                  color: "#4CAF50",
                  fontWeight: "bold",
                  animation: "damage-float 1.5s ease-out forwards",
                  pointerEvents: "none",
                }}
              >
                -{battleUi.lastDamage.amount}
              </div>
            )}
        </div>
      </div>

      {/* Flashcard Area */}
      {!isGameOver && currentCard && (
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "#2a2a4a",
            borderRadius: "12px",
            padding: "30px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          <div
            style={{
              backgroundColor: showAnswer ? "#4CAF50" : "#6B73FF",
              color: "white",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "20px",
              textAlign: "center",
              fontSize: "18px",
              minHeight: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {showAnswer ? (
              <div>
                <div
                  style={{
                    marginBottom: "10px",
                    fontSize: "16px",
                    opacity: 0.9,
                  }}
                >
                  Answer:
                </div>
                <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                  {currentCard.back}
                </div>
              </div>
            ) : (
              currentCard.front
            )}
          </div>

          {!showAnswer ? (
            <div>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSubmitAnswer()}
                placeholder="Type your answer..."
                disabled={isAnswering}
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "16px",
                  border: "2px solid #ddd",
                  borderRadius: "8px",
                  marginBottom: "15px",
                  boxSizing: "border-box",
                }}
                autoFocus
              />
              <button
                onClick={handleSubmitAnswer}
                disabled={!userAnswer.trim() || isAnswering}
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "16px",
                  backgroundColor:
                    !userAnswer.trim() || isAnswering ? "#666" : "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor:
                    !userAnswer.trim() || isAnswering
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {isAnswering ? "Processing..." : "Submit Answer"}
              </button>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "18px",
                  marginBottom: "15px",
                  color: answerResult === "correct" ? "#4CAF50" : "#F44336",
                  fontWeight: "bold",
                }}
              >
                {answerResult === "correct"
                  ? "✅ Correct! You attack!"
                  : "❌ Incorrect! Monster attacks!"}
              </div>
              <div style={{ fontSize: "14px", opacity: 0.8 }}>
                {answerResult === "correct"
                  ? `+${GAME_CONSTANTS.XP_PER_CORRECT_ANSWER} XP`
                  : "Study harder next time!"}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Game Over Screen */}
      {isGameOver && (
        <div
          style={{
            maxWidth: "500px",
            margin: "0 auto",
            backgroundColor:
              currentBattle.status === "victory" ? "#1B5E20" : "#B71C1C",
            borderRadius: "12px",
            padding: "40px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>
            {currentBattle.status === "victory" ? "🎉" : "💀"}
          </div>
          <h2 style={{ margin: "0 0 20px 0" }}>
            {currentBattle.status === "victory" ? "Victory!" : "Defeat!"}
          </h2>
          <div style={{ marginBottom: "20px", opacity: 0.9 }}>
            {currentBattle.status === "victory"
              ? `You conquered the ${currentBattle.monster.name}!`
              : `The ${currentBattle.monster.name} has defeated you!`}
          </div>
          <div style={{ marginBottom: "30px", fontSize: "14px", opacity: 0.8 }}>
            Cards studied: {cardPerformances.length}
            <br />
            Correct answers:{" "}
            {cardPerformances.filter((p) => p.performance === "good").length}
            <br />
            XP earned:{" "}
            {cardPerformances.filter((p) => p.performance === "good").length *
              GAME_CONSTANTS.XP_PER_CORRECT_ANSWER}
          </div>
          <button
            onClick={onBack}
            style={{
              padding: "12px 24px",
              fontSize: "16px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Return to Dashboard
          </button>
        </div>
      )}

      {/* CSS for animations */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes damage-float {
            0% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
            50% {
              opacity: 1;
              transform: translateY(-30px) scale(1.2);
            }
            100% {
              opacity: 0;
              transform: translateY(-60px) scale(0.8);
            }
          }
        `,
        }}
      />
    </div>
  );
};
