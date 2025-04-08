const express = require('express');
const axios = require('axios');
const cors = require('cors');
const promBundle = require('express-prom-bundle');
//libraries required for OpenAPI-Swagger
const swaggerUi = require('swagger-ui-express');
const fs = require("fs")
const YAML = require('yaml')
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

const port = 8000;

const statisticsServiceUrl = process.env.STATS_SERVICE_URL || 'http://localhost:8005';
const questionServiceUrl = process.env.QUESTION_SERVICE_URL || 'http://localhost:8004';
const llmServiceUrl = process.env.LLM_SERVICE_URL || 'http://localhost:8003';
const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:8002';
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:8001';

app.use(cors());

app.use(express.json());

//Prometheus configuration
const metricsMiddleware = promBundle({ includeMethod: true });
app.use(metricsMiddleware);

// Middleware to verify JWT token and attach the user to the request (usued in the statistics service)
const authMiddleware = (req, res, next) => {

  // Get the token from the request headers
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Authorization header missing' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = decoded.username;  // Attach the user information to the request object
    next();
  });
};

function manageError(res, error) {
  if (error.response) //Some microservice responded with an error
    res.status(error.response.status).json(error.response.data);
  else //Some other error
    res.status(500).json({ error: "Internal server error" })
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.post('/login', async (req, res) => {
  try {
    // Forward the login request to the authentication service
    const authResponse = await axios.post(authServiceUrl + '/login', req.body);
    res.json(authResponse.data);
  } catch (error) {
    manageError(res, error);
  }
});

/**
 * Accepts a POST request containing user details in the request body and forwards it to the user service at /adduser.
 * Returns the response from the user service.
 * Handles errors using a centralized error manager.
 */
app.post('/adduser', async (req, res) => {
  try {
    // Forward the add user request to the user service
    const userResponse = await axios.post(userServiceUrl + '/adduser', req.body);
    res.json(userResponse.data);
  } catch (error) {
    manageError(res, error);
  }
});

/**
 * Accepts a POST request with a query payload in the request body and forwards it to the LLM service at /ask.
 * Returns the generated response from the LLM service.
 * Errors are managed via a centralized error handler.
 */
app.post('/askllm', async (req, res) => {
  try {
    // Forward the add user request to the user service
    const llmResponse = await axios.post(llmServiceUrl + '/ask', req.body);
    res.json(llmResponse.data);
  } catch (error) {
    manageError(res, error);
  }
});

/**
 * Accepts a GET request to retrieve a question from the question service.
 * Forwards the request to /question endpoint of the question service and returns the response.
 * Uses a centralized error handler for managing failures.
 */
app.get('/question', async (req, res) => {
  try {
    //Forward the asking for a question to the question service
    const questionResponse = await axios.get(`${questionServiceUrl}/question`);
    res.json(questionResponse.data);
  } catch (error) {
    manageError(res, error);
  }
});

/**
 * Accepts a GET request to retrieve a question of a specific type from the question service.
 * The questionType parameter is passed in the URL and forwarded to the question service’s /question/:questionType endpoint.
 * Returns the response from the question service and handles errors appropriately.
 */
app.get('/question/:questionType', async (req, res) => {
  try {
    const questionType = req.params.questionType;
    const questionResponse = await axios.get(`${questionServiceUrl}/question/${questionType}`);
    res.json(questionResponse.data);
  } catch (error) {
    manageError(res, error);
  }
});

app.post('/answer', async (req, res) => {
  try {
    //Forward the answer for validation to the question service
    const answerResponse = await axios.post(`${questionServiceUrl}/answer`, req.body);
    res.json(answerResponse.data);
  } catch (error) {
    manageError(res, error);
  }
});

app.get('/statistics', authMiddleware, async (req, res) => {
  try {
    // Forward the user information to the statistics service
    const statisticsResponse = await axios.get(`${statisticsServiceUrl}/statistics`, {
      headers: {
        'username': req.user
      }
    });

    res.json(statisticsResponse.data);
  } catch (error) {
    manageError(res, error);
  }
});

app.post('/statistics', authMiddleware, async (req, res) => {
  try {
    // Forward the update statistics request to the statistics service
    const statisticsData = req.body;

    const statisticsResponse = await axios.post(`${statisticsServiceUrl}/statistics`,
      statisticsData,
      {
        headers: {
          'username': req.user  // Send username in the headers
        }
      }
    );

    res.json(statisticsResponse.data);
  } catch (error) {
    manageError(res, error);
  }
});

// Read the OpenAPI YAML file synchronously
openapiPath = __dirname + '/openapi.yaml'
const file = fs.readFileSync(openapiPath, 'utf8');

// Parse the YAML content into a JavaScript object representing the Swagger document
const swaggerDocument = YAML.parse(file);

// Serve the Swagger UI documentation at the '/api-doc' endpoint
// This middleware serves the Swagger UI files and sets up the Swagger UI page
// It takes the parsed Swagger document as input
app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Start the gateway service
const server = app.listen(port, () => {
  console.log(`Gateway Service listening at http://localhost:${port}`);
});


module.exports = server
