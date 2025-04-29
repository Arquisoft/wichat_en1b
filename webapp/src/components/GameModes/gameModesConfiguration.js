export const GameModesConfig = {
    CLASSICAL: {
        id: "classical",
        name: "Classical",
        description: "10 rounds, 60 seconds per question",
        timerMode: "perQuestion",
        timePerQuestion: 60,
        totalGameTime: null,
        maxRounds: 10,
        maxAIAttempts: 3,

        calculateScore: ({ isCorrect, streak }) => isCorrect ? 100 + streak * 10 : 0,

        shouldContinue: ({ round }) => round < 10,

        getInitialState: () => ({
            round: 1,
            timeLeft: 60,
            streak: 0,
            score: 0,
        }),

        getNextState: ({ current, isCorrect }) => ({
            round: current.round + 1,
            streak: isCorrect ? current.streak + 1 : 0,
            timeLeft: 60,
        })
    },

    TIMETRIAL: {
        id: "timeTrial",
        name: "Time Trial",
        description: "2 minutes to answer as many as possible",
        timerMode: "perGame",
        timePerQuestion: null,
        totalGameTime: 120,
        maxRounds: Infinity,
        maxAIAttempts: 3,

        calculateScore: ({ isCorrect }) => isCorrect ? 50 : 0,

        shouldContinue: ({ totalTimeLeft }) => totalTimeLeft > 0,

        getInitialState: () => ({
            timeLeft: null,
            totalTimeLeft: 120,
            score: 0,
        }),

        getNextState: ({ current, isCorrect }) => ({
            streak: isCorrect ? (current.streak || 0) + 1 : 0,
            totalTimeLeft: current.totalTimeLeft, // managed externally
        }),
    },

    SUDDENDEATH: {
        id: "suddenDeath",
        name: "Sudden Death",
        description: "1 question, 30 seconds to answer",
        timerMode: "perQuestion",
        timePerQuestion: 30,
        totalGameTime: null,
        maxRounds: Infinity,
        maxAIAttempts: 3,

        calculateScore: ({ isCorrect }) => isCorrect ? 100 : 0,

        shouldContinue: ({ isCorrect }) => isCorrect, // game ends on first wrong

        getInitialState: () => ({
            round: 1,
            timeLeft: 30,
            score: 0,
        }),

        getNextState: ({ current }) => ({
            round: current.round + 1,
            timeLeft: 30,
        }),
    },

    QOD: {
        id: "qod",
        name: "Question of the Day",
        description: "1 question, 30 seconds to answer",
        timerMode: "perQuestion",
        timePerQuestion: 30,
        totalGameTime: null,
        maxRounds: 1,
        maxAIAttempts: 3,

        calculateScore: ({ isCorrect }) => isCorrect ? 250 : 0,

        shouldContinue: ({ round }) => round < 1,

        getInitialState: () => ({
            round: 1,
            timeLeft: 30,
            score: 0,
        }),

        getNextState: () => null, // only one question
    },

    CUSTOM: {
        id: "custom",
        name: "Custom",
        description: "Custom game mode",
        timerMode: "perQuestion",
        timePerQuestion: 30,
        totalGameTime: null,
        maxRounds: 10,
        maxAIAttempts: 3,

        calculateScore: ({ isCorrect }) => isCorrect ? 75 : 0,

        shouldContinue: ({ round, maxRounds }) => !maxRounds || round < maxRounds,

        getInitialState: () => ({
            round: 1,
            timeLeft: 60,
            score: 0,
        }),

        getNextState: ({ current }) => ({
            round: current.round + 1,
            timeLeft: 60,
        }),
    }
};

