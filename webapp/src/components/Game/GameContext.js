import { createContext, useContext, useState } from "react";

const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const [question, setQuestion] = useState({ question: "Pregunta", images: [] });
    const [gameEnded, setGameEnded] = useState(null);
    const [questionType, setQuestionType] = useState("random");
    const [AIAttempts, setAIAttempts] = useState(0); // Track AI attempts
    const [maxAIAttempts, setMaxAIAttempts] = useState(0); // Track max AI attempts
    

    return (
        <GameContext.Provider value={{ question, setQuestion, gameEnded, setGameEnded, questionType, setQuestionType, AIAttempts, setAIAttempts, maxAIAttempts, setMaxAIAttempts }}>
            {children}
        </GameContext.Provider>
    )
}

export const useGame = () => useContext(GameContext);