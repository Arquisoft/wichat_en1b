import { createContext, useContext, useState } from "react";

const GameContext = createContext();

export const GameProvider = ( {children} ) => {
    const [question, setQuestion] = useState({question: "Pregunta", images: []});
    const [gameEnded, setGameEnded] = useState(null);

    return (
        <GameContext.Provider value={{ question, setQuestion, gameEnded, setGameEnded }}>
            { children }
        </GameContext.Provider>
    )
}

export const useGame = () => useContext(GameContext);