import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Statistics } from "./Statistics";
import Cookies from "js-cookie";
import RecordRetriever from "./RecordRetriever";
import { useNavigate } from "react-router-dom";

jest.mock("js-cookie");
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));
jest.mock("./RecordRetriever");

describe("Statistics Component", () => {
  const mockNavigate = jest.fn();
  const mockGetRecords = jest.fn();
  const mockUserCookie = JSON.stringify({ token: "fake-jwt-token" });

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    Cookies.get.mockReturnValue(mockUserCookie);
    RecordRetriever.mockImplementation(() => ({
      getRecords: mockGetRecords,
    }));

    // Default valid statistics data
    mockGetRecords.mockResolvedValue({
      statsData: {
        correctAnswers: 50,
        incorrectAnswers: 50,
        questionsAnswered: 100,
        gamesPlayed: 10,
        registrationDate: "2024-01-01T00:00:00.000Z",
      },
      username: "TestUser",
    });
  });

  test("renders loading state initially", async () => {
    render(<Statistics />);
    expect(screen.getByText("Loading your statistics...")).toBeInTheDocument();
  });

  test("renders statistics correctly after loading", async () => {
    render(<Statistics />);
    await waitFor(() => expect(screen.getByText("TestUser's Statistics")).toBeInTheDocument());
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  test("shows error message when fetching statistics fails", async () => {
    mockGetRecords.mockRejectedValue(new Error("Failed to fetch statistics"));
    render(<Statistics />);
    await waitFor(() => expect(screen.getByText("Failed to fetch statistics")).toBeInTheDocument());
  });

  test("retry button reloads the statistics", async () => {
    mockGetRecords.mockRejectedValueOnce(new Error("Failed to fetch statistics"))
      .mockResolvedValueOnce({
        statsData: {
          correctAnswers: 75,
          incorrectAnswers: 25,
          questionsAnswered: 100,
          gamesPlayed: 20,
          registrationDate: "2024-01-01T00:00:00.000Z",
        },
        username: "TestUser",
      });

    render(<Statistics />);
    await waitFor(() => expect(screen.getByText("Failed to fetch statistics")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Retry"));
    await waitFor(() => expect(screen.getByText("75")).toBeInTheDocument()); // Updated correctAnswers
  });

  test("log in again button clears cookies and navigates to login", async () => {
    mockGetRecords.mockRejectedValue(new Error("Failed to fetch statistics"));
    render(<Statistics />);
    await waitFor(() => expect(screen.getByText("Failed to fetch statistics")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Log In Again"));
    expect(Cookies.remove).toHaveBeenCalledWith("user", { path: "/" });
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  test("back to menu button navigates to home page", async () => {
    render(<Statistics />);
    await waitFor(() => expect(screen.getByText("TestUser's Statistics")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Back to menu"));
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
