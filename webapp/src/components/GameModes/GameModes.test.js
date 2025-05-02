import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import GameModes from './GameModes';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

describe('GameModes Component', () => {
    test('renders GameModes component correctly', () => {
        render(
            <MemoryRouter>
                <GameModes />
            </MemoryRouter>
        );

        expect(screen.getByText("Select Game Mode")).toBeInTheDocument();
        expect(screen.getByText("Category:")).toBeInTheDocument();
        expect(screen.getByText("Classical")).toBeInTheDocument();
        expect(screen.getByText("Sudden Death")).toBeInTheDocument();
        expect(screen.getByText("Time Trial")).toBeInTheDocument();
        expect(screen.getByText("QOD")).toBeInTheDocument();
        expect(screen.getByText("Custom")).toBeInTheDocument();
    });

    test('handles category change', () => {
        render(
            <MemoryRouter>
                <GameModes />
            </MemoryRouter>
        );

        const select = screen.getByRole('combobox');
        fireEvent.mouseDown(select);
        const randomOption = screen.getByRole('option', { name: /random/i });
        fireEvent.click(randomOption);

        expect(select).toHaveTextContent(/random/i);
    });

    test('handles custom settings change', () => {
        render(
            <MemoryRouter>
                <GameModes />
            </MemoryRouter>
        );

        const roundsInput = screen.getByLabelText(/Rounds/i);
        fireEvent.change(roundsInput, { target: { value: '10' } });
        expect(roundsInput.value).toBe('10');

        const timeInput = screen.getByLabelText(/Time per Question \(s\)/i);
        fireEvent.change(timeInput, { target: { value: '60' } });
        expect(timeInput.value).toBe('60');

        const aiAttemptsInput = screen.getByLabelText(/AI Attempts per Question/i);
        fireEvent.change(aiAttemptsInput, { target: { value: '5' } });
        expect(aiAttemptsInput.value).toBe('5');
    });

    test('navigates to game mode on button click', () => {

        render(
            <MemoryRouter>
                <GameModes />
            </MemoryRouter>
        );

        const classicalButton = screen.getByTestId('start-game-classical');

        fireEvent.click(classicalButton);

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/game/classical');
    });

    test('useEffect updates topic if invalid', () => {
        localStorage.setItem('topic', 'invalid_topic');
       
        render(
            <MemoryRouter>
                <GameModes />
            </MemoryRouter>
        );

        expect(localStorage.getItem('topic')).toBe('random');
    });
});