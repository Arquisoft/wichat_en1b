import { Chat } from "./Chat/Chat";
import { Question } from "./Question/Question";


export default function GameWrapper() {
    return (
        <div className="triviaGame">
            <Question />
            <Chat />
        </div>
    )
}