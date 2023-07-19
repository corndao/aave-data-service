import { ethers } from "ethers";
import Bluebird from "bluebird";
import { chainConfig } from "./helper";
import { ChainId } from "@aave/contract-helpers";

interface TokenBalance {
  token: string;
  balance: string;
}

const balanceProviderAbi = `[{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"address","name":"token","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"users","type":"address[]"},{"internalType":"address[]","name":"tokens","type":"address[]"}],"name":"batchBalanceOf","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"provider","type":"address"},{"internalType":"address","name":"user","type":"address"}],"name":"getUserWalletBalances","outputs":[{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"stateMutability":"payable","type":"receive"}]`;

export async function fetchTokenBalances(
  chainId: ChainId,
  account: string,
  tokenAddresses: string[]
): Promise<TokenBalance[]> {
  const chain = chainConfig[chainId];
  if (!chain) {
    throw new Error("bad chain id");
  }

  const provider = new ethers.providers.JsonRpcProvider({
    // `skipFetchSetup` is required for Cloudflare Worker according to the issue:
    // https://github.com/ethers-io/ethers.js/issues/1886#issuecomment-1063531514
    skipFetchSetup: true,
    url: chain.providerRPC,
  });

  const balanceProvider = new ethers.Contract(
    chainConfig[chainId].walletBalanceProvider,
    balanceProviderAbi,
    provider
  );

  const balances: string[] = await balanceProvider.batchBalanceOf(
    [account],
    tokenAddresses
  );

  const results: TokenBalance[] = [];
  for (let i = 0; i < tokenAddresses.length; i++) {
    results.push({
      token: tokenAddresses[i],
      balance: balances[i].toString(),
    });
  }

  return results;
}
