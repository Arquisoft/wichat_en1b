import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameWrapper from "./GameWrapper";

window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe('GameWrapper Component', () => {
    test('renders the game', async () => {
        render(<GameWrapper type="classical" />);
        
        expect(screen.getByText("Classical Game 🎲")).toBeInTheDocument();
        expect(screen.getByText("Chat Assistant")).toBeInTheDocument();
    });
});
