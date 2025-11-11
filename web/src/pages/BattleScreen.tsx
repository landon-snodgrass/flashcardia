import {
  calculateMonsterDamage,
  calculatePlayerDamage,
  createMonster,
  FlashcardService,
  GAME_CONSTANTS,
  Monster,
  MONSTER_TEMPLATES,
  SpacedRepetitionEngine,
  StudySession,
  useGameStore,
  useGetUserCurrentSession,
  useUpdateFlashcardMutation,
  useUpdateSessionMutation,
} from "@flashcard-rpg/shared";
import { useEffect, useState } from "react";

interface FlashcardBattleProps {
  onBattleComplete: (results: any) => void;
  onBack: () => void;
}

export const BattleScreen: React.FC<FlashcardBattleProps> = () => {
  const { playerData } = useGameStore();

  const { data: currentSession } = useGetUserCurrentSession(
    playerData.data?.userId || ""
  );

  const updateSession = useUpdateSessionMutation();
  const updateFlashcard = useUpdateFlashcardMutation();

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

  const handleSubmitAnswer = () => {
    if (!currentSession || !currentCard) return;
    
    console.log("OLD INDEX ", currentSession.currentCardIndex, " OLD INDEX + 1", currentSession.currentCardIndex + 1);
    const newIndex = currentSession.currentCardIndex + 1;
    console.log("NEW INDEX", newIndex);
    let updatedSession: StudySession = {
      ...currentSession,
      currentCardIndex: newIndex,
    }
    

    if (userAnswer === currentCard?.back) {
      console.log("CORRECT");
      // Update the card
      const cardUpdate = SpacedRepetitionEngine.updateCard(currentCard, "good"); 
      updateFlashcard.mutate({cardId: cardUpdate.id, updates: cardUpdate });


      // Update the session
      updatedSession = {
        ...updatedSession,
        //monstersKilled: [...currentSession.monstersKilled, currentSession.currentMonster as Monster],
        currentMonster: createMonster(MONSTER_TEMPLATES.slime, 1),
      }
    } else {
      console.log("WRONG!@");
      // Update the card
      const cardUpdate = SpacedRepetitionEngine.updateCard(currentCard, "again"); 
      updateFlashcard.mutate({cardId: cardUpdate.id, updates: cardUpdate });

      // Update the session
      updatedSession = {
        ...updatedSession,
        playerCurrentHp: currentSession.playerCurrentHp - 10,
      }
    }

    updateSession.mutate({sessionId: updatedSession.id, updates: updatedSession})
  }

  const currentCard = currentSession?.cards ? currentSession?.cards[currentSession.currentCardIndex] : null;

  return (
    <div>
      Flashcard: {currentCard && currentCard.front}
      <p>Answer:</p>
      <input value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} />
      <button onClick={handleSubmitAnswer}>Submit</button>
    </div>
  )
};
