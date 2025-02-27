const express = require("express");

const app = express();
const port = 8004;


app.use(express.json())

app.get('/', (req, res) => {
    res.status(200).json({message: "Server working"});
})

const server = app.listen(port, () => {
    console.log(`Question Service listening at http://localhost:${port}`);
})

module.exports = server