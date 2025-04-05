import { createContext, useContext, useState } from "react";

const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const [question, setQuestion] = useState({ question: "Pregunta", images: [] });
    const [gameEnded, setGameEnded] = useState(null);
    const [questionType, setQuestionType] = useState("random");

    return (
        <GameContext.Provider value={{ question, setQuestion, gameEnded, setGameEnded, questionType, setQuestionType }}>
            {children}
        </GameContext.Provider>
    )
}

export const useGame = () => useContext(GameContext);