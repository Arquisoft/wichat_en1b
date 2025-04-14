const axios = require('axios');

const getSystemPrompt = require('../utils/system-prompt');

class EmpathyController {

    constructor() {
        this.apiKey = process.env.LLM_API_KEY;
    }

    hasApiKey() {
        return !!this.apiKey;
    }

    async _sendRequest(messages) {
        console.log(messages);
        const response = await axios.post('https://empathyai.prod.empathy.co/v1/chat/completions', {
            model: "mistralai/Mistral-7B-Instruct-v0.3",
            messages: messages
        },
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data.choices[0]?.message?.content;
    }

    async sendQuestionToLLM(gameQuestion, userQuestion) {
        return await this._sendRequest([
            {
                role: "system", content: getSystemPrompt(gameQuestion)
            },
            { role: "user", content: userQuestion }
        ]);
    }

    async sendSimpleMessageToLLM(message) {
        return await this._sendRequest([
            { role: "user", content: message }
        ]);
    }
}

module.exports = EmpathyController;