import { GameProvider } from "./GameContext";
import { Chat } from "./Chat/Chat";
import { Question } from "./Question/Question";

export default function GameWrapper() {
    return (
        <GameProvider>
            <Question />
            <Chat />
        </GameProvider>
    );
}