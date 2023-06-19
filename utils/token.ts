import { ethers } from "ethers";
import { chainConfig } from "./helper";
import { ChainId } from "@aave/contract-helpers";

interface TokenBalance {
  token: string;
  balance: string;
  decimals: number;
}

const abi = `[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]`;

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

  const balanceResults: Promise<string>[] = tokenAddresses.map((address) => {
    const token = new ethers.Contract(address, abi, provider);
    return token.balanceOf(account).then((bal: any) => bal.toString());
  });

  const decimalsResults: Promise<number>[] = tokenAddresses.map((address) => {
    const token = new ethers.Contract(address, abi, provider);
    return token.decimals();
  });

  const balances = await Promise.all(balanceResults);
  const decimals = await Promise.all(decimalsResults);

  const results: TokenBalance[] = [];
  for (let i = 0; i < tokenAddresses.length; i++) {
    results.push({
      token: tokenAddresses[i],
      balance: balances[i],
      decimals: decimals[i],
    });
  }

  return results;
}
