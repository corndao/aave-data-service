import { formatReserves, } from '@aave/math-utils';
import { chainId, getTimestamp, lendingPoolAddressProvider, providerRPC, uiPoolDataProviderAddress, } from './helper';
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
  const provider = new ethers.providers.JsonRpcProvider(
    {
      // `skipFetchSetup` is required for Cloudflare Worker according to the issue: 
      // https://github.com/ethers-io/ethers.js/issues/1886#issuecomment-1063531514
      skipFetchSetup: true,
      url: providerRPC,
    }
  );
  
  // View contract used to fetch all reserves data (including market base currency data), and user reserves
  // Using Aave V3 Eth Mainnet address for demo
  const poolDataProviderContract = new UiPoolDataProvider({
    uiPoolDataProviderAddress,
    provider,
    chainId,
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
