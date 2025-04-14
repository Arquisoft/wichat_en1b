const express = require('express');
const { body, validationResult } = require('express-validator');

const app = express();
const port = 8003;

// Middleware to parse JSON in request body
app.use(express.json());

// Load enviornment variables
require('dotenv').config();

const EmpathyController = require('./controllers/EmpathyController');
const GeminiController = require('./controllers/GeminiController');

const empathyController = new EmpathyController();
const geminiController = new GeminiController();
const LLM_CONTROLLERS = [empathyController, geminiController];
let currentControllerIndex = 0;

const LLM_CONTROLLERS_TIMEOUT = 10000;

/**
 * It handles chosing the llm controller and forwarding the question.
 * It will rotate controllers if an error occurs (usually from the timout of 10 seconds).
 * @param {*} gameQuestion 
 * @param {*} userQuestion 
 */
const dynamicSendToLLM = async (gameQuestion, userQuestion) => {
  // Try each controller starting from currentControllerIndex
  let attempts = 0;

  while (attempts < LLM_CONTROLLERS.length) {
    const controller = LLM_CONTROLLERS[currentControllerIndex];

    try {
      // Create a promise that will timeout after 10 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), LLM_CONTROLLERS_TIMEOUT);
      });

      // Race between the controller response and timeout
      const response = await Promise.race([
        controller.sendQuestionToLLM(gameQuestion, userQuestion),
        timeoutPromise
      ]);

      return response; // If successful, return the response
    } catch (error) {
      console.error(`Error with controller ${currentControllerIndex}:`, error);
      // Move to next controller
      currentControllerIndex = (currentControllerIndex + 1) % LLM_CONTROLLERS.length;
      attempts++;

      // If we've tried all controllers, throw the last error
      if (attempts === LLM_CONTROLLERS.length) {
        throw new Error('All LLM controllers failed to respond');
      }
    }
  }
}

const handleResponse = async (req, res, specificController = null) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors['errors'] });
  }

  const { gameQuestion, userQuestion } = req.body;

  try {
    let answer = specificController ? await specificController.sendQuestionToLLM(gameQuestion, userQuestion) : await dynamicSendToLLM(gameQuestion, userQuestion);
    res.json({ answer });
  } catch (error) {
    console.error('Error in /ask:', error);
    res.status(500).json({ error: 'An error occurred while processing the request.' });
  }
}

const llmQuestionValidation = [
  body('gameQuestion').notEmpty().withMessage('The game question is required'),
  body('userQuestion').notEmpty().withMessage('The user question is required'),
];

app.post('/ask', llmQuestionValidation, async (req, res) => {
  handleResponse(req, res);
});

app.post('/ask/gemini', llmQuestionValidation, async (req, res) => {
  if (!geminiController.hasApiKey()) {
    return res.status(500).json({ error: 'GEMINI API key is missing.' });
  }
  handleResponse(req, res, geminiController);
});

app.post('/ask/empathy', llmQuestionValidation, async (req, res) => {
  if (!empathyController.hasApiKey()) {
    return res.status(500).json({ error: 'EMPATHY API key is missing.' });
  }
  handleResponse(req, res, empathyController);
});

const server = app.listen(port, () => {
  console.log(`LLM Service listening at http://localhost:${port}`);
});

module.exports = server;