// server.js 
// health, /encrypt, /decrypt
//http://localhost:3000/api-docs/#/

const express = require('express');
const swaggerUi = require('swagger-ui-express'); 
const PORT = process.env.PORT || 3000;
const { encrypt } = require('./encrypt');
const { decrypt, base64UrlToBuffer } = require('./decrypt');
const app = express();
const swaggerDocument = require('./swagger.json'); 

// ⚠️ Important on Vercel : serve static swagger ui files
app.use(
  "/api-docs",
  swaggerUi.serveFiles(swaggerDocument),
  swaggerUi.setup(swaggerDocument)
);

//use Express
app.use(express.json());

//use swagger UI

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Placeholder encrypt route
app.post('/encrypt', (req, res) => {
  console.log("Request body:", req.body); // 🔍 check what we receive

  const price = req.body?.price;
  const encryptionKey = req.header('encryptionKey');
  const integrityKey = req.header('integrityKey');

  if (!price || !encryptionKey || !integrityKey) {
    return res.status(400).json({ error: "Missing parameter", body: req.body });
  }

  // Validation: price must be a string representing a valid float
  if (typeof price !== 'string') {
    return res.status(400).json({ error: "Price must be a string" });
  }

  // Validation: price can only contain digits and one optional decimal point
  const floatRegex = /^\d+(\.\d+)?$/;
  if (!floatRegex.test(price)) {
    return res.status(400).json({ error: "Price must be a valid float string, e.g. '123.45'" });
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

  const encryptedPrice = req.body?.encryptedPrice;
  const encryptionKey = req.header('encryptionKey');
  const integrityKey = req.header('integrityKey');

  if (!encryptedPrice || !encryptionKey || !integrityKey) {
    return res.status(400).json({ error: "Missing parameter", body: req.body });
  }

  // Optional validation: check if encryptedPrice is a valid base64url string
  const base64UrlRegex = /^[A-Za-z0-9\-_]+$/;
  if (!base64UrlRegex.test(encryptedPrice)) {
    return res.status(400).json({ error: "encryptedPrice must be a valid base64url string" });
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
  Example JSON for /decrypt:
  {
    "encryptionKey": "8af9qycrxhek",
    "integrityKey": "ihwywzy8qvj9",
    "encryptedPrice": "55mPuzTBIUqep2Kx_tebpjBGWi_5Y7jBFAOP"
  }
*/

app.listen(PORT, () => {
  console.log(`🏃Server running on port ${PORT}`);
});