const axios = require('axios');

const getSystemPrompt = require('../utils/system-prompt');

class EmpathyController {

    constructor() {
        this.apiKey = process.env.LLM_API_KEY;
    }

    hasApiKey() {
        console.log(this.apiKey);
        return this.apiKey !== undefined && this.apiKey !== '';
    }

    _sendRequest(gameQuestion, userQuestion) {
        return axios.post('https://empathyai.prod.empathy.co/v1/chat/completions', {
            model: "mistralai/Mistral-7B-Instruct-v0.3",
            messages: [
                {
                    role: "system", content: getSystemPrompt(gameQuestion)
                },
                { role: "user", content: userQuestion }
            ]
        },
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );
    }

    async sendQuestionToLLM(gameQuestion, userQuestion) {
        const response = await this._sendRequest(gameQuestion, userQuestion);
        return response.data.choices[0]?.message?.content
    }
}

module.exports = EmpathyController;