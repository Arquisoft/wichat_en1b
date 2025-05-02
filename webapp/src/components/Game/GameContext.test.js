import { renderHook, act } from "@testing-library/react";
import { GameProvider, useGame } from "./GameContext";

describe("GameContext - Functionality Tests", () => {
    it("initializes with default values", () => {
        const { result } = renderHook(() => useGame(), {
            wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
        });

        expect(result.current.question).toEqual({ question: "Pregunta", images: [] });
        expect(result.current.gameMode).toBe("classical");
        expect(result.current.round).toBe(1);
        expect(result.current.isGameEnded()).toBe(false);
    });

    it("updates question and game mode", () => {
        const { result } = renderHook(() => useGame(), {
            wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
        });

        act(() => {
            result.current.setQuestion({ question: "Updated Question", images: [] });
        });
        expect(result.current.question).toEqual({ question: "Updated Question", images: [] });

        act(() => {
            result.current.setGameMode("suddenDeath");
        });
        expect(result.current.gameMode).toBe("suddenDeath");
    });

    it("handles rounds correctly", () => {
        const { result } = renderHook(() => useGame(), {
            wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
        });

        act(() => {
            result.current.nextRound();
        });
        expect(result.current.round).toBe(2);

        act(() => {
            result.current.resetRounds();
        });
        expect(result.current.round).toBe(1);
    });

    it("manages timer functionality", () => {
        jest.useFakeTimers();

        const { result } = renderHook(() => useGame(), {
            wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
        });

        act(() => {
            result.current.startTimer();
        });

        act(() => {
            jest.advanceTimersByTime(1000);
        });
        expect(result.current.timeLeft).toBeLessThan(result.current.initialTime);

        act(() => {
            result.current.pauseTimer();
        });

        act(() => {
            jest.advanceTimersByTime(1000);
        });
        expect(result.current.timeLeft).toBeLessThan(result.current.initialTime);

        act(() => {
            result.current.resetTimer(60);
        });
        expect(result.current.timeLeft).toBe(60);

        jest.useRealTimers();
    });
});

describe("GameContext - handleRoundChange", () => {
    it("handles round change correctly in suddenDeath mode", () => {
        const { result } = renderHook(() => useGame(), {
            wrapper: ({ children }) => <GameProvider selectedModeId="suddenDeath">{children}</GameProvider>,
        });

        act(() => {
            result.current.strategy.hasEnded = jest.fn(() => true);
            result.current.nextRound();
        });

        expect(result.current.gameEnded).toBe(true);
        expect(result.current.strategy.hasEnded).toHaveBeenCalled();
    });
});

describe("GameContext - Storage Event Handling", () => {
    it("updates custom settings when storage event is triggered", () => {
        const mockSettings = { theme: "dark", difficulty: "hard" };
        localStorage.setItem("customSettings", JSON.stringify(mockSettings));

        const { result } = renderHook(() => useGame(), {
            wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
        });

        act(() => {
            const storageEvent = new StorageEvent("storage", {
                key: "customSettings",
                newValue: JSON.stringify(mockSettings),
            });
            window.dispatchEvent(storageEvent);
        });

        expect(result.current.customSettings).toEqual(mockSettings);
    });
});