import {
  ChainId,
  ReserveDataHumanized,
  UiPoolDataProvider,
  UserReserveData,
} from "@aave/contract-helpers";
import {
  ComputedUserReserve,
  FormatReserveResponse,
  formatReserves,
  formatUserSummary,
} from "@aave/math-utils";
import { ethers } from "ethers";
import { chainConfig, getTimestamp } from "./helper";
import { fetchFormattedPoolReserves } from "./markets";
import * as _ from "lodash";

interface UserDeposit {
  underlyingAsset: string;
  name: string;
  symbol: string;
  scaledATokenBalance: string;
  usageAsCollateralEnabledOnUser: boolean;
  underlyingBalance: string;
  underlyingBalanceUSD: string;
}

interface UserDebtSummary {
  healthFactor: string;
  netWorthUSD: string;
  availableBorrowsUSD: string;
  netAPY: number;
  debts: UserDebt[];
}

interface UserDebt {
  underlyingAsset: string;
  name: string;
  symbol: string;
  usageAsCollateralEnabledOnUser: boolean;
  scaledVariableDebt: string;
  variableBorrows: string;
  variableBorrowsUSD: string;
}

async function fetchUserSummary(chainId: ChainId, userAddress: string) {
  const chain = chainConfig[chainId];
  if (!chain) {
    throw new Error("bad chain id");
  }

  const provider = new ethers.providers.JsonRpcProvider({
    // `skipFetchSetup` is required for Cloudflare Worker according to the issue:
    // https://github.com/ethers-io/ethers.js/issues/1886#issuecomment-1063531514
    skipFetchSetup: true,
    url: chain.providerRPC,
  });

  // View contract used to fetch all reserves data (including market base currency data), and user reserves
  // Using Aave V3 Eth Mainnet address for demo
  const poolDataProviderContract = new UiPoolDataProvider({
    uiPoolDataProviderAddress: chain.uiPoolDataProviderAddress,
    provider,
    chainId,
  });

  // Object containing array of pool reserves and market base currency data
  // { reservesArray, baseCurrencyData }
  const reserves = await poolDataProviderContract.getReservesHumanized({
    lendingPoolAddressProvider: chain.lendingPoolAddressProvider,
  });

  // Object containing array or users aave positions and active eMode category
  // { userReserves, userEmodeCategoryId }
  const userReserves = await poolDataProviderContract.getUserReservesHumanized({
    lendingPoolAddressProvider: chain.lendingPoolAddressProvider,
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
    marketReferencePriceInUsd:
      baseCurrencyData.marketReferenceCurrencyPriceInUsd,
  });

  return formatUserSummary({
    currentTimestamp,
    marketReferencePriceInUsd:
      baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    marketReferenceCurrencyDecimals:
      baseCurrencyData.marketReferenceCurrencyDecimals,
    userReserves: userReservesArray,
    formattedReserves: formattedPoolReserves,
    userEmodeCategoryId: userReserves.userEmodeCategoryId,
  });
}

export async function fetchUserDepositData(
  chainId: ChainId,
  userAddress: string
): Promise<UserDeposit[]> {
  const userSummary = await fetchUserSummary(chainId, userAddress);
  return userSummary.userReservesData.map((reserve) => {
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

function calculateNetAPY(
  reserveData: FormatReserveResponse[],
  userData: ComputedUserReserve[]
): number {
  // asset id => apy
  const supplyAPYs = _.mapValues(
    _.keyBy(reserveData, (r) => r.underlyingAsset),
    (r) => parseFloat(r.supplyAPY)
  );
  // asset id => apy
  const vBorrowAPYs = _.mapValues(
    _.keyBy(reserveData, (r) => r.underlyingAsset),
    (r) => parseFloat(r.variableBorrowAPY)
  );

  const supplyWeightedSumAPY = _.sumBy(
    userData,
    (r) => parseFloat(r.underlyingBalanceUSD) * supplyAPYs[r.underlyingAsset]
  );
  const borrowWeightedSumAPY = _.sumBy(
    userData,
    (r) => parseFloat(r.variableBorrowsUSD) * vBorrowAPYs[r.underlyingAsset]
  );
  const totalWeightedSumAPY = supplyWeightedSumAPY - borrowWeightedSumAPY;

  const totalWeight =
    _.sumBy(userData, (r) => parseFloat(r.underlyingBalanceUSD)) -
    _.sumBy(userData, (r) => parseFloat(r.variableBorrowsUSD));

  return totalWeightedSumAPY / totalWeight;
}

export async function fetchUserDebtData(
  chainId: ChainId,
  userAddress: string
): Promise<UserDebtSummary> {
  const userSummary = await fetchUserSummary(chainId, userAddress);
  const debts = userSummary.userReservesData.map((reserve) => {
    return {
      underlyingAsset: reserve.underlyingAsset,
      name: reserve.reserve.name,
      symbol: reserve.reserve.symbol,
      usageAsCollateralEnabledOnUser: reserve.usageAsCollateralEnabledOnUser,
      scaledVariableDebt: reserve.scaledVariableDebt,
      variableBorrows: reserve.variableBorrows,
      variableBorrowsUSD: reserve.variableBorrowsUSD,
    };
  });

  const netAPY = calculateNetAPY(
    await fetchFormattedPoolReserves(chainId),
    userSummary.userReservesData
  );

  return {
    healthFactor: userSummary.healthFactor,
    netWorthUSD: userSummary.netWorthUSD,
    availableBorrowsUSD: userSummary.availableBorrowsUSD,
    netAPY,
    debts,
  };
}
