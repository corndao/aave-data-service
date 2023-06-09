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
  }
}

export function getTimestamp() {
  return Math.floor(Date.now() / 1000);
}
