const express = require('express');
const app = express();

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

module.exports = app;
