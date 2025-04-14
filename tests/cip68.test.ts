/* eslint-disable @typescript-eslint/no-unused-vars */
import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import {BlockfrostProvider, deserializeAddress, MeshWallet} from "@meshsdk/core";
import {Cip68Contract} from "../scripts";
import {BLOCKFROST_API_KEY} from "../scripts/constants";

describe("Mint, Burn, Update, Remove Assets (NFT/TOKEN) CIP68", function () {
  let wallet: MeshWallet;
  const blockfrostProvider = new BlockfrostProvider(BLOCKFROST_API_KEY);
  beforeEach(async function () {
    wallet = new MeshWallet({
      networkId: 0,
      fetcher: blockfrostProvider,
      submitter: blockfrostProvider,
      key: {
        type: "mnemonic",
        words: process.env.APP_MNEMONIC?.split(" ") || [
            "kitten",
            "right",
            "bounce",
            "rebuild",
            "matrix",
            "bulk",
            "fork",
            "boss",
            "fame",
            "govern",
            "gauge",
            "sand",
            "property",
            "wheel",
            "cupboard",
            "endorse",
            "test",
            "dune",
            "squirrel",
            "canvas",
            "ordinary",
            "waste",
            "animal",
            "budget"
        ],
      },
    });
  });
  jest.setTimeout(6000000);

  test("address", async function () {
    const cip68Contract: Cip68Contract = new Cip68Contract({
      wallet: wallet,
    });

    const address = cip68Contract.storeAddress;
    console.log(address);
    const policyId = cip68Contract.policyId;
    console.log(policyId);
  });

  test("Mint", async function () {
    return;
    const assets = [
      {
        assetName: "hcd009",
        quantity: "1",
        receiver: "",
        metadata: {
          name: "hcd #009",
          image: "ipfs://QmQK3ZfKnwg772ZUhSodoyaqTMPazG2Ni3V4ydifYaYzdV",
          mediaType: "image/png",
          rarity: "Legendary",
          _pk: "c67f1772999b1448126a246b3849c4d98441992abd0c02d44e2284c1",
        },
      },
    ];
    const cip68Contract: Cip68Contract = new Cip68Contract({
      wallet: wallet,
    });

    const utxos = await wallet.getUtxos();
    const utxoOnlyLovelace = await Promise.all(
      utxos.filter((utxo) => {
        const hasOnlyLovelace = utxo.output.amount.every((amount) => amount.unit === "lovelace");
        const hasEnoughLovelace = utxo.output.amount.some((amount) => amount.unit === "lovelace" && Number(amount.quantity) > 500000000);
        return hasOnlyLovelace && hasEnoughLovelace;
      }),
    );

    let utxoIndex = 0;
    const chunkSize = 1;
    if (utxoOnlyLovelace.length < assets.length / chunkSize) {
      throw new Error("You have not UTxO only lavelace.");
    }

    for (let i = 0; i < assets.length; i += chunkSize) {
      const chunk = assets.slice(i, i + Math.min(chunkSize, assets.length - i));
      const unsignedTx = await cip68Contract.mint(chunk, utxoOnlyLovelace[utxoIndex]);
      const signedTx = await wallet.signTx(unsignedTx, true);
      const txHash = await wallet.submitTx(signedTx);
      console.log("https://preview.cexplorer.io/tx/" + txHash);
      utxoIndex++;
    }
  });

  test("Mint - Timeout", async function () {
    return;
    const assets = [
      {
        assetName: "hcd010",
        quantity: "1",
        receiver: "",
        metadata: {
          name: "hcd #010",
          image: "ipfs://QmQK3ZfKnwg772ZUhSodoyaqTMPazG2Ni3V4ydifYaYzdV",
          mediaType: "image/png",
          rarity: "Legendary",
          _pk: "c67f1772999b1448126a246b3849c4d98441992abd0c02d44e2284c1",
        },
      },
    ];
    const cip68Contract: Cip68Contract = new Cip68Contract({
      wallet: wallet,
    });

    const utxos = await wallet.getUtxos();
    const utxoOnlyLovelace = await Promise.all(
      utxos.filter((utxo) => {
        const hasOnlyLovelace = utxo.output.amount.every((amount) => amount.unit === "lovelace");
        const hasEnoughLovelace = utxo.output.amount.some((amount) => amount.unit === "lovelace" && Number(amount.quantity) > 500000000);
        return hasOnlyLovelace && hasEnoughLovelace;
      }),
    );

    let utxoIndex = 1;
    const chunkSize = 1;
    if (utxoOnlyLovelace.length < assets.length / chunkSize) {
      throw new Error("You have not UTxO only lavelace.");
    }

    for (let i = 0; i < assets.length; i += chunkSize) {
      const chunk = assets.slice(i, i + Math.min(chunkSize, assets.length - i));
      const unsignedTx = await cip68Contract.mint(chunk, utxoOnlyLovelace[utxoIndex]);
      const signedTx = await wallet.signTx(unsignedTx, true);
      const txHash = await wallet.submitTx(signedTx);
      console.log("https://preview.cexplorer.io/tx/" + txHash);

      utxoIndex++;
    }
  });

  test("Burn", async function () {
    return;
    const cip68Contract: Cip68Contract = new Cip68Contract({
      wallet: wallet,
    });
    const unsignedTx: string = await cip68Contract.burn([
      {
        assetName: "CIP68 Generators",
        quantity: "-1",
      },
    ]);
    const signedTx = await wallet.signTx(unsignedTx, true);
    const txHash = await wallet.submitTx(signedTx);
    console.log("https://preview.cexplorer.io/tx/" + txHash);
    jest.setTimeout(20000);
    expect(txHash.length).toBe(64);
  });

  test("Update", async function () {
    return;
    const cip68Contract: Cip68Contract = new Cip68Contract({
      wallet: wallet,
    });
    const unsignedTx: string = await cip68Contract.update([
      {
        assetName: "CIP68 Generators",
        metadata: {
          name: "2",
          image: "ipfs://QmRzicpReutwCkM6aotuKjErFCUD213DpwPq6ByuzMJaua",
          mediaType: "image/jpg",
          description: "Open source dynamic assets (Token/NFT) generator (CIP68)",
          owner: wallet.getChangeAddress(),
          website: "https://cip68.cardano2vn.io",
          _pk: deserializeAddress(wallet.getChangeAddress()).pubKeyHash,
        },
      },
      {
        assetName: "CIP68 Generators 1",
        metadata: {
          name: "2",
          image: "ipfs://QmRzicpReutwCkM6aotuKjErFCUD213DpwPq6ByuzMJaua",
          mediaType: "image/jpg",
          description: "Open source dynamic assets (Token/NFT) generator (CIP68)",
          owner: wallet.getChangeAddress(),
          website: "https://cip68.cardano2vn.io",
          _pk: deserializeAddress(wallet.getChangeAddress()).pubKeyHash,
        },
      },
    ]);
    const signedTx = await wallet.signTx(unsignedTx, true);
    const txHash = await wallet.submitTx(signedTx);
    console.log("https://preview.cexplorer.io/tx/" + txHash);
    expect(txHash.length).toBe(64);
  });

  test("Mint Reference Script", async function () {
    return;
    const cip68Contract: Cip68Contract = new Cip68Contract({
      wallet: wallet,
    });
    const ref_address = "";
    const unsignedTx: string = await cip68Contract.createReferenceScriptMint(ref_address);
    const signedTx = await wallet.signTx(unsignedTx, true);
    const txHash = await wallet.submitTx(signedTx);
    console.log("https://preview.cexplorer.io/tx/" + txHash);
    expect(txHash.length).toBe(64);
  });

  test("Store Reference Script", async function () {
    return;
    const cip68Contract: Cip68Contract = new Cip68Contract({
      wallet: wallet,
    });
    const ref_address = "";
    const unsignedTx: string = await cip68Contract.createReferenceScriptStore(ref_address);
    const signedTx = await wallet.signTx(unsignedTx, true);
    const txHash = await wallet.submitTx(signedTx);
    console.log("https://preview.cexplorer.io/tx/" + txHash);
    expect(txHash.length).toBe(64);
  });
});
