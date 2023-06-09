import { ChainId } from '@aave/contract-helpers';
import * as markets from '@bgd-labs/aave-address-book';

export const chainConfig: {
  [key in ChainId]?: {
    providerRPC: string,
    uiPoolDataProviderAddress: string,
    lendingPoolAddressProvider: string,
  }
} = {
  [ChainId.arbitrum_one]: {
    providerRPC: "https://arb-mainnet-public.unifra.io",
    uiPoolDataProviderAddress: markets.AaveV3Arbitrum.UI_POOL_DATA_PROVIDER,
    lendingPoolAddressProvider: markets.AaveV3Arbitrum.POOL_ADDRESSES_PROVIDER, 
  },
  [ChainId.mainnet]: {
    providerRPC: "https://eth-rpc.gateway.pokt.network",
    uiPoolDataProviderAddress: markets.AaveV3Ethereum.UI_POOL_DATA_PROVIDER,
    lendingPoolAddressProvider: markets.AaveV3Ethereum.POOL_ADDRESSES_PROVIDER,
  },
  [ChainId.polygon]: {
    providerRPC: "https://polygon.llamarpc.com",
    uiPoolDataProviderAddress: markets.AaveV3Polygon.UI_POOL_DATA_PROVIDER,
    lendingPoolAddressProvider: markets.AaveV3Polygon.POOL_ADDRESSES_PROVIDER,
  },
}

export function getTimestamp() {
  return Math.floor(Date.now() / 1000);
}
