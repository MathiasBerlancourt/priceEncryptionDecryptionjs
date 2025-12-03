// server.js 
//health, /encrypt, /decrypt

const express = require('express');

const PORT = process.env.PORT || 3000;
const {encrypt}=require('./encrypt');
const {decrypt, base64UrlToBuffer}=require('./decrypt');
const app = express();
app.use(express.json());

// Healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Placeholder encrypt route
app.post('/encrypt', (req, res) => {
  console.log("Request body:", req.body); // 🔍 vérifier ce qu'on reçoit

  const { price, encryptionKey, integrityKey } = req.body || {};

  if (!price || !encryptionKey || !integrityKey) {
    return res.status(400).json({ error: "Missing parameter", body: req.body });
  }

  try {
    const encryptedBuffer = encrypt(price, encryptionKey, integrityKey);

    res.json({
      encryptedPrice: encryptedBuffer.toString("base64url")
    });

  } catch (err) {
    res.status(500).json({ error: "Encryption failed", details: err.message });
  }
});


// Placeholder decrypt route

app.post('/decrypt', (req, res) => {
  console.log("Decrypt request body:", req.body);

  const { encryptedPrice, encryptionKey, integrityKey } = req.body || {};

  if (!encryptedPrice || !encryptionKey || !integrityKey) {
    return res.status(400).json({ error: "Missing parameter", body: req.body });
  }

  try {
    const cipherBuffer = base64UrlToBuffer(encryptedPrice);
    const decrypted = decrypt(cipherBuffer, encryptionKey, integrityKey);

    res.json({ decryptedPrice: decrypted });

  } catch (err) {
    res.status(500).json({ error: "Decryption failed", details: err.message });
  }
});
/*
  {

    "encryptionKey": "8af9qycrxhek",
    "integrityKey": "ihwywzy8qvj9",
	"encryptedPrice": "55mPuzTBIUqep2Kx_tebpjBGWi_5Y7jBFAOP"

  }
  */
  // TODO: implement decryption



;

app.listen(PORT, () => {
  console.log(`🏃Server running on port ${PORT}`);
});