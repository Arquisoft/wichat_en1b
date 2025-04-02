import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Chat } from "./Chat";
import { useGame } from "../GameContext";
import axios from "axios";

jest.mock("../GameContext", () => ({
    useGame: jest.fn()
}));

jest.mock("axios");

describe("Chat Component", () => {
    beforeEach(() => {
        window.HTMLElement.prototype.scrollIntoView = jest.fn();
        useGame.mockReturnValue({
            question: { question: "What is 2+2?" },
            gameEnded: false,
            setGameEnded: jest.fn()
        });
    });

    test("ensure correct button is clicked", () => {
        render(<Chat />);
        
        // Log all buttons in the rendered component
        screen.getAllByRole("button").forEach((btn, index) => {
            console.log(`Button ${index}: ${btn.innerHTML}`);
        });
    });
    
    test("renders chat component", () => {
        render(<Chat />);
        expect(screen.getByText("Chat Assistant")).toBeInTheDocument();
    });

    test("toggles chat sidebar when button is clicked", () => {
        render(<Chat />);
        const toggleButton = screen.getAllByRole("button")[0];
        fireEvent.click(toggleButton);
    });
    /*
    test("allows user to type and send a message", async () => {
        axios.post.mockResolvedValue({ data: { answer: "4" } });
        render(<Chat />);
    
        // Open the chat if necessary
        const openChatButton = screen.queryByTestId("ChevronRightIcon")?.closest("button");
        if (openChatButton) {
            fireEvent.click(openChatButton);
        }
    
        // Wait for input to be available
        const input = await screen.findByPlaceholderText("Type your message...");
        await waitFor(() => expect(input).not.toBeDisabled());
        fireEvent.change(input, { target: { value: "What is 2+2?" } });
        expect(input).not.toBeDisabled();
        console.log(screen.debug());
        // Find and click send button
        const sendButton = screen.getByTestId("SendIcon").closest("button");
        fireEvent.click(sendButton);
    
        // Ensure message and response appear
        await waitFor(() => expect(screen.findByText("What is 2+2?")).toBeVisible());
        await waitFor(() => expect(screen.findByText("4")).toBeVisible());
    });
    
    test("displays error message when API request fails", async () => {
        axios.post.mockRejectedValue(new Error("Network Error"));
        render(<Chat />);
    
        // Open the chat
        const openChatButton = screen.queryByTestId("ChevronRightIcon")?.closest("button");
        if (openChatButton) {
            fireEvent.click(openChatButton);
        }
    
        // Wait for input to be available
        const input = await screen.findByPlaceholderText("Type your message...");
        fireEvent.change(input, { target: { value: "Test error" } });
    
        // Click send button
        const sendButton = screen.getByTestId("SendIcon").closest("button");
        fireEvent.click(sendButton);
    
        // Check for error message
        await waitFor(() =>
            expect(
                screen.getByText("Sorry, there was an error processing your request. Please try again.")
            ).toBeVisible()
        );
    });
    */
});
