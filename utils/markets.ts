import { formatReserves, } from '@aave/math-utils';
import { getTimestamp, lendingPoolAddressProvider, poolDataProviderContract } from './helper';

interface Market {
  id: string,
  underlyingAsset: string,
  name: string,
  symbol: string,
  decimals: number, 
}

export async function fetchMarketsData(): Promise<Market[]> {
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
