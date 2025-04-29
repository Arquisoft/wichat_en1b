import { GameProvider } from "./GameContext";
import { Chat } from "./Chat/Chat";
import { Question } from "./Question/Question";
import StatisticsUpdater from "./components/StatisticsUpdater";

export default function GameWrapper({type}) {
    const statsUpdater = new StatisticsUpdater(type);
    return (
        <GameProvider selectedModeId={type}>
            <Question />
            <Chat />
        </GameProvider>
    );
}