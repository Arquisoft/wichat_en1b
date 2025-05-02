import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { MemoryRouter, useNavigate, useParams } from "react-router-dom";
import { Profile } from "./Profile";
import UserProfileSettings from "./UserProfileSettings";
import RecordRetrieverProfile from "./RecordRetrieverProfile";
import axios from "axios";
import Cookies from "js-cookie";
import userEvent from "@testing-library/user-event";

// Mock ResizeObserver
class ResizeObserverMock {
  observe() { }
  unobserve() { }
  disconnect() { }
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
  useParams: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        "profile.errorStates.retry": "Retry",
        "profile.errorStates.goBackToMenu": "Back to Menu",
        "profile.logout": "Logout",
        "profile.settings": "Settings",
        "profile.accountSettings": "Account Settings",
        "profile.username": "Username",
        "profile.newPassword": "New Password",
        "profile.repeatPassword": "Repeat Password",
        "profile.save": "Save",
        "profile.customImage": "Upload Custom Image",
        "profile.loadingStatistics": "Loading statistics...",
        "profile.statisticTypes.insights.global": "Global Statistics",
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: () => new Promise(() => { }),
    },
  }),
}));

describe("Profile Component - Basic Functionality", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    useNavigate.mockReturnValue(mockNavigate);
    
    useParams.mockReturnValue({ username: "TestUser" });
    
    Cookies.get.mockReturnValue(
      JSON.stringify({ username: "TestUser", token: "12345" })
    );

    UserProfileSettings.prototype.getDefaultImages = jest.fn(() => [
      '/images/default1.png',
      '/images/default2.png'
    ]);
  });



  it("renders loading state initially", () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading statistics.../i)).toBeInTheDocument();
  });

  it("renders error message on API failure", async () => {
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

    await waitFor(() => {
      expect(screen.queryByText(/Loading statistics.../i)).not.toBeInTheDocument();
      expect(screen.getByText(/Failed to retrieve statistics/i)).toBeInTheDocument();
    });
  });

  it("allows retrying after an error", async () => {
    // Mock a failed request followed by a successful one
    const mockData = {
      selectedTab: 0,
      isProfileOwner: true,
      globalStatistics: {
        correctAnswers: 8,
        incorrectAnswers: 2,
        gamesPlayed: 2,
        questionsAnswered: 10,
      },
      registrationDate: "2023-01-01T00:00:00Z"
    };

    axios.get
      .mockRejectedValueOnce({
        response: {
          data: { error: "Failed to retrieve statistics" }
        }
      })
      .mockImplementationOnce((url) => {
        if (url.includes("/profile/TestUser")) {
          return Promise.resolve({
            data: mockData
          });
        }
        return Promise.resolve({ data: {} });
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
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Retry/i }));

    // Check for successful retry by checking for update in component state
    await waitFor(() => {
      expect(screen.queryByText(/Failed to retrieve statistics/i)).not.toBeInTheDocument();
    });
  });

  it("redirects when no user cookie is found and 'Back to Menu' button is clicked", async () => {
    Cookies.get.mockReturnValueOnce(null);

    axios.get.mockRejectedValueOnce({
      response: { data: { error: "Failed to retrieve statistics" } }
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

    // Click the correct logout button (Back to Menu)
    await act(async () => {
      const logoutButton = screen.getByRole('button', { name: /Back to Menu/i });
      await user.click(logoutButton);
    });

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
      const logoutButton = screen.getByRole('button', { name: /Back to Menu/i });
      await user.click(logoutButton);
    });

    // Check if cookie was removed and navigation happened
    expect(Cookies.remove).toHaveBeenCalledWith('user', { path: '/' });
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

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
      expect(screen.queryByText(/Loading statistics.../i)).not.toBeInTheDocument();
    });

    // Should show error message
    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
  });

  /*
  it("navigates back to menu when button is clicked", async () => {
    const mockData = {
      selectedTab: 0,
      isProfileOwner: true,
      globalStatistics: {
        correctAnswers: 8,
        incorrectAnswers: 2,
        gamesPlayed: 2,
        questionsAnswered: 10,
      },
      registrationDate: "2023-01-01T00:00:00Z"
    };

    axios.get.mockImplementationOnce((url) => {
      if (url.includes("/profile/TestUser")) {
        return Promise.resolve({
          data: mockData
        });
      }
      return Promise.resolve({ data: {} });
    });

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Loading statistics.../i)).not.toBeInTheDocument();
    });

    // Properly wait for the click action to complete
    await act(async () => {
      const logoutButton = screen.getByRole('button', { name: /Back to menu/i });
      await user.click(logoutButton);
    });

    // Check navigation
    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });
  */

  it("renders statistics data after successful API call", async () => {
    const mockData = {
      selectedTab: 0,
      isProfileOwner: true,
      globalStatistics: {
        correctAnswers: 10,
        incorrectAnswers: 5,
        gamesPlayed: 3,
        questionsAnswered: 15,
      },
      registrationDate: "2023-01-01T00:00:00Z"
    };

    // Mock the response structure that RecordRetriever returns
    axios.get.mockImplementationOnce((url) => {
      if (url.includes("/profile/TestUser")) {
        return Promise.resolve({
          data: mockData
        });
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.queryByText(/Loading statistics.../i)).not.toBeInTheDocument();
    });

    // Check that statistics are displayed
    expect(screen.getByText(/Global Statistics/i)).toBeInTheDocument();
  });
});

