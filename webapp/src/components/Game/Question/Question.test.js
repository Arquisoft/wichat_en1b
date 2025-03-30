import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Question } from "./Question";
import { GameProvider } from "../GameContext";
import axios from "axios";
import Cookies from "js-cookie";
import { act } from "react-dom/test-utils";

jest.mock("axios");
jest.mock("js-cookie", () => ({ get: jest.fn() }));

// TODO: Fix tests
/*
describe("Question Component", () => {
    beforeEach(() => {
        Cookies.get.mockReturnValue("testUser");
        axios.get.mockResolvedValue({ data: { question: "New Question", images: ["Image1.jpg", "Image2.jpg"] } });
    });

    test("renders the timer correctly", () => {
        render(
            <GameProvider>
                <Question />
            </GameProvider>);
        expect(screen.getByText("01:00")).toBeInTheDocument();
    });

    test("fetches and displays a new question on button click", async () => {
        render(
            <GameProvider>
                <Question />
            </GameProvider>);
        const button = screen.getByText(/Request new question/i);
        fireEvent.click(button);

        await waitFor(() => expect(axios.get).toHaveBeenCalled());
    });

    test("timer countdown works", async () => {
        jest.useFakeTimers();
        render(
            <GameProvider>
                <Question />
            </GameProvider>);

        act(() => {
            jest.advanceTimersByTime(5000); // Fast-forward 5 seconds
        });

        expect(screen.getByText("00:55")).toBeInTheDocument();
        jest.useRealTimers();
    });
});
*/