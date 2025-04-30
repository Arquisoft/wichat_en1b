import { useState, useEffect, useRef } from 'react';

function useTimer({ initialTimeParam, onTimeUp, autoStart = true }) {
    const [timeLeft, setTimeLeft] = useState(60);
    const [isRunning, setIsRunning] = useState(autoStart);
    const [initialTime, setInitialTime] = useState(initialTimeParam);
    const timerRef = useRef(null);

    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        onTimeUp(); // Call the callback when time is up
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [isRunning, onTimeUp]);

    const start = () => setIsRunning(true);
    const pause = () => setIsRunning(false);
    const reset = (newTime = initialTime) => {
        clearInterval(timerRef.current);
        setTimeLeft(newTime);
        setIsRunning(false);
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
