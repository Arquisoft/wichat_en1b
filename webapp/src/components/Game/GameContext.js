import { createContext, useContext, useState, useEffect } from "react";
import useTimer from "../hooks/useTimer";
import { useRounds } from "../hooks/useRounds";
import { GameModesConfig } from "../GameModes/gameModesConfiguration";
import StatisticsUpdater from "./components/StatisticsUpdater";

const GameContext = createContext();

export const GameProvider = ({ children, type }) => {
    const [question, setQuestion] = useState({ question: "Pregunta", images: [] });
    const [gameEnded, setGameEnded] = useState(false);
    const [questionType, setQuestionType] = useState("random");
    const [AIAttempts, setAIAttempts] = useState(0);
    const [maxAIAttempts, setMaxAIAttempts] = useState(0);

    const [gameMode, setGameMode] = useState(type || 'classical');
    const [statisticsUpdater, setStatisticsUpdater] = useState(null);

    // Default fallback times (can be overwritten on gameMode change)
    const { timeLeft, isRunning, start, pause, reset } = useTimer({ 
        initialTime: 60, 
        onTimeUp: () => handleTimeUp(),
        autoStart: false 
    });

    const { round, nextRound, isGameEnded, resetRounds } = useRounds(10); // Default maxRounds = 10, will update later

    // Updates when gameMode changes
    useEffect(() => {
        if (!gameMode) return;

        const config = GameModesConfig[gameMode];
        if (!config) {
            console.error("Unknown game mode:", gameMode);
            return;
        }

        resetRounds(); // reset to round 1
        reset(config.timerMode === 'perQuestion' ? config.timePerRound : config.timePerGame);
        setStatisticsUpdater(new StatisticsUpdater(gameMode));
        setMaxAIAttempts(config.maxAIAttempts || 0);

        if (config.timerMode === 'perGame') {
            start(); // Start immediately if perGame
        }

    }, [gameMode]);

    // Handle what happens when timer finishes
    const handleTimeUp = () => {
        const config = GameModesConfig[gameMode];
        if (!config) return;

        if (config.timerMode === 'perQuestion') {
            if (isGameEnded()) {
                setGameEnded(true);
                pause();
            } else {
                nextRound();
                reset(config.timePerRound);
                start();
            }
        } else {
            // PerGame -> full game timer ran out
            setGameEnded(true);
            pause();
        }
    };

    return (
        <GameContext.Provider value={{
            question, setQuestion,
            gameEnded, setGameEnded,
            questionType, setQuestionType,
            AIAttempts, setAIAttempts,
            maxAIAttempts, setMaxAIAttempts,
            round,
            nextRound,
            isGameEnded,
            timeLeft,
            isRunning,
            startTimer: start,
            pauseTimer: pause,
            resetTimer: reset,
            gameMode,
            setGameMode,
            statisticsUpdater,
        }}>
            <p>GameMode: {gameMode}</p>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
