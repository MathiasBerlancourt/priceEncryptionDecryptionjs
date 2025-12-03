// Minimal Express server with /health, /encrypt, /decrypt

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: '🟢 OK' });
});

// Placeholder encrypt route
app.post('/encrypt', (req, res) => {
  const { data } = req.body;
  // TODO: implement encryption
  res.json({ encrypted: `encrypted(${data})` });
});

// Placeholder decrypt route
app.post('/decrypt', (req, res) => {
  const { data } = req.body;
  // TODO: implement decryption
  res.json({ decrypted: `decrypted(${data})` });
});

app.listen(PORT, () => {
  console.log(`🏃Server running on port ${PORT}`);
});