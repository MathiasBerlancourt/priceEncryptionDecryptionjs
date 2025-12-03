// decrypt.js
const crypto = require("crypto");
//const { encryptionKey, integrityKey } = require('./data.json');
//const encryptedPrice=require('./encrypted.json');


const base64UrlToBuffer=(base64Url)=> {
    base64Url = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    while (base64Url.length % 4 !== 0) base64Url += "=";
    return Buffer.from(base64Url, "base64");
}

const generateKeystream=(key, iv, length)=>{
    const blocks = [];
    let counterInput = iv;

    while (Buffer.concat(blocks).length < length) {
        const hmac = crypto.createHmac("sha1", key);
        blocks.push(hmac.update(counterInput).digest());
        counterInput = blocks[blocks.length - 1];
    }

    return Buffer.concat(blocks).slice(0, length);
}
const decrypt = (cipherBuffer, encryptionKey, integrityKey) => {
  const IV_SIZE = 16;
  const SIG_SIZE = 4;

  if (cipherBuffer.length < IV_SIZE + SIG_SIZE)
    throw new Error("Encrypted buffer too short.");

  const iv = cipherBuffer.slice(0, IV_SIZE);
  const ciphertext = cipherBuffer.slice(IV_SIZE, cipherBuffer.length - SIG_SIZE);
  const signature = cipherBuffer.slice(cipherBuffer.length - SIG_SIZE);

  const keystream = generateKeystream(encryptionKey, iv, ciphertext.length);

  const plaintext = Buffer.alloc(ciphertext.length);
  for (let i = 0; i < ciphertext.length; i++) {
    plaintext[i] = ciphertext[i] ^ keystream[i];
  }

  const fullSig = crypto
    .createHmac("sha1", integrityKey)
    .update(Buffer.concat([plaintext, iv]))
    .digest();

  if (!fullSig.slice(0, SIG_SIZE).equals(signature)) {
    throw new Error("Signature mismatch — tampered or corrupted data.");
  }

  return plaintext.toString("utf8");
};

/*
// Output
//transform the encrypted Price base64Url to Buffer
const encryptedBuffer = base64UrlToBuffer(encryptedPrice);

//Then Decrypt with the function Decrypt
const decrypted= decrypt(encryptedBuffer, encryptionKey, integrityKey);

console.log( `🟢 Decrypted in ${decrypted}`);
*/
module.exports = { decrypt, base64UrlToBuffer };