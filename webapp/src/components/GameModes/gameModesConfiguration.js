import StatisticsUpdater from "../Game/components/StatisticsUpdater";

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
        statisticsUpdater: new StatisticsUpdater("classical"),

        calculateScore({ isCorrect, timeLeft, AIAttempts, streak, round }) {
            if (!isCorrect) return 0;
        
            const BASE_SCORE = 1000;
            const MAX_TIME_PENALTY = 600;
            const MAX_TIME = 30; // or strategy.timePerQuestion
            const AI_PENALTY_PER_USE = 100;
        
            const timePenalty = ((MAX_TIME - timeLeft) * MAX_TIME_PENALTY) / MAX_TIME;
            const aiPenalty = AIAttempts * AI_PENALTY_PER_USE;
            const streakBonus = streak >= 3 ? 50 + (streak - 3) * 15 : 0;
            const finalScore = BASE_SCORE - timePenalty - aiPenalty + streakBonus;
        
            return Math.max(0, Math.floor(finalScore));
        },
        shouldContinue: ({ round, totalTimeLeft, isCorrect }) => round < 10,

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
        totalGameTime: 60,
        maxRounds: Infinity,
        maxAIAttempts: 3,
        statisticsUpdater: new StatisticsUpdater("timeTrial"),

        calculateScore({ 
            isCorrect, 
            timeLeft, 
            AIAttempts, 
            totalTime = 120, 
            streak = 0, 
            fastAnswerStreak = 0 
        }) {
            if (!isCorrect) return 0;
        
            const BASE_POINTS = 1000;
            const TIME_PENALTY_MAX = 600;
            const AI_PENALTY_PER_USE = 100;
        
            const timePenalty = ((totalTime - timeLeft) * TIME_PENALTY_MAX) / totalTime;
            const aiPenalty = AIAttempts * AI_PENALTY_PER_USE;
        
            const streakBonus = streak >= 3 ? 50 + (streak - 3) * 15 : 0;
            const fastStreakBonus = fastAnswerStreak >= 3 ? 50 : 0;
        
            const finalScore = BASE_POINTS - timePenalty - aiPenalty + streakBonus + fastStreakBonus;
        
            return Math.max(0, Math.floor(finalScore));
        },

        shouldContinue: ({ round, totalTimeLeft, isCorrect }) => totalTimeLeft > 0,

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

    //    SUDDENDEATH: {
    //        id: "suddenDeath",
    //        name: "Sudden Death",
    //        description: "1 question, 30 seconds to answer",
    //        timerMode: "perQuestion",
    //        timePerQuestion: 30,
    //        totalGameTime: null,
    //        maxRounds: Infinity,
    //        maxAIAttempts: 3,
    //        statisticsUpdater: new StatisticsUpdater("suddenDeath"),
    //        lastAnswer: true,
//
    //        calculateScore({ isCorrect, timeLeft, AIAttempts }) {
    //            if (!isCorrect) return 0;
    //            return Math.max(
    //                0,
    //                Math.floor(
    //                    1000 - ((this.timePerQuestion - timeLeft) * 600 / this.timePerQuestion) - AIAttempts * 100
    //                )
    //            );
    //        },
//
    //        shouldContinue({ round, totalTimeLeft, isCorrect }) {
    //            this.lastAnswer = isCorrect;
    //            return isCorrect;
    //        },
//
    //        hasEnded() { return !this.lastAnswer },
//
    //        getInitialState: () => ({
    //            round: 1,
    //            timeLeft: 30,
    //            score: 0,
    //        }),
//
    //        getNextState: ({ current }) => ({
    //            round: current.round + 1,
    //            timeLeft: 30,
    //        }),
    //    },
//
    QOD: {
        id: "qod",
        name: "Question of the Day",
        description: "1 question, 30 seconds to answer",
        timerMode: "perQuestion",
        timePerQuestion: 30,
        totalGameTime: null,
        maxRounds: 1,
        maxAIAttempts: 3,
        statisticsUpdater: new StatisticsUpdater("qod"),

        calculateScore: ({ isCorrect }) => isCorrect ? 250 : 0,

        shouldContinue: ({ round }) => round < 1,

        getInitialState: () => ({
            round: 1,
            timeLeft: 30,
            score: 0,
        }),

        getNextState: () => null, // only one question
    },
//
    //CUSTOM: {
    //    id: "custom",
    //    name: "Custom",
    //    description: "Custom game mode",
    //    timerMode: "perQuestion",
    //    timePerQuestion: 30,
    //    totalGameTime: null,
    //    maxRounds: 10,
    //    maxAIAttempts: 3,
    //    statisticsUpdater: new StatisticsUpdater("custom"),
//
    //    calculateScore: ({ isCorrect }) => isCorrect ? 75 : 0,
//
    //    shouldContinue: ({ round, timeLeft, isCorrect }) => !this.maxRounds || round < this.maxRounds,
//
    //    getInitialState: () => ({
    //        round: 1,
    //        timeLeft: this.timePerQuestion,
    //        score: 0,
    //    }),
//
    //    getNextState: ({ current }) => ({
    //        round: current.round + 1,
    //        timeLeft: 60,
    //    }),
    //}
};

