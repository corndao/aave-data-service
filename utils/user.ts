import { formatReserves, formatUserSummary } from '@aave/math-utils';
import { getTimestamp, lendingPoolAddressProvider, poolDataProviderContract } from './helper';

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
