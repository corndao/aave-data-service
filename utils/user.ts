import { formatReserves, formatUserSummary } from '@aave/math-utils';
import { chainId, getTimestamp, lendingPoolAddressProvider, providerRPC, uiPoolDataProviderAddress, } from './helper';
import { ethers } from 'ethers';
import { UiPoolDataProvider } from '@aave/contract-helpers';

interface UserDeposit {
  underlyingAsset: string,
  name: string,
  symbol: string,
  scaledATokenBalance: string,
  usageAsCollateralEnabledOnUser: boolean,
  underlyingBalance: string,
  underlyingBalanceUSD: string,
}

export async function fetchUserDepositData(userAddress: string): Promise<UserDeposit[]> {
  console.log(userAddress);
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
    lendingPoolAddressProvider: lendingPoolAddressProvider
  });

  // Object containing array or users aave positions and active eMode category
  // { userReserves, userEmodeCategoryId }
  const userReserves = await poolDataProviderContract.getUserReservesHumanized({
    lendingPoolAddressProvider: lendingPoolAddressProvider,
    user: userAddress,
  });

  const reservesArray = reserves.reservesData;
  const baseCurrencyData = reserves.baseCurrencyData;
  const userReservesArray = userReserves.userReserves;

  const currentTimestamp = getTimestamp();

  const formattedPoolReserves = formatReserves({
    reserves: reservesArray,
    currentTimestamp,
    marketReferenceCurrencyDecimals:
      baseCurrencyData.marketReferenceCurrencyDecimals,
    marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
  });

  const userSummary = formatUserSummary({
    currentTimestamp,
    marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    marketReferenceCurrencyDecimals:
      baseCurrencyData.marketReferenceCurrencyDecimals,
    userReserves: userReservesArray,
    formattedReserves: formattedPoolReserves,
    userEmodeCategoryId: userReserves.userEmodeCategoryId,
  });

  return userSummary.userReservesData.map(reserve => {
    return {
      underlyingAsset: reserve.underlyingAsset,
      name: reserve.reserve.name,
      symbol: reserve.reserve.symbol,
      scaledATokenBalance: reserve.scaledATokenBalance,
      usageAsCollateralEnabledOnUser: reserve.usageAsCollateralEnabledOnUser,
      underlyingBalance: reserve.underlyingBalance,
      underlyingBalanceUSD: reserve.underlyingBalanceUSD,
    };
  });
}
