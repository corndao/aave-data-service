import { ChainId } from "@aave/contract-helpers";
import * as markets from "@bgd-labs/aave-address-book";

export const chainConfig: {
  [key: number]: {
    providerRPC: string;
    uiPoolDataProviderAddress: string;
    lendingPoolAddressProvider: string;
    walletBalanceProvider: string;
  };
} = {
  [ChainId.arbitrum_one]: {
    providerRPC: "https://arb-mainnet-public.unifra.io",
    uiPoolDataProviderAddress: markets.AaveV3Arbitrum.UI_POOL_DATA_PROVIDER,
    lendingPoolAddressProvider: markets.AaveV3Arbitrum.POOL_ADDRESSES_PROVIDER,
    walletBalanceProvider: markets.AaveV3Arbitrum.WALLET_BALANCE_PROVIDER,
  },
  [ChainId.mainnet]: {
    providerRPC: "https://ethereum.publicnode.com",
    uiPoolDataProviderAddress: markets.AaveV3Ethereum.UI_POOL_DATA_PROVIDER,
    lendingPoolAddressProvider: markets.AaveV3Ethereum.POOL_ADDRESSES_PROVIDER,
    walletBalanceProvider: markets.AaveV3Ethereum.WALLET_BALANCE_PROVIDER,
  },
  [ChainId.polygon]: {
    providerRPC: "https://rpc.ankr.com/polygon",
    uiPoolDataProviderAddress: markets.AaveV3Polygon.UI_POOL_DATA_PROVIDER,
    lendingPoolAddressProvider: markets.AaveV3Polygon.POOL_ADDRESSES_PROVIDER,
    walletBalanceProvider: markets.AaveV3Polygon.WALLET_BALANCE_PROVIDER,
  },
  [1442]: {
    providerRPC: "https://rpc.public.zkevm-test.net",
    uiPoolDataProviderAddress: "0x6D09af48575BacfbAafF1e32d3e102929D2a8a6B",
    lendingPoolAddressProvider: "0xa7945c8Fbde87F847DC2058074fb7b7E469Bf23a",
    walletBalanceProvider: "0x0da6DCAd2bE4801b644AEE679e0AdE008bB4bc6b",
  },
};

export function getTimestamp() {
  return Math.floor(Date.now() / 1000);
}
