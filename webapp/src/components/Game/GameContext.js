import { createContext, useContext, useState, useEffect, useMemo } from "react";
import useTimer from "../hooks/useTimer";
import { useRounds } from "../hooks/useRounds";
import { GameModesConfig } from "../GameModes/gameModesConfiguration";
import StatisticsUpdater from "./components/StatisticsUpdater";

const GameContext = createContext();

export const GameProvider = ({ children, selectedModeId }) => {
    console.log("GameProvider: selectedModeId", selectedModeId);
    const [gameMode, setGameMode] = useState(selectedModeId || 'classical');
    console.log("GameProvider: gameMode", gameMode);
    const [question, setQuestion] = useState({ question: "Pregunta", images: [] });
    const [gameEnded, setGameEnded] = useState(false);
    const [questionType, setQuestionType] = useState("random");
    const [AIAttempts, setAIAttempts] = useState(0);
    const [maxAIAttempts, setMaxAIAttempts] = useState(0);
    const [statisticsUpdater, setStatisticsUpdater] = useState(new StatisticsUpdater(gameMode));

    const [customSettings] = useState(() => {
        return JSON.parse(localStorage.getItem('customSettings')) || {
            rounds: 5,
            timePerQuestion: 30,
            aiAttempts: 3,
        };
    });

    // 🧠 Strategy depends on selected game mode and custom settings
    const strategy = useMemo(() => {
        const mode = (gameMode || 'CLASSICAL').toUpperCase();
        const config = GameModesConfig[mode] || GameModesConfig.CLASSICAL;
        const base = { ...config };
    
        if (gameMode === 'custom') {
            base.maxRounds = customSettings.rounds || 5;
            base.timePerQuestion = customSettings.timePerQuestion || 30;
            base.maxAIAttempts = customSettings.aiAttempts || 3;
            base.timerMode = 'perQuestion';
        }
        return base;
    }, [
        gameMode,
        customSettings.rounds,
        customSettings.timePerQuestion,
        customSettings.aiAttempts
    ]);

    useEffect(() => {
        console.log('Strategy recomputed:', strategy);
    }, [strategy]);

    // Timer setup
    const { timeLeft, isRunning, start, pause, reset, setInitialTime, initialTime } = useTimer({
        initialTimeParam: strategy.timerMode === 'perQuestion' ? strategy.timePerQuestion : strategy.totalGameTime,
        onTimeUp: () => handleTimeUp(),
        autoStart: false
    });

    const { round, nextRound, isGameEnded, resetRounds } = useRounds(strategy.maxRounds ?? 10);

    // 🎯 Handle gameMode changes
    useEffect(() => {
        setInitialTime(strategy.timerMode === 'perQuestion' ? strategy.timePerQuestion : strategy.totalGameTime);
        console.log("GameProvider: setInitialTime", strategy.timerMode === 'perQuestion' ? strategy.timePerQuestion : strategy.totalGameTime);
        resetRounds();
        reset(strategy.timerMode === 'perQuestion' ? strategy.timePerQuestion : strategy.totalGameTime);
        setStatisticsUpdater(new StatisticsUpdater(gameMode));
        setMaxAIAttempts(strategy.maxAIAttempts || 0);

        if (strategy.timerMode === 'perGame') {
            start();
        }
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
                start();
            }
        } else {
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
            initialTime,
            gameMode,
            setGameMode,
            statisticsUpdater,
            strategy,
        }}>
            {strategy ? (
                <p>Strategy: {strategy.id} {strategy.name}</p>
            ) : (
                <p>Strategy is loading...</p>
            )}
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
