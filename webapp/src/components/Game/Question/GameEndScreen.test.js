import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { GameEndScreen } from "./GameEndScreen";

class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;

jest.mock("react-router-dom", () => {
    const useLocationMock = jest.fn();
    return {
        ...jest.requireActual("react-router-dom"),
        useLocation: useLocationMock
    };
});

describe("GameEndScreen", () => {
    let useLocationMock;

    beforeEach(() => {
        useLocationMock = require("react-router-dom").useLocation;
    });

    it("should navigate to /game-modes if no data is provided", () => {
        useLocationMock.mockReturnValue({ state: {} });

        render(
            <MemoryRouter>
                <GameEndScreen />
            </MemoryRouter>
        );

        // Use a function matcher to handle text broken into multiple elements
        expect(
            screen.queryByText((content, element) => {
                return element?.textContent?.includes("Game Ended");
            })
        ).not.toBeInTheDocument();
    });

    it("should display the correct data when provided", () => {
        useLocationMock.mockReturnValue({ state: { data: {
            score: 5000,
            questionsAnswered: 10,
            correctAnswers: 5,
            incorrectAnswers: 3
        }}});

        render(
            <MemoryRouter>
                <GameEndScreen />
            </MemoryRouter>
        );

        expect(screen.getByText("💯 Total Score: 5000")).toBeInTheDocument();
        expect(screen.getByText("🔢 Rounds: 10")).toBeInTheDocument();
        expect(screen.getByText("✅ Correct: 5")).toBeInTheDocument();
        expect(screen.getByText("❌ Incorrect: 3")).toBeInTheDocument();
        expect(screen.getByText("Play again")).toBeInTheDocument();
        expect(screen.getByText("Menu")).toBeInTheDocument();
    });
});