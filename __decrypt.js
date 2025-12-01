const crypto = require("crypto");



const base64UrlToBuffer=(base64Url)=> {
    base64Url = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    while (base64Url.length % 4 !== 0) {
        base64Url += "=";
    }
    return Buffer.from(base64Url, "base64");
}

const decrypt=(cipherBuffer, encryptionKey, integrityKey)=>{
    const IV_SIZE = 16;
    const SIG_SIZE = 4;
    const BLOCK_SIZE = 20; // HMAC-SHA1 output

    if (cipherBuffer.length < IV_SIZE + SIG_SIZE)
        throw new Error("Encrypted text too short");

    const iv = cipherBuffer.slice(0, IV_SIZE);
    const ciphertext = cipherBuffer.slice(IV_SIZE, cipherBuffer.length - SIG_SIZE);
    const signature = cipherBuffer.slice(cipherBuffer.length - SIG_SIZE);

    // STEP 1 — generate keystream using HMAC-SHA1(key, iv)
    let hmac = crypto.createHmac("sha1", encryptionKey);
    let keystream = hmac.update(iv).digest();

    // STEP 2 — XOR with ciphertext
    const plaintext = Buffer.alloc(ciphertext.length);
    for (let i = 0; i < ciphertext.length; i++) {
        plaintext[i] = ciphertext[i] ^ keystream[i];
    }

    // STEP 3 — verify integrity
    const clearPlusIv = Buffer.concat([plaintext, iv]);
    const fullSig = crypto.createHmac("sha1", integrityKey).update(clearPlusIv).digest();

    if (!fullSig.slice(0, 4).equals(signature)) {
        throw new Error("Signature does not match");
    }

    return plaintext.toString("utf8");
}