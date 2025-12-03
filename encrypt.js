// encrypt.js
const crypto = require("crypto");
//const { encryptionKey, integrityKey, price } = require("./data.json");
//const {writeFileSync}=require('fs');
//iv=initialization vector

const generateKeystream=(key, iv, length)=>{
    const blocks = [];
    let counterInput = iv;

    while (Buffer.concat(blocks).length < length) {
        const hmac = crypto.createHmac("sha1", key);
        blocks.push(hmac.update(counterInput).digest());
        // Simple chaining to increase entropy for the next block
        counterInput = blocks[blocks.length - 1];
    }

    return Buffer.concat(blocks).slice(0, length);
}

const encrypt=(price, encryptionKey, integrityKey)=>{
    const IV_SIZE = 16;
    const SIG_SIZE = 4;

    const iv = crypto.randomBytes(IV_SIZE);
    const plainBuf = Buffer.from(price, "utf8");

    // Generate keystream long enough for the price
    const keystream = generateKeystream(encryptionKey, iv, plainBuf.length);

    // XOR encryption
    const ciphertext = Buffer.alloc(plainBuf.length);
    for (let i = 0; i < plainBuf.length; i++) {
        ciphertext[i] = plainBuf[i] ^ keystream[i];
    }

    // Integrity: HMAC-SHA1( price + IV )
    const fullSig = crypto
        .createHmac("sha1", integrityKey)
        .update(Buffer.concat([plainBuf, iv]))
        .digest();

    const signature = fullSig.slice(0, SIG_SIZE);

    return Buffer.concat([iv, ciphertext, signature]);
}

// Execute encryption
/*
const encrypted = encrypt(price, encryptionKey, integrityKey);
console.log("Encrypted (hex):", encrypted.toString("hex"));
console.log("Encrypted (base64url):", encrypted.toString("base64url"));

const path="./encrypted.json";
const encryptedPrice=encrypted.toString("base64url");

//store encypted

try {
    writeFileSync(path,JSON.stringify(encryptedPrice,null,2),"utf8");
    console.log("Data successfully saved to /encrypted.json");
    
} catch (error) {
      console.log('An error has occurred ', error);

}
 */
module.exports = { encrypt };
