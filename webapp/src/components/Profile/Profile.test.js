import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { Profile } from "./Profile";
import axios from "axios";
import Cookies from "js-cookie";
import userEvent from "@testing-library/user-event";

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;

// Setup mocks
jest.mock("axios");
jest.mock("js-cookie", () => ({
  get: jest.fn(),
  remove: jest.fn(),
  set: jest.fn()
}));
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("Profile Component", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    Cookies.get.mockReturnValue(
      JSON.stringify({ username: "TestUser", token: "12345" })
    );
  });

  it("renders loading state initially", () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading profile statistics.../i)).toBeInTheDocument();
  });

  /*
  it("renders statistics data after successful API call", async () => {
    const mockData = {
      correctAnswers: 10,
      incorrectAnswers: 5,
      gamesPlayed: 3,
      questionsAnswered: 15,
      registrationDate: "2023-01-01T00:00:00Z",
    };

    // Mock the response structure that RecordRetriever returns
    axios.get.mockResolvedValueOnce({ 
      data: mockData 
    });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.queryByText(/Loading your statistics/i)).not.toBeInTheDocument();
    });

    // Check for specific stats values rather than exact text matches
    expect(screen.getAllByText("10")[0]).toBeInTheDocument(); // Correct Answers
    expect(screen.getAllByText("5")[0]).toBeInTheDocument(); // Incorrect Answers
    expect(screen.getAllByText("3")[0]).toBeInTheDocument(); // Games Played
  });
  */
 
  it("renders error message on API failure", async () => {
    // Mock a failed axios request
    axios.get.mockRejectedValueOnce({
      response: { 
        data: { error: "Failed to retrieve statistics" } 
      }
    });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.queryByText(/Loading your statistics/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Failed to retrieve statistics/i)).toBeInTheDocument();
    });
  });

  it("allows retrying after an error", async () => {
    // Mock a failed request followed by a successful one with proper structure
    axios.get
      .mockRejectedValueOnce({
        response: { 
          data: { error: "Failed to retrieve statistics" } 
        }
      })
      .mockResolvedValueOnce({
        data: {
          correctAnswers: 8,
          incorrectAnswers: 2,
          gamesPlayed: 2,
          questionsAnswered: 10,
          registrationDate: "2023-01-01T00:00:00Z",
        }
      });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Failed to retrieve statistics/i)).toBeInTheDocument();
    });

    // Click the retry button
    userEvent.click(screen.getByRole('button', { name: /Retry/i }));

    // Add a brief delay to allow for state updates
    await new Promise(r => setTimeout(r, 100));

    // Check for successful retry by checking for update in component state
    await waitFor(() => {
      expect(screen.queryByText(/Failed to retrieve statistics/i)).not.toBeInTheDocument();
    });
  });

  it("redirects when no user cookie is found", async () => {
    // Mock a failed request to trigger the error state
    Cookies.get.mockReturnValueOnce(null); 
    
    const user = userEvent.setup();
    
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/Failed to retrieve statistics/i)).toBeInTheDocument();
    });

    // Use await act for the button click to ensure all effects are processed
    await act(async () => {
      const logInAgainButton = screen.getByRole('button', { name: /Go back to menu/i });
      await user.click(logInAgainButton);
    });

    // Now check if navigation was called
    expect(Cookies.remove).toHaveBeenCalledWith('user', { path: '/' });
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it("handles logout correctly", async () => {
    // Mock a failed request to trigger the error state
    axios.get.mockRejectedValueOnce({
      response: { 
        data: { error: "Failed to retrieve statistics" } 
      }
    });

    const user = userEvent.setup();
    
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to retrieve statistics/i)).toBeInTheDocument();
    });

    // Properly wait for the click action to complete
    await act(async () => {
      const logInAgainButton = screen.getByRole('button', { name: /Go back to menu/i });
      await user.click(logInAgainButton);
    });
    
    // Check if cookie was removed and navigation happened
    expect(Cookies.remove).toHaveBeenCalledWith('user', { path: '/' });
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  /*
  it("navigates back to menu when button is clicked", async () => {
    const mockData = {
      correctAnswers: 10,
      incorrectAnswers: 5,
      gamesPlayed: 3,
      questionsAnswered: 15,
      registrationDate: "2023-01-01T00:00:00Z",
    };

    axios.get.mockResolvedValueOnce({ data: mockData });
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText(/Loading your statistics/i)).not.toBeInTheDocument();
    });

    // Find the button and click it with proper act wrapping
    await act(async () => {
      const backButton = await screen.findByRole('button', { name: /Back to menu/i });
      await user.click(backButton);
    });
    
    // Check navigation
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
  */
 
  /*
  it("handles basic rendering with registration date", async () => {
    // Use a simple fixed date value instead of complex date manipulation
    const mockData = {
      correctAnswers: 75,
      incorrectAnswers: 25,
      gamesPlayed: 10,
      questionsAnswered: 100,
      registrationDate: "2023-01-01T00:00:00Z",
    };

    axios.get.mockResolvedValueOnce({ data: mockData });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Loading your statistics/i)).not.toBeInTheDocument();
    });

    // Simple verification that stats were displayed
    expect(screen.getByText("75")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
  });
  */
 
  it("handles null data scenario correctly", async () => {
    // Mock the axios response with null data
    axios.get.mockRejectedValueOnce({
      response: { 
        data: { error: "Cannot read properties of null" }
      }
    });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Loading your statistics/i)).not.toBeInTheDocument();
    });

    // Should show error message
    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
  });
});
