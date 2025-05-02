import { GameModesConfig } from "./gameModesConfiguration";

describe("CLASSICAL mode", () => {
    const classical = GameModesConfig.CLASSICAL;

    it("should calculate score correctly", () => {
        const score = classical.calculateScore({
            isCorrect: true,
            timeLeft: 30,
            AIAttempts: 1,
            streak: 4,
            round: 5,
        });
        expect(score).toBeGreaterThan(0);
    });

    it("should return initial state correctly", () => {
        const initialState = classical.getInitialState();
        expect(initialState).toEqual({
            round: 1,
            timeLeft: 60,
            streak: 0,
            score: 0,
        });
    });

    it("should determine if game should continue", () => {
        const shouldContinue = classical.shouldContinue({ round: 5, totalTimeLeft: 100, isCorrect: true });
        expect(shouldContinue).toBe(true);
    });
});

describe("TIMETRIAL mode", () => {
    const timeTrial = GameModesConfig.TIMETRIAL;

    it("should calculate score correctly", () => {
        const score = timeTrial.calculateScore({
            isCorrect: true,
            timeLeft: 60,
            AIAttempts: 0,
            totalTime: 120,
            streak: 3,
            fastAnswerStreak: 3,
        });
        expect(score).toBeGreaterThan(0);
    });

    it("should return initial state correctly", () => {
        const initialState = timeTrial.getInitialState();
        expect(initialState).toEqual({
            timeLeft: null,
            totalTimeLeft: 120,
            score: 0,
        });
    });

    it("should determine if game should continue", () => {
        const shouldContinue = timeTrial.shouldContinue({ round: 5, totalTimeLeft: 10, isCorrect: true });
        expect(shouldContinue).toBe(true);
    });
});

describe("QOD mode", () => {
    const qod = GameModesConfig.QOD;

    it("should calculate score correctly", () => {
        const score = qod.calculateScore({ isCorrect: true });
        expect(score).toBe(250);
    });

    it("should return initial state correctly", () => {
        const initialState = qod.getInitialState();
        expect(initialState).toEqual({
            round: 1,
            timeLeft: 30,
            score: 0,
        });
    });

    it("should determine if game should continue", () => {
        const shouldContinue = qod.shouldContinue({ round: 0 });
        expect(shouldContinue).toBe(true);
    });
});