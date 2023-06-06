import * as markets from '@bgd-labs/aave-address-book';

// const provider = new ethers.providers.JsonRpcProvider(
//   'https://arb-mainnet-public.unifra.io',
// );

// // View contract used to fetch all reserves data (including market base currency data), and user reserves
// // Using Aave V3 Eth Mainnet address for demo
// export const poolDataProviderContract = new UiPoolDataProvider({
//   uiPoolDataProviderAddress: markets.AaveV3Arbitrum.UI_POOL_DATA_PROVIDER,
//   provider,
//   chainId: ChainId.arbitrum_one,
// });

export const lendingPoolAddressProvider = markets.AaveV3Arbitrum.POOL_ADDRESSES_PROVIDER;

export function getTimestamp() {
  return Math.floor(Date.now() / 1000);
}
