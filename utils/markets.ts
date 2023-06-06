import { formatReserves, } from '@aave/math-utils';
import { getTimestamp, } from './helper';
import * as markets from '@bgd-labs/aave-address-book';
import { ethers } from 'ethers';
import { UiPoolDataProvider, ChainId } from '@aave/contract-helpers';

interface Market {
  id: string,
  underlyingAsset: string,
  name: string,
  symbol: string,
  decimals: number, 
}

export async function fetchMarketsData(): Promise<Market[]> {
  const lendingPoolAddressProvider = markets.AaveV3Arbitrum.POOL_ADDRESSES_PROVIDER;
  const provider = new ethers.providers.JsonRpcProvider(
    'https://arb-mainnet-public.unifra.io',
  );
  
  // View contract used to fetch all reserves data (including market base currency data), and user reserves
  // Using Aave V3 Eth Mainnet address for demo
  const poolDataProviderContract = new UiPoolDataProvider({
    uiPoolDataProviderAddress: markets.AaveV3Arbitrum.UI_POOL_DATA_PROVIDER,
    provider,
    chainId: ChainId.arbitrum_one,
  });
  // Object containing array of pool reserves and market base currency data
  // { reservesArray, baseCurrencyData }
  const reserves = await poolDataProviderContract.getReservesHumanized({
    lendingPoolAddressProvider: lendingPoolAddressProvider,
  });

  const formattedPoolReserves = formatReserves({
    reserves: reserves.reservesData,
    currentTimestamp: getTimestamp(),
    marketReferenceCurrencyDecimals:
      reserves.baseCurrencyData.marketReferenceCurrencyDecimals,
    marketReferencePriceInUsd: reserves.baseCurrencyData.marketReferenceCurrencyPriceInUsd,
  });

  return formattedPoolReserves.map(reserve => {
    return {
      id: reserve.id,
      underlyingAsset: reserve.underlyingAsset,
      name: reserve.name,
      symbol: reserve.symbol,
      decimals: reserve.decimals,
    };
  });
}

fetchMarketsData().then(console.log);
