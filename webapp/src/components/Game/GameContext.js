import { createContext, useContext, useState } from "react";

const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const [question, setQuestion] = useState({ question: "Pregunta", images: [] });
    const [gameEnded, setGameEnded] = useState(null);
    const [questionType, setQuestionType] = useState("random");
    const [AIAttempts, setAIAttempts] = useState(0); // Track AI attempts
    const maxAIAttempts = 3; // Maximum AI attempts before showing the correct answer


    return (
        <GameContext.Provider value={{ question, setQuestion, gameEnded, setGameEnded, questionType, setQuestionType, AIAttempts, setAIAttempts, maxAIAttempts }}>
            {children}
        </GameContext.Provider>
    )
}

export const useGame = () => useContext(GameContext);