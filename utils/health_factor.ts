import { ChainId } from "@aave/contract-helpers";
import { fetchUserSummary } from "./user";
import {
  calculateHealthFactorFromBalancesBigUnits,
  valueToBigNumber,
} from "@aave/math-utils";
import { fetchFormattedPoolReserves } from "./markets";
import * as _ from "lodash";

export enum UserAction {
  Deposit,
  Withdraw,
  Borrow,
  Repay,
}

export async function calculateHealthFactor(
  chainId: ChainId,
  userAddress: string,
  asset: string,
  action: UserAction,
  amountUSD: number
): Promise<string> {
  // Ensure asset is a non-empty string
  if (typeof asset !== 'string' || asset.trim() === '') {
    console.error("Invalid asset parameter:", asset); // Log the invalid asset
    throw new Error("Asset must be a non-empty string");
  }

  console.log(`Calculating health factor for asset: ${asset}`); // Log the valid asset

  const userSummary = await fetchUserSummary(chainId, userAddress);
  const reserves = await fetchFormattedPoolReserves(chainId);

  // Log all available asset IDs in reserves for debugging
  console.log("All asset IDs in reserves:", reserves.map(r => r.underlyingAsset));

  let lowerCaseAsset = asset.toLowerCase();
  // Log the asset ID you're searching for
  console.log("Searching for asset ID:", lowerCaseAsset);

  const targetReserve = _.find(
    reserves,
    (r) => r["underlyingAsset"] === lowerCaseAsset
  );

  if (!targetReserve) {
    console.error(`Asset ID not found: ${lowerCaseAsset}`);
    throw new Error("bad asset id");
  }

  if (
    (action === UserAction.Deposit || action === UserAction.Withdraw) &&
    (!targetReserve.usageAsCollateralEnabled || targetReserve.isIsolated)
  ) {
    return userSummary.healthFactor;
  }

  const reserveLiquidationThreshold = parseInt(targetReserve.reserveLiquidationThreshold) / 10000;
  const totalCollateralUSD = valueToBigNumber(userSummary.totalCollateralUSD);
  const totalBorrowsUSD = valueToBigNumber(userSummary.totalBorrowsMarketReferenceCurrency);

  let totalCollateralUSDAfter = totalCollateralUSD;
  let totalBorrowsUSDAfter = totalBorrowsUSD;
  let liquidationThresholdAfter = valueToBigNumber(userSummary.currentLiquidationThreshold);

  switch (action) {
    case UserAction.Deposit:
      totalCollateralUSDAfter = totalCollateralUSD.plus(amountUSD);
      liquidationThresholdAfter = totalCollateralUSD
        .multipliedBy(valueToBigNumber(userSummary.currentLiquidationThreshold))
        .plus(valueToBigNumber(amountUSD).multipliedBy(reserveLiquidationThreshold))
        .dividedBy(totalCollateralUSDAfter);
      break;
    case UserAction.Withdraw:
      totalCollateralUSDAfter = totalCollateralUSD.minus(amountUSD);
      liquidationThresholdAfter = totalCollateralUSD
        .multipliedBy(valueToBigNumber(userSummary.currentLiquidationThreshold))
        .minus(valueToBigNumber(amountUSD).multipliedBy(reserveLiquidationThreshold))
        .dividedBy(totalCollateralUSDAfter);
      break;
    case UserAction.Borrow:
      totalBorrowsUSDAfter = totalBorrowsUSD.plus(amountUSD);
      break;
    case UserAction.Repay:
      totalBorrowsUSDAfter = totalBorrowsUSD.minus(amountUSD);
      break;
  }

  const newHealthFactor = calculateHealthFactorFromBalancesBigUnits({
    collateralBalanceMarketReferenceCurrency: totalCollateralUSDAfter,
    borrowBalanceMarketReferenceCurrency: totalBorrowsUSDAfter,
    currentLiquidationThreshold: liquidationThresholdAfter,
  });

  return newHealthFactor.toString();
}
