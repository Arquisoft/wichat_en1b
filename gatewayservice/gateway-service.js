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
const metricsMiddleware = promBundle({includeMethod: true});
app.use(metricsMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.post('/login', async (req, res) => {
  try {
    // Forward the login request to the authentication service
    const authResponse = await axios.post(authServiceUrl+'/login', req.body);
    res.json(authResponse.data);
  } catch (error) {
    manageError(res, error);
  }
});

app.post('/adduser', async (req, res) => {
  try {
    // Forward the add user request to the user service
    const userResponse = await axios.post(userServiceUrl+'/adduser', req.body);
    res.json(userResponse.data);
  } catch (error) {
    manageError(res, error);
  }
});

app.post('/askllm', async (req, res) => {
  try {
    // Forward the add user request to the user service
    const llmResponse = await axios.post(llmServiceUrl+'/ask', req.body);
    res.json(llmResponse.data);
  } catch (error) {
    manageError(res, error);
  }
});

app.get('/question', async (req, res) => {
  try {
    //Forward the asking for a question to the question service
    const questionResponse = await axios.get(`${questionServiceUrl}/question`);
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

app.get('/statistics', verifyToken ,async (req, res) => {
  try {
    // Forward the add user request to the statistics service
    const statisticsResponse = await axios.get(statisticsServiceUrl+'/statistics');
    res.json(statisticsResponse.data);
  } catch (error) {
    manageError(res, error);
  }
});

app.post('/statistics', async (req, res) => {
  try {
    // Forward the add user request to the statistics service
    const statisticsResponse = await axios.post(statisticsServiceUrl+'/statistics', req.body);
    res.json(statisticsResponse.data);
  } catch (error) {
    manageError(res, error);
  }
});

app.get('/question', async (req, res) => {
  try{
    console.log(questionServiceUrl+'/foods')
    const questionResponse = await axios.get(questionServiceUrl+'/foods');
    console.log(questionResponse);
    res.json(questionResponse.data)
  } catch (error) {
    manageError(res, error);
  }
});

// Read the OpenAPI YAML file synchronously
openapiPath='./openapi.yaml'
if (fs.existsSync(openapiPath)) {
  const file = fs.readFileSync(openapiPath, 'utf8');

  // Parse the YAML content into a JavaScript object representing the Swagger document
  const swaggerDocument = YAML.parse(file);

  // Serve the Swagger UI documentation at the '/api-doc' endpoint
  // This middleware serves the Swagger UI files and sets up the Swagger UI page
  // It takes the parsed Swagger document as input
  app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} else {
  console.log("Not configuring OpenAPI. Configuration file not present.")
}


// Start the gateway service
const server = app.listen(port, () => {
  console.log(`Gateway Service listening at http://localhost:${port}`);
});


function verifyToken(req, res, next) {
  // Get the token from the request headers
  const token = req.headers['authorization'] || req.headers['token'] || req.body.token || req.query.token;
  // Verify if the token is valid
  jwt.verify(token, (process.env.JWT_SECRET), (err, decoded) => {
    if (err) {
      // Token is not valid
      res.status(403).json({authorized: false,
        error: 'Invalid token or outdated'});
    } else {
      // Token is valid
      req.decodedToken = decoded;
      // Call next() to proceed to the next middleware or route handler
      next();
    }
  });
}

function manageError(res, error) {
  if (error.response) //Some microservice responded with an error
    res.status(error.response.status).json(error.response.data);
  else //Some other error
    res.status(500).json({error : "Internal server error"})
}

module.exports = server
