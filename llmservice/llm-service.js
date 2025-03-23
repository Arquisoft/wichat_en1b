const axios = require('axios');
const express = require('express');
const { body, validationResult } = require('express-validator');

const app = express();
const port = 8003;

// Middleware to parse JSON in request body
app.use(express.json());

// Load enviornment variables
require('dotenv').config();

// Define LLM configuration for empathy
const llmConfig = {
  url: 'https://empathyai.prod.empathy.co/v1/chat/completions',
  transformRequest: (gameQuestion, userQuestion) => ({
    model: "mistralai/Mistral-7B-Instruct-v0.3",
    messages: [
      { role: "system", content: `You are an AI designed to provide hints about a hidden answer.\
                                  \
                                  Rules for responses:\
                                  You must respond to the user's message with a single relevant hint.\
                                  You cannot reveal the answer directly.\
                                  You must ensure the hint is neither too obvious nor too difficult.\
                                  \
                                  Response format:\
                                  Respond clearly and concisely.\
                                  If the user asks for another hint, provide a different one without repeating previous information.\
                                  If the user guesses incorrectly, respond with a neutral message and offer the option for another hint.\
                                  \
                                  Example interaction:\
                                  User: "What is the answer?"\
                                  AI: "It is found in nature and changes with the seasons."\
                                  User: "Is it a tree?"\
                                  AI: "It is not a tree, but it is also related to the weather."\
                                  User: "Give me another hint."\
                                  AI: "Sometimes it's warm, sometimes it's cold, and it affects how we dress."\
                                  \
                                  Adapt each hint based on the context of the initial question and the user's response.\
                                  The question the user needs to answer is the following: ${gameQuestion}.` },
      { role: "user", content: userQuestion }
    ]
  }),
  transformResponse: (response) => response.data.choices[0]?.message?.content,
  headers: (apiKey) => ({
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  })
};

// Generic function to send questions to LLM
async function sendQuestionToLLM(gameQuestion, userQuestion, apiKey) {
  let requestData = llmConfig.transformRequest(gameQuestion, userQuestion);

  const headers = {
    'Content-Type': 'application/json',
    ...(llmConfig.headers ? llmConfig.headers(apiKey) : {})
  };

  const response = await axios.post(llmConfig.url, requestData, { headers });
  return llmConfig.transformResponse(response);
}

app.post('/ask', [
  body('gameQuestion').notEmpty().withMessage('Question is required'),
  body('userQuestion').notEmpty().withMessage('The user question is required'),
], async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let { gameQuestion, userQuestion } = req.body;
    //load the api key from an environment variable
    let apiKey = process.env.LLM_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is missing.' });
    }

    let answer = await sendQuestionToLLM(gameQuestion, userQuestion, apiKey);
    res.json({ answer });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const server = app.listen(port, () => {
  console.log(`LLM Service listening at http://localhost:${port}`);
});

module.exports = server


