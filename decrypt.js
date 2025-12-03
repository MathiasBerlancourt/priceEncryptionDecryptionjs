// decrypt.js
const crypto = require("crypto");
const { encryptionKey, integrityKey } = require('./data.json');
const encryptedPrice=require('./encrypted.json');


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

const decrypt=(cipherBuffer, encryptionKey, integrityKey)=>{
    const IV_SIZE = 16;
    const SIG_SIZE = 4;

    if (cipherBuffer.length < IV_SIZE + SIG_SIZE)
        throw new Error("Encrypted buffer too short.");

    const iv = cipherBuffer.slice(0, IV_SIZE);
    const ciphertext = cipherBuffer.slice(IV_SIZE, cipherBuffer.length - SIG_SIZE);
    const signature = cipherBuffer.slice(cipherBuffer.length - SIG_SIZE);

    // Generate keystream
    const keystream = generateKeystream(encryptionKey, iv, ciphertext.length);

    // XOR decryption
    const plaintext = Buffer.alloc(ciphertext.length);
    for (let i = 0; i < ciphertext.length; i++) {
        plaintext[i] = ciphertext[i] ^ keystream[i];
    }

    // Verify signature
    const clearPlusIv = Buffer.concat([plaintext, iv]);
    const fullSig = crypto
        .createHmac("sha1", integrityKey)
        .update(clearPlusIv)
        .digest();

    if (!fullSig.slice(0, SIG_SIZE).equals(signature)) {
        throw new Error("Signature mismatch — tampered or corrupted data.");
    }

    return plaintext.toString("utf8");
}

// Output
const encrypted = base64UrlToBuffer(encryptedPrice);
const decrypted= decrypt(encrypted, encryptionKey, integrityKey);

console.log( `🟢 Decrypted in ${decrypted}`);
