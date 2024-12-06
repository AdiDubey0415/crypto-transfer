const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const { utf8ToBytes, toHex } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

app.use(cors());
app.use(express.json());

const balances = {
  "030f5ef7bca03ba3f1a0d0661332597d3c624f86aa781ef5db9d925c7e52683559": 100,
  "0343c0ba4b09c36180a4c16fd2c3e66f5439ab75b906a92d657f82f126ee8ee96d": 50,
  "02d8c98634d96715c6843f8ae70b2de5da04bd9375f871e413a142d456246ff9b3": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  console.log("request", req.body);
  const { sender, recipient, amount, signature } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  // verify the signature, from the signature we can get the public key, and check if the public key is the same as the sender's public key

  // Convert signature fields back to BigInt
  const r = BigInt(`0x${signature.r}`);
  const s = BigInt(`0x${signature.s}`);
  const recovery = Number(signature.recovery);

  const sig = new secp.secp256k1.Signature(r, s, recovery);

  const message = {
    sender,
    amount,
    recipient,
  };

  const messageHash = keccak256(utf8ToBytes(JSON.stringify(message)));

  const publicKey = sig.recoverPublicKey(messageHash).toHex();
  console.log("recovered public key:", publicKey);

  if (publicKey !== sender) {
    res.status(400).send({ message: "Invalid signature! - sender" });
  }

  if (!balances[publicKey]) {
    res.status(400).send({ message: "Invalid signature! - public key" });
  }

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
