import { ChainId } from '@aave/contract-helpers';
import * as markets from '@bgd-labs/aave-address-book';

export const chainId = ChainId.arbitrum_one;
export const providerRPC = "https://arb-mainnet-public.unifra.io";
export const uiPoolDataProviderAddress = markets.AaveV3Arbitrum.UI_POOL_DATA_PROVIDER;
export const lendingPoolAddressProvider = markets.AaveV3Arbitrum.POOL_ADDRESSES_PROVIDER;

export function getTimestamp() {
  return Math.floor(Date.now() / 1000);
}