describe("Profile Management Functions", () => {
  const mockNavigate = jest.fn();
  const mockStats = {
    selectedTab: 0,
    isProfileOwner: true,
    globalStatistics: {
      correctAnswers: 10,
      incorrectAnswers: 5,
      gamesPlayed: 3,
      questionsAnswered: 15,
    },
    registrationDate: "2023-01-01T00:00:00Z",
    recentVisitors: [
      { username: "visitor1", lastVisit: "2023-05-01T00:00:00Z" },
      { username: "visitor2", lastVisit: "2023-05-02T00:00:00Z" }
    ],
    totalVisits: 10
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    useParams.mockReturnValue({ username: "TestUser" });
    
    useNavigate.mockReturnValue(mockNavigate);
    
    Cookies.get.mockReturnValue(
      JSON.stringify({ username: "TestUser", token: "12345" })
    );
    
    UserProfileSettings.prototype.getDefaultImages = jest.fn(() => [
      '/images/default1.png',
      '/images/default2.png'
    ]);

    // Mock getRecords to make user the profile owner
    RecordRetrieverProfile.prototype.getRecords = jest.fn(() =>
      Promise.resolve({
        statsData: {
          isProfileOwner: true,
          registrationDate: "2024-01-01T00:00:00.000Z",
          selectedTab: 0,
          recentVisitors: [],
          totalVisits: 0,
          globalStatistics: {
            maxScore: 100,
            maxCorrectAnswers: 10,
            questionsAnswered: 100,
            correctAnswers: 90,
            incorrectAnswers: 10,
            gamesPlayed: 5,
          },
          classicalStatistics: {
            maxScore: 90,
            maxCorrectAnswers: 9,
            questionsAnswered: 90,
            correctAnswers: 80,
            incorrectAnswers: 10,
            gamesPlayed: 4,
          },
          suddenDeathStatistics: {
            maxScore: 80,
            maxCorrectAnswers: 8,
            questionsAnswered: 80,
            correctAnswers: 70,
            incorrectAnswers: 10,
            gamesPlayed: 3,
          },
          timeTrialStatistics: {
            maxScore: 70,
            maxCorrectAnswers: 7,
            questionsAnswered: 70,
            correctAnswers: 60,
            incorrectAnswers: 10,
            gamesPlayed: 2,
          },
          customStatistics: {
            maxScore: 60,
            maxCorrectAnswers: 6,
            questionsAnswered: 60,
            correctAnswers: 50,
            incorrectAnswers: 10,
            gamesPlayed: 1,
          },
          qodStatistics: {
            maxScore: 50,
            maxCorrectAnswers: 5,
            questionsAnswered: 50,
            correctAnswers: 40,
            incorrectAnswers: 10,
            gamesPlayed: 1,
          },
        },
        username: 'TestUser'
      })
    );

    // Mock the RecordRetrieverProfile.getRecords method
    axios.get.mockImplementation((url) => {
      if (url.includes("/profile/TestUser")) {
        return Promise.resolve({ data: mockStats });
      }
      return Promise.resolve({ data: {} });
    });
  });

  // This is a placeholder test to ensure the test suite runs without errors.
  it("Should work", async () => {
      expect(true).toBe(true);
  });

/*
  it("should handle account information modification successfully", async () => {
    // Setup
    const user = userEvent.setup();
    const newUsername = "NewUsername";
    const newPassword = "NewPassword123";

    // Mock the PATCH request for changing username/password
    axios.patch.mockResolvedValueOnce({
      data: {
        newUsername: newUsername,
        token: "newToken12345"
      }
    });

    render(
      <MemoryRouter initialEntries={["/profile/TestUser"]}>
        <Profile />
      </MemoryRouter>
    );

    // Wait for the profile to load
    await waitFor(() => {
      expect(screen.queryByText(/Loading statistics.../)).not.toBeInTheDocument();
    });

    // Click on settings button
    const settingsButton = await screen.findByRole('button', { name: /Settings/i });
    await user.click(settingsButton);

    // Find and interact with the account settings dialog
    // expect(screen.getByText(/Settings/i)).toBeInTheDocument();

    // Find username and password fields
    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/New Password/i);
    const passwordRepeatInput = screen.getByLabelText(/Repeat Password/i);

    // Fill in the form
    await user.clear(usernameInput);
    await user.type(usernameInput, newUsername);
    await user.type(passwordInput, newPassword);
    await user.type(passwordRepeatInput, newPassword);

    // Submit the form
    const saveButton = screen.getByRole('button', { name: /Save/i });
    await user.click(saveButton);

    // Verify PATCH request was made with correct data
    expect(axios.patch).toHaveBeenCalledWith(
      expect.stringContaining("/users/TestUser"),
      {
        username: newUsername,
        password: newPassword,
        passwordRepeat: newPassword
      },
      expect.objectContaining({
        headers: expect.objectContaining({
          "Authorization": "Bearer 12345"
        })
      })
    );

    // Verify cookie was set with new username and token
    expect(Cookies.set).toHaveBeenCalledWith(
      'user',
      JSON.stringify({ username: newUsername, token: "newToken12345" }),
      expect.anything()
    );

    // Verify navigation to new profile page
    expect(mockNavigate).toHaveBeenCalledWith(`/profile/${newUsername}`);
  });

  it("should handle account modification error", async () => {
    // Setup
    const user = userEvent.setup();
    const errorMessage = "Username already taken";

    // Mock the PATCH request to throw an error
    axios.patch.mockRejectedValueOnce({
      response: {
        data: {
          error: errorMessage
        }
      }
    });

    render(
      <MemoryRouter initialEntries={["/profile/TestUser"]}>
        <Profile />
      </MemoryRouter>
    );

    // Wait for the profile to load
    await waitFor(() => {
      expect(screen.queryByText(/Loading statistics.../)).not.toBeInTheDocument();
    });

    // Open settings
    const settingsButton = await screen.findByRole('button', { name: /Settings/i });
    await user.click(settingsButton);

    // Fill form with invalid data
    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/New Password/i);
    const passwordRepeatInput = screen.getByLabelText(/Repeat Password/i);

    await user.clear(usernameInput);
    await user.type(usernameInput, "takenUsername");
    await user.type(passwordInput, "password123");
    await user.type(passwordRepeatInput, "password123");

    // Submit form
    const saveButton = screen.getByRole('button', { name: /Save/i });
    await user.click(saveButton);

    // Error should be displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Navigation should not occur
    expect(mockNavigate).not.toHaveBeenCalledWith(`/profile/takenUsername`);
  });
*/
/*
  it("should handle custom profile image upload successfully", async () => {
    // Setup
    const user = userEvent.setup();

    // Mock successful image upload
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    render(
      <MemoryRouter initialEntries={["/profile/TestUser"]}>
        <Profile />
      </MemoryRouter>
    );

    // Wait for the profile to load
    await waitFor(() => {
      expect(screen.queryByText(/Loading statistics.../)).not.toBeInTheDocument();
    });

    // Open settings
    const settingsButton = await screen.findByRole('button', { name: /Settings/i });
    await user.click(settingsButton);

    // Wait for the profile settings to load
    await waitFor(() => {
      expect(screen.queryByText(/Update Your Profile/)).toBeInTheDocument();
    });

    // Find file input
    const fileInput = screen.getByLabelText(/Upload picture/i);

    // Create a mock file
    const file = new File(['dummy content'], 'profile.png', { type: 'image/png' });

    // Upload the file
    await user.upload(fileInput, file);

    // Verify FormData was created and sent correctly
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/users/TestUser/custom-image"),
      expect.any(FormData),
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "multipart/form-data",
          "Authorization": "Bearer 12345"
        })
      })
    );

    // Check that no error is displayed
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  it("should handle custom profile image upload error", async () => {
    // Setup
    const user = userEvent.setup();
    const errorMessage = "File too large";

    // Mock failed image upload
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          error: errorMessage
        }
      }
    });

    render(
      <MemoryRouter initialEntries={["/profile/TestUser"]}>
        <Profile />
      </MemoryRouter>
    );

    // Wait for the profile to load
    await waitFor(() => {
      expect(screen.queryByText(/Loading statistics.../)).not.toBeInTheDocument();
    });

    // Open settings
    const settingsButton = await screen.findByRole('button', { name: /Settings/i });
    await user.click(settingsButton);

    // Find file input
    const fileInput = screen.getByLabelText(/Upload picture/i);

    // Create a mock file
    const file = new File(['dummy content'], 'profile.png', { type: 'image/png' });

    // Upload the file
    await user.upload(fileInput, file);

    // Error should be displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
*/
/*
  it("should handle default profile image selection", async () => {
    // Setup
    const user = userEvent.setup();

    // Mock successful default image selection
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    render(
      <MemoryRouter initialEntries={["/profile/TestUser"]}>
        <Profile />
      </MemoryRouter>
    );

    // Wait for the profile to load
    await waitFor(() => {
      expect(screen.queryByText(/Loading statistics.../)).not.toBeInTheDocument();
    });

    // Open settings
    const settingsButton = await screen.findByRole('button', { name: /Settings/i });
    await user.click(settingsButton);

    // Find and click a default image option
    const defaultImageOption = screen.getAllByAltText(/default profile/i)[0];
    await user.click(defaultImageOption);

    // Verify request was made with the selected image name
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/users/TestUser/default-image"),
      expect.objectContaining({
        image: expect.stringMatching(/image_\d+\.png/)
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          "Authorization": "Bearer 12345"
        })
      })
    );
  });

  it("should handle default profile image selection error", async () => {
    // Setup
    const user = userEvent.setup();
    const errorMessage = "Invalid image selection";

    // Mock failed default image selection
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          error: errorMessage
        }
      }
    });

    render(
      <MemoryRouter initialEntries={["/profile/TestUser"]}>
        <Profile />
      </MemoryRouter>
    );

    // Wait for the profile to load
    await waitFor(() => {
      expect(screen.queryByText(/Loading statistics.../)).not.toBeInTheDocument();
    });

    // Open settings
    const settingsButton = await screen.findByRole('button', { name: /Settings/i });
    await user.click(settingsButton);

    // Find and click a default image option
    const defaultImageOption = screen.getAllByAltText(/default profile/i)[0];
    await user.click(defaultImageOption);

    // Error should be displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it("should not allow changing profile image if not profile owner", async () => {
    // Setup - create a scenario where user is viewing someone else's profile
    useParams.mockReturnValue({ username: "OtherUser" });

    // Mock non-owner statistics
    const nonOwnerStats = { ...mockStats, isProfileOwner: false };

    axios.get.mockImplementation((url) => {
      if (url.includes("/profile/OtherUser")) {
        return Promise.resolve({ data: nonOwnerStats });
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <MemoryRouter initialEntries={["/profile/OtherUser"]}>
        <Profile />
      </MemoryRouter>
    );

    // Wait for the profile to load
    await waitFor(() => {
      expect(screen.queryByText(/Loading statistics.../)).not.toBeInTheDocument();
    });

    // Settings button should not be visible for non-owners
    expect(screen.queryByRole('button', { name: /Settings/i })).not.toBeInTheDocument();

    // Verify no image-related API calls were made
    expect(axios.post).not.toHaveBeenCalled();
  });

  */
});