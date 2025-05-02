import { render, screen } from "@testing-library/react";
import StatisticsSummary from "./StatisticsSummary";

describe("StatisticsSummary", () => {
  const mockStatistics = {
    gamesPlayed: 10,
    questionsAnswered: 50,
    correctAnswers: 40,
    incorrectAnswers: 10,
  };

  const mockSuccessRate = 80;

  const renderComponent = () =>
    render(
      <StatisticsSummary statistics={mockStatistics} successRate={mockSuccessRate} />
    );

  it("renders performance title", () => {
    renderComponent();
    expect(screen.getByText("Performance Summary")).toBeInTheDocument();
  });

  it("displays the correct success rate", () => {
    renderComponent();
    expect(screen.getByText(`${mockSuccessRate.toFixed(1)}%`)).toBeInTheDocument();
  });

  it("displays the correct statistics values", () => {
    renderComponent();
    expect(screen.getAllByText(mockStatistics.gamesPlayed, { selector: 'h6' })).toHaveLength(2); // Appears twice
    expect(screen.getByText(mockStatistics.questionsAnswered, { selector: 'h6' })).toBeInTheDocument();
    expect(screen.getByText(mockStatistics.correctAnswers, { selector: 'h6' })).toBeInTheDocument();
    expect(screen.getAllByText(mockStatistics.incorrectAnswers, { selector: 'h6' })).toHaveLength(2); // Appears twice
  });
});