/**@type {import('algosdk')} */
const algosdk = require("algosdk");
/**@type {import('crypto')} */
const crypto = require('crypto');

function generateEncryptionKey(password) {
  if (!password) {
    throw new Error("Password is required for key generation.");
  }

  // Use a suitable hashing algorithm (e.g., SHA-256) to create a 32-byte key
  const key = crypto.createHash('sha256').update(password, 'utf8').digest();
  return key;
}

function encryptPrivateKey(password, secretKey) {
  if (!password) {
    throw new Error("Password is required for encryption.");
  }

  const key = generateEncryptionKey(password);
  const iv = crypto.randomBytes(16); // Generate a random IV

  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const secretKeyBuffer = Buffer.from(secretKey);

  let encryptedPrivateKey = Buffer.concat([
    cipher.update(secretKeyBuffer),
    cipher.final(),
  ]);

  return iv.toString("hex") + ":" + encryptedPrivateKey.toString('hex');
}

/**
 * 
 * @param {string} password 
 * @param {string} _encryptedPrivateKey 
 * @returns 
 */
function decryptPrivateKey(password, _encryptedPrivateKey) {
  if (!password) {
    throw Error("Password is required for decryption.");
  }

  const key = generateEncryptionKey(password);
  const [_iv, encryptedPrivateKey] = _encryptedPrivateKey.split(":")
  const iv = Buffer.from(_iv, 'hex'); // Generate a random IV

  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

  const encryptedBuffer = Buffer.from(encryptedPrivateKey, 'hex');
  let decryptedBuffer = Buffer.concat([
    decipher.update(encryptedBuffer),
    decipher.final(),
  ]);

  return new Uint8Array(decryptedBuffer);
};

module.exports = {
  generateEncryptionKey,
  encryptPrivateKey,
  decryptPrivateKey,
};



(async ()=>{
    const account = algosdk.generateAccount()

    console.log("Default account", account)
    
    let encryptedKey = encryptPrivateKey("password", account.sk)
    console.log("Encrypted::", encryptedKey)
    let decrypted = decryptPrivateKey("password", encryptedKey)
    console.log("Decrypted::", decrypted)
})();