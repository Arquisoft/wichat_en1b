import { GameProvider } from "./GameContext";
import { Chat } from "./Chat/Chat";
import { Question } from "./Question/Question";
import StatisticsUpdater from "./Question/StatisticsUpdater";

export default function GameWrapper({type}) {
    const statsUpdater = new StatisticsUpdater(type);
    return (
        <GameProvider>
            <Question statisticsUpdater={statsUpdater} type={type}/>
            <Chat />
        </GameProvider>
    );
}