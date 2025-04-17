import { Network } from "@meshsdk/core";

export const appNetwork: Network = (process.env.APP_NETWORK?.toLowerCase() as Network) || "preview";
export const appNetworkId = appNetwork === "mainnet" ? 1 : 0;

export const APP_WALLET_ADDRESS = process.env.APP_WALLET_ADDRESS || "";

export const BLOCKFROST_API_KEY = process.env.BLOCKFROST_API_KEY || "";

export const title = {
  mint: "mint.mint.mint",
  store: "store.store.spend",
};
