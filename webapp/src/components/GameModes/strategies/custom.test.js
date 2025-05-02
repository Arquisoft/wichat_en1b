import { createCustomStrategy } from "./custom";

describe("createCustomStrategy", () => {
    const defaultOptions = {
        timePerQuestion: 30,
        rounds: 10,
        aiAttempts: 3,
    };

    it("should create a strategy with default options", () => {
        const strategy = createCustomStrategy({});

        expect(strategy.id).toBe("custom");
        expect(strategy.name).toBe("Custom");
        expect(strategy.description).toBe("Custom game mode");
        expect(strategy.timerMode).toBe("perQuestion");
        expect(strategy.timePerQuestion).toBe(defaultOptions.timePerQuestion);
        expect(strategy.maxRounds).toBe(defaultOptions.rounds);
        expect(strategy.maxAIAttempts).toBe(defaultOptions.aiAttempts);
    });

    it("should override default options with custom options", () => {
        const customOptions = {
            timePerQuestion: 20,
            rounds: 5,
            aiAttempts: 2,
        };

        const strategy = createCustomStrategy({ customOptions });

        expect(strategy.timePerQuestion).toBe(customOptions.timePerQuestion);
        expect(strategy.maxRounds).toBe(customOptions.rounds);
        expect(strategy.maxAIAttempts).toBe(customOptions.aiAttempts);
    });

    it("should calculate score correctly", () => {
        const strategy = createCustomStrategy({});

        expect(strategy.calculateScore({ isCorrect: true })).toBe(75);
        expect(strategy.calculateScore({ isCorrect: false })).toBe(0);
    });

    it("should determine if the game should continue", () => {
        const customOptions = { rounds: 5 };
        const strategy = createCustomStrategy({ customOptions });

        expect(strategy.shouldContinue({ round: 3 })).toBe(true);
        expect(strategy.shouldContinue({ round: 5 })).toBe(false);
    });

    it("should return the correct initial state", () => {
        const customOptions = { timePerQuestion: 20 };
        const strategy = createCustomStrategy({ customOptions });

        const initialState = strategy.getInitialState();

        expect(initialState.round).toBe(1);
        expect(initialState.timeLeft).toBe(customOptions.timePerQuestion);
        expect(initialState.score).toBe(0);
    });

    it("should calculate the next state correctly", () => {
        const customOptions = { timePerQuestion: 20 };
        const strategy = createCustomStrategy({ customOptions });

        const currentState = { round: 1, timeLeft: 20 };
        const nextState = strategy.getNextState({ current: currentState });

        expect(nextState.round).toBe(2);
        expect(nextState.timeLeft).toBe(customOptions.timePerQuestion);
    });
});