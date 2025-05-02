// Mock ResizeObserver
class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}

window.ResizeObserver = ResizeObserver;

import { render, screen } from "@testing-library/react";
import { Insights } from "./Insights";

describe("Insights Component", () => {
    const mockStatistics = {
        correctAnswers: 80,
        incorrectAnswers: 20,
        gamesPlayed: 10,
        questionsAnswered: 100,
        maxScore: 50,
        maxCorrectAnswers: 15
    };

    const mockRegistrationDate = new Date("2023-01-01");

    it("renders the title correctly", () => {
        render(<Insights statistics={mockStatistics} registrationDate={mockRegistrationDate} title="Test Title" type="test" />);
        expect(screen.getByText("Test Title")).toBeInTheDocument();
    });

    it("calculates and displays the success rate correctly", () => {
        render(<Insights statistics={mockStatistics} registrationDate={mockRegistrationDate} title="Test Title" type="test" />);
        expect(screen.getAllByText("80.0%")).toHaveLength(2);
    });

    it("calculates and displays the average questions per game correctly", () => {
        render(<Insights statistics={mockStatistics} registrationDate={mockRegistrationDate} title="Test Title" type="test" />);
        expect(screen.getByText("10")).toBeInTheDocument();
    });
});