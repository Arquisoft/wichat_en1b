import StatisticsUpdater from "../../Game/components/StatisticsUpdater";

export const createCustomStrategy = ({ customOptions = {} }) => ({
    id: "custom",
    name: "Custom",
    description: "Custom game mode",
    timerMode: "perQuestion",
    timePerQuestion: customOptions.timePerQuestion || 30,
    totalGameTime: null,
    maxRounds: customOptions.rounds || 10,
    maxAIAttempts: customOptions.aiAttempts || 3,
    statisticsUpdater: new StatisticsUpdater("custom"),

    calculateScore: ({ isCorrect }) => (isCorrect ? 75 : 0),

    shouldContinue: ({ round }) => round < (customOptions.rounds || 10),  // Fix: use customOptions.rounds
    
    getInitialState: () => ({
        round: 1,
        timeLeft: customOptions.timePerQuestion || 30,  // Fix: use customOptions.timePerQuestion
        score: 0,
    }),

    getNextState: ({ current }) => ({
        round: current.round + 1,
        timeLeft: customOptions.timePerQuestion || 30,  // Fix: use customOptions.timePerQuestion
    }),
});

