const secp = require("ethereum-cryptography/secp256k1");
const { utf8ToBytes, toHex } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

// Step 1: Create a message
const message = "Verify me!";
const messageHash = keccak256(utf8ToBytes(message));
// console.log("message:", message, messageHash);

const privateKey = secp.secp256k1.utils.randomPrivateKey();
const publicKey = secp.secp256k1.getPublicKey(privateKey);
const privateKeyHex = toHex(privateKey);
const publicKeyHex = toHex(publicKey);

const signature = secp.secp256k1.sign(messageHash, privateKey);

const isVerified = secp.secp256k1.verify(signature, messageHash, publicKey);

// const recoveredPublicKey = secp.secp256k1.recoverPublicKey(
//   messageHash,
//   signature
// );

console.log("private key:", privateKeyHex);

console.log("public key:", publicKeyHex);
