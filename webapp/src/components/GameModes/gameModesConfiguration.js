export const GameModesConfig = {
    CLASSICAL: {
        id: "classical",
        name: "Classical",
        description: "10 rounds, 60 seconds per question",
        timePerQuestion: 60,    // seconds
        totalGameTime: null,    // no total timer
        maxRounds: 10
    },
    TIMETRIAL: {
        id: "timeTrial",
        name: "Time Trial",
        description: "2 minutes to answer as many as possible",
        timePerQuestion: null,
        totalGameTime: 120,     // seconds
        maxRounds: Infinity         // no round limit
    },
    SUDDEN_DEATH: {
        id: "suddenDeath",
        name: "Sudden Death",
        description: "1 question, 30 seconds to answer",
        timePerQuestion: 30,    // seconds
        totalGameTime: null,    // no total timer
        maxRounds: Infinity     // no round limit
    }, 
    QOD: {
        id: "qod",
        name: "Question of the Day",
        description: "1 question, 30 seconds to answer",
        timePerQuestion: 30,    // seconds
        totalGameTime: null,    // no total timer
        maxRounds: 1     // no round limit
    },
    CUSTOM: {
        id: "custom",
        name: "Custom",
        description: "Custom game mode",
        timePerQuestion: null,
        totalGameTime: null,    // no total timer
        maxRounds: null         // no round limit
    },
};
