const axios = require('axios');

const getSystemPrompt = require('../utils/system-prompt');

class GeminiController {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
    }

    hasApiKey() {
        return !!this.apiKey;
    }

    async _sendRequest(contents) {
        const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`, {
            "contents": contents,
            "generationConfig": {
                "temperature": 0.5,
                "responseMimeType": "text/plain",
            },
        })
        return response.data.candidates[0].content?.parts[0]?.text;
    }

    async sendQuestionToLLM(gameQuestion, userQuestion) {
        return await this._sendRequest([
            {
                "role": "model",
                "parts": [
                    {
                        "text": getSystemPrompt(gameQuestion)
                    },
                ]
            },
            {
                "role": "user",
                "parts": [
                    {
                        "text": userQuestion
                    },
                ]
            },
        ]);
    }

    async sendSimpleMessageToLLM(message) {
        return await this._sendRequest([
            {
                role: "model",
                "parts": [
                    {
                        "text": message
                    },
                ]
            }
        ]);
    }
}

module.exports = GeminiController;

