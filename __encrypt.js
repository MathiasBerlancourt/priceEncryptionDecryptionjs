const { encryptionKey, integrityKey, price } = require('./data.json');
const crypto = require("crypto");

const encrypt=(price, encryptionKey, integrityKey)=>{
    const IV_SIZE = 16;
    const SIG_SIZE = 4;

    const iv = crypto.randomBytes(IV_SIZE);
    const priceBuffer = Buffer.from(price, "utf8");

    // STEP 1 — generate keystream using HMAC-SHA1(key, iv)
    const keystream = crypto.createHmac("sha1", encryptionKey).update(iv).digest();

    // STEP 2 — XOR with price
    const ciphertext = Buffer.alloc(priceBuffer.length);
    for (let i = 0; i < priceBuffer.length; i++) {
        ciphertext[i] = priceBuffer[i] ^ keystream[i];
    }

    // STEP 3 — generate signature
    const clearPlusIv = Buffer.concat([priceBuffer, iv]);
    const fullSig = crypto.createHmac("sha1", integrityKey).update(clearPlusIv).digest();
    const signature = fullSig.slice(0, SIG_SIZE);

    // STEP 4 — concatenate IV + ciphertext + signature
    return Buffer.concat([iv, ciphertext, signature]);
}


const encrypted = encrypt(price, encryptionKey, integrityKey);
console.log("Encrypted:", encrypted.toString("hex"));