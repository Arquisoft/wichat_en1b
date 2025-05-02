import StatisticsUpdater from "./StatisticsUpdater";
import axios from "axios";
import { retrieveUserToken } from "../../utils/utils";

jest.mock("axios");
jest.mock("../../utils/utils", () => ({
    retrieveUserToken: jest.fn()
}));

describe("StatisticsUpdater", () => {
    let statsUpdater;

    beforeEach(() => {
        statsUpdater = new StatisticsUpdater("classical");
    });

    it("should initialize with default stats", () => {
        expect(statsUpdater.statsData).toEqual({
            questionsAnswered: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            score: 0,
            gameType: "classical",
            registrationDate: expect.any(Number)
        });
    });

    it("should reset stats on newGame", () => {
        statsUpdater.recordCorrectAnswer(10);
        statsUpdater.newGame();
        expect(statsUpdater.statsData.questionsAnswered).toBe(0);
        expect(statsUpdater.statsData.correctAnswers).toBe(0);
        expect(statsUpdater.statsData.incorrectAnswers).toBe(0);
        expect(statsUpdater.statsData.score).toBe(0);
        expect(statsUpdater.statsData.gameType).toBe("classical");
    });

    it("should record a correct answer", () => {
        statsUpdater.recordCorrectAnswer(10);
        expect(statsUpdater.statsData.correctAnswers).toBe(1);
        expect(statsUpdater.statsData.score).toBe(10);
        expect(statsUpdater.statsData.questionsAnswered).toBe(1);
    });

    it("should record an incorrect answer", () => {
        statsUpdater.recordIncorrectAnswer();
        expect(statsUpdater.statsData.incorrectAnswers).toBe(1);
        expect(statsUpdater.statsData.questionsAnswered).toBe(1);
    });

    it("should return the current score", () => {
        statsUpdater.recordCorrectAnswer(10);
        expect(statsUpdater.getCurrentScore()).toBe(10);
    });

    it("should end the game and record stats", async () => {
        retrieveUserToken.mockReturnValue("mockToken");
        axios.post.mockResolvedValue({ data: { success: true } });

        const result = await statsUpdater.endGame(true);

        expect(axios.post).toHaveBeenCalledWith(
            "http://localhost:8000/recordGame",
            expect.objectContaining({
                gameType: "classical",
                endDate: expect.any(Number)
            }),
            {
                headers: {
                    Authorization: "Bearer mockToken"
                }
            }
        );
        expect(result.endDate).toBeDefined();
    });

    it("should throw an error if recording fails", async () => {
        retrieveUserToken.mockReturnValue("mockToken");
        axios.post.mockRejectedValue({ response: { status: 401 } });

        await expect(statsUpdater.endGame(true)).rejects.toThrow("statistics.errors.sessionExpired");
    });
});