import { useState } from "react";
import server from "./server";
import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";
import { secp256k1 } from "ethereum-cryptography/secp256k1";

function Transfer({ address, setBalance, privateKey, setSignature }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    const message = {
      sender: address,
      amount: parseInt(sendAmount),
      recipient,
    }

    const messageHash = keccak256(utf8ToBytes(JSON.stringify(message)));
    const signature = secp256k1.sign(messageHash, privateKey);

    // Serialize signature components to hex
    const serializedSignature = {
      r: signature.r.toString(16),       // Convert 'r' to hex string
      s: signature.s.toString(16),       // Convert 's' to hex string
      recovery: signature.recovery       // 'recovery' is a number (0 or 1)
    };

    // const signatureHex = toHex(utf8ToBytes(JSON.stringify(secp256k1.sign(messageHash, privateKey))));


    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        ...message,
        signature: serializedSignature 
      });
      setBalance(balance);
    } catch (ex) {
      console.log("ex", ex);
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
