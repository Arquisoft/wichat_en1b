import { useState, useEffect, useRef } from 'react';

function useTimer({ initialTimeParam, onTimeUp, autoStart = true }) {
    const [timeLeft, setTimeLeft] = useState(60);
    const [isRunning, setIsRunning] = useState(autoStart);
    const [initialTime, setInitialTime] = useState(initialTimeParam);
    const timerRef = useRef(null);
    const onTimeUpRef = useRef(onTimeUp);

    // Update ref when onTimeUp changes
    useEffect(() => {
        onTimeUpRef.current = onTimeUp;
    }, [onTimeUp]);

    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev === 0) {
                        clearInterval(timerRef.current);
                        if (timerRef.current !== null) {
                            onTimeUpRef.current(); // Call the callback when time is up
                            timerRef.current = null; // Mark as called to prevent multiple calls
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [isRunning]); // Remove onTimeUp from dependencies

    const start = () => setIsRunning(true);
    const pause = () => setIsRunning(false);
    const reset = (newTime = initialTime) => {
        clearInterval(timerRef.current);
        setTimeLeft(newTime);
        setIsRunning(false);
        timerRef.current = null; // Reset the ref to allow future callbacks
    };

    return {
        timeLeft,
        isRunning,
        initialTime,
        start,
        pause,
        reset,
        setInitialTime, // Allow setting a new initial time
    };
}

export default useTimer;
