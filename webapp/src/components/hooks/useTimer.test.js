import { renderHook, act } from '@testing-library/react';
import useTimer from './useTimer';

describe('useTimer', () => {
    jest.useFakeTimers();

    it('should initialize with the correct time', () => {
        const { result } = renderHook(() => useTimer({ initialTimeParam: 30, onTimeUp: jest.fn() }));
        expect(result.current.initialTime).toBe(30);
    });

    it('should count down every second when running', () => {
        const { result } = renderHook(() => useTimer({ onTimeUp: jest.fn() }));

        act(() => {
            result.current.start();
        });

        act(() => {
            jest.advanceTimersByTime(5000);
        });

        expect(result.current.timeLeft).toBe(55);
    });

    it('should pause the timer', () => {
        const { result } = renderHook(() => useTimer({ onTimeUp: jest.fn() }));

        act(() => {
            result.current.start();
        });

        act(() => {
            jest.advanceTimersByTime(5000);
        });

        act(() => {
            result.current.pause();
        });

        act(() => {
            jest.advanceTimersByTime(2000);
        });

        expect(result.current.timeLeft).toBe(55);
    });

    it('should reset the timer', () => {
        const { result } = renderHook(() => useTimer({ initialTimeParam: 10, onTimeUp: jest.fn() }));

        act(() => {
            result.current.start();
        });

        act(() => {
            jest.advanceTimersByTime(3000);
        });

        act(() => {
            result.current.reset();
        });

        expect(result.current.timeLeft).toBe(10);
        expect(result.current.isRunning).toBe(false);
    });

    it('should call onTimeUp when time is up', () => {
        const onTimeUpMock = jest.fn();
        const { result } = renderHook(() => useTimer({ onTimeUp: onTimeUpMock }));

        act(() => {
            result.current.start();
        });

        act(() => {
            jest.advanceTimersByTime(60000);
        });

        expect(onTimeUpMock).toHaveBeenCalledTimes(1);
        expect(result.current.timeLeft).toBe(0);
    });

    it('should allow setting a new initial time', () => {
        const { result } = renderHook(() => useTimer({ initialTimeParam: 10, onTimeUp: jest.fn() }));

        act(() => {
            result.current.setInitialTime(20);
        });

        act(() => {
            result.current.reset();
        });

        expect(result.current.timeLeft).toBe(20);
    });
});