const axios = require('axios');

const getSystemPrompt = require('../utils/system-prompt');

class GeminiController {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
    }

    hasApiKey() {
        return !!this.apiKey;
    }

    _sendRequest(gameQuestion, userQuestion) {
        return axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`, {
            "contents": [
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
            ],
            "generationConfig": {
                "temperature": 0.3,
                "responseMimeType": "text/plain",
            },
        })
    }

    async sendQuestionToLLM(gameQuestion, userQuestion) {
        const response = await this._sendRequest(gameQuestion, userQuestion);
        return response.data.candidates[0].content?.parts[0]?.text;
    }
}

module.exports = GeminiController;

