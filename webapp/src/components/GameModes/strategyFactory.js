import { GameModesConfig } from "./gameModesConfiguration";
import { createSuddenDeathStrategy } from "./strategies/suddenDeath";
import { createCustomStrategy } from "./strategies/custom";

// You can add parameters as needed
export const getGameStrategy = ({ gameMode, customOptions = {}, injectedRefs = {} }) => {
    console.log("getGameStrategy: gameMode", gameMode);
    console.log("getGameStrategy: customOptions", customOptions);
    switch (gameMode) {
        case "custom":
            return createCustomStrategy({customOptions: customOptions});

        case "suddenDeath":
            return createSuddenDeathStrategy({lastAnswerRef: injectedRefs.lastAnswerRef});

        // Static configs, return as-is
        case "classical":
        case "timeTrial":
        case "qod":
            console.log("getGameStrategy: GameModesConfig[gameMode]", GameModesConfig[gameMode.toUpperCase()]);
            return GameModesConfig[gameMode.toUpperCase()];

        default:
            throw new Error(`Unknown game mode: ${gameMode}`);
    }
};
