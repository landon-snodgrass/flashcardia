import { useDeckListData } from "@flashcard-rpg/shared";
import { useNavigate } from "react-router-dom";

export const DeckManager: React.FC = () => {
  const navigate = useNavigate();

  const { data: decks, isLoading, error } = useDeckListData();

  const onBack = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div>Loading your decks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#F44336" }}>
        <div>Error loading decks: {error}</div>
        <button onClick={onBack}>Go Back</button>
      </div>
    );
  }

  if (!decks) {
    return <div>No decks available</div>;
  }

  return (
    // <DeckListView
    //   decks={decks}
    //   onCreateDeck={() => console.log("CREATE DECK")}
    //   onBack={onBack}
    // />
    <div>old</div>
  );

  // {/* Create Deck Modal */}
  //     {showCreateDeck && (
  //       <CreateDeckModal
  //         onClose={() => setShowCreateDeck(false)}
  //         onSave={async (deckData) => {
  //           const response = await DeckService.createDeck({
  //             ...deckData,
  //             userId: player.userId,
  //             createdAt: new Date(),
  //             totalCards: 0,
  //           });
  //           if (response.success && response.data) {
  //             addDeck(response.data);
  //             setShowCreateDeck(false);
  //           }
  //         }}
  //       />
  //     )}

  // // Individual deck view
  // return (
  //   <DeckDetailView
  //     deck={selectedDeck}
  //     cards={deckCards}
  //     onBack={() => {
  //       setSelectedDeck(null);
  //       setDeckCards([]);
  //     }}
  //     onCreateCard={() => setShowCreateCard(true)}
  //     onEditCard={setEditingCard}
  //     showCreateCard={showCreateCard}
  //     setShowCreateCard={setShowCreateCard}
  //     editingCard={editingCard}
  //     setEditingCard={setEditingCard}
  //     reloadCards={() => loadDeckCards(selectedDeck.id)}
  //     updateDeckCardCount={updateDeckCardCount}
  //   />
  // );
};

// Styles
export const buttonStyle: React.CSSProperties = {
  padding: "8px 16px",
  backgroundColor: "#2196F3",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "14px",
};

export const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid #ddd",
  borderRadius: "4px",
  fontSize: "14px",
  marginBottom: "15px",
  boxSizing: "border-box",
};

export const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

export const modalStyle: React.CSSProperties = {
  backgroundColor: "white",
  borderRadius: "8px",
  padding: "30px",
  maxWidth: "500px",
  width: "90%",
  maxHeight: "80vh",
  overflow: "auto",
};
