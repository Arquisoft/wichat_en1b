import { createContext, useContext, useState, useEffect, useMemo } from "react";
import useTimer from "../hooks/useTimer";
import { useRounds } from "../hooks/useRounds";
import StatisticsUpdater from "./components/StatisticsUpdater";
import { getGameStrategy } from "../GameModes/strategyFactory";
import { useRef } from "react";

const GameContext = createContext();

export const GameProvider = ({ children, selectedModeId }) => {
    const [gameMode, setGameMode] = useState(selectedModeId || 'classical');
    const [question, setQuestion] = useState({ question: "Pregunta", images: [] });
    const [gameEnded, setGameEnded] = useState(false);
    const [questionType, setQuestionType] = useState("random");
    const [AIAttempts, setAIAttempts] = useState(0);
    const [maxAIAttempts, setMaxAIAttempts] = useState(0);
    const [statisticsUpdater, setStatisticsUpdater] = useState(new StatisticsUpdater(gameMode));
    const lastAnswerRef = useRef(true); // used in suddenDeath if needed
    const [clearMessages, setClearMessages] = useState(false);
    const [onTimeUpHandler, setOnTimeUpHandler] = useState(null);

    const [customSettings, setCustomSettings] = useState(() => {
        const savedSettings = localStorage.getItem('customSettings');
        return savedSettings ? JSON.parse(savedSettings) : { rounds: 5, timePerQuestion: 30, aiAttempts: 3 };
    });

    // Optionally, listen for changes in `localStorage`
    useEffect(() => {
        const handleStorageChange = () => {
            const savedSettings = localStorage.getItem('customSettings');
            if (savedSettings) {
                setCustomSettings(JSON.parse(savedSettings));
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const strategy = useMemo(() => {
        return getGameStrategy({
            gameMode,
            customOptions: customSettings,
            injectedRefs: { lastAnswerRef }
        });
    }, [gameMode, customSettings]);

    useEffect(() => {
        //console.log('Strategy recomputed:', strategy);
    }, [strategy]);

    // Timer setup
    const { timeLeft, isRunning, start, pause, reset, setInitialTime, initialTime } = useTimer({
        initialTimeParam: strategy.timerMode === 'perQuestion' ? strategy.timePerQuestion : strategy.totalGameTime,
        onTimeUp: () => handleTimeUp(),
        autoStart: false
    });

    const { round, nextRound, isGameEnded, resetRounds } = useRounds({
        maxRounds: strategy.maxRounds ?? 10,
        onRoundChange: () => handleRoundChange()
    });

    // 🎯 Handle gameMode changes
    useEffect(() => {
        setInitialTime(strategy.timerMode === 'perQuestion' ? strategy.timePerQuestion : strategy.totalGameTime);
        //console.log("GameProvider: setInitialTime", strategy.timerMode === 'perQuestion' ? strategy.timePerQuestion : strategy.totalGameTime);
        resetRounds();
        reset(strategy.timerMode === 'perQuestion' ? strategy.timePerQuestion : strategy.totalGameTime);
        setStatisticsUpdater(new StatisticsUpdater(gameMode));
        setMaxAIAttempts(strategy.maxAIAttempts || 0);
    }, [strategy]);

    // ⏰ When time is up
    const handleTimeUp = () => {
        if (strategy.timerMode === 'perQuestion') {
            if (isGameEnded()) {
                console.log("Game ended, no more rounds left.");
                setGameEnded(true);
                pause();
            } else {
                console.log("Time's up! Moving to the next round.");
                nextRound();
                reset(strategy.timePerRound);
            }
        } else {
            setGameEnded(true);
            pause();
        }

        if (onTimeUpHandler) {
            // this is to avoid calling the handler multiple times
            setTimeout(() => {
                onTimeUpHandler();
            }, 0);
        }
    };

    const handleRoundChange = () => {
        console.log("Round changed to:", round);
        if (strategy.id === 'suddenDeath') {
            console.log("Sudden Death mode: checking if game has ended.");
            if (strategy.hasEnded()) {
                console.log("Game ended, failed to answer the last question.");
                setGameEnded(true);
                pause();
            } else {
                console.log("Sudden Death mode: game continues.");
            }
        }
    }

    return (
        <GameContext.Provider value={{
            question, setQuestion,
            gameEnded, setGameEnded,
            questionType, setQuestionType,
            AIAttempts, setAIAttempts,
            maxAIAttempts, setMaxAIAttempts,
            round,
            nextRound,
            resetRounds,
            isGameEnded,
            timeLeft,
            isRunning,
            startTimer: start,
            pauseTimer: pause,
            resetTimer: reset,
            initialTime,
            gameMode,
            setGameMode,
            strategy,
            clearMessages,
            setClearMessages,
            setOnTimeUpHandler,
            customSettings,
            setCustomSettings
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
