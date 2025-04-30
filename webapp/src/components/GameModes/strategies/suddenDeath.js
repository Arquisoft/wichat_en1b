import StatisticsUpdater from "../../Game/components/StatisticsUpdater";

export const createSuddenDeathStrategy = ({lastAnswerRef = true}) => ({
    id: "suddenDeath",
    name: "Sudden Death",
    description: "1 question, 30 seconds to answer",
    timerMode: "perQuestion",
    timePerQuestion: 30,
    totalGameTime: null,
    maxRounds: Infinity,
    maxAIAttempts: 3,
    statisticsUpdater: new StatisticsUpdater("suddenDeath"),

    calculateScore({ isCorrect, timeLeft, AIAttempts, round, totalTime = 30 }) {
        if (!isCorrect) return 0;
    
        const BASE_POINTS = 1000;
        const BASE_TIME_PENALTY = 600;
        const BASE_AI_PENALTY = 100;
    
        const roundBonus = (round - 1) * 50;
        const baseScore = BASE_POINTS + roundBonus;
    
        const dynamicTimePenaltyMax = BASE_TIME_PENALTY + roundBonus;
        const timePenalty = ((totalTime - timeLeft) * dynamicTimePenaltyMax) / totalTime;
    
        const aiPenaltyPerUse = BASE_AI_PENALTY + roundBonus / 3;
        const aiPenalty = AIAttempts * aiPenaltyPerUse;
    
        const finalScore = baseScore - timePenalty - aiPenalty;
    
        return Math.max(0, Math.floor(finalScore));
    },
    

    shouldContinue({ isCorrect }) {
        lastAnswerRef.current = isCorrect;
        return isCorrect;
    },

    hasEnded() {
        return !lastAnswerRef.current;
    },

    getInitialState: () => ({
        round: 1,
        timeLeft: 30,
        score: 0,
    }),

    getNextState: ({ current }) => ({
        round: current.round + 1,
        timeLeft: 30,
    }),
});
