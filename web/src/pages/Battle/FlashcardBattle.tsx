import {
  calculateMonsterDamage,
  calculatePlayerDamage,
  FlashcardService,
  GAME_CONSTANTS,
  Monster,
  SpacedRepetitionEngine,
  useGameStore,
  useGetUserCurrentSession,
} from "@flashcard-rpg/shared";
import { useEffect, useState } from "react";

interface FlashcardBattleProps {
  onBattleComplete: (results: any) => void;
  onBack: () => void;
}

export const FlashcardBattle: React.FC<FlashcardBattleProps> = ({
  onBattleComplete,
  onBack,
}: FlashcardBattleProps) => {
  const { playerData } = useGameStore();

  const { data: currentSession } = useGetUserCurrentSession(
    playerData.data?.userId || ""
  );

  const [userAnswer, setUserAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [answerResult, setAnswerResult] = useState<
    "correct" | "incorrect" | null
  >(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [cardPerformances, setCardPerformances] = useState<any[]>([]);

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

  const currentCard = currentSession?.cards[currentSession.currentCardIndex];

  return (
    <div>
      Flashcard: {currentCard && currentCard.front}
    </div>
  )
};
