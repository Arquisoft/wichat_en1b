const express = require('express');

const app = express();
const port = 8004;

// Middleware to parse JSON in request body
app.use(express.json());
