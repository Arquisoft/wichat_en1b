// hooks/useRounds.js
import { useState } from "react";

export const useRounds = ({ maxRounds, onRoundChange = () => { console.log("UseRounds: onRoundChange: Udefined function") } }) => {
    const [round, setRound] = useState(1);

    const nextRound = () => {
        onRoundChange();
        setRound((prev) => prev + 1);
    };

    const isGameEnded = () => {
        if (!maxRounds) return false; // If no max rounds, game never ends based on rounds
        return round >= maxRounds;
    };

    const resetRounds = () => {
        setRound(1);
    };

    return { round, nextRound, isGameEnded, resetRounds };
};
