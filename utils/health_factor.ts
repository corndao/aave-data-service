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
  const userSummary = await fetchUserSummary(chainId, userAddress);
  const reserves = await fetchFormattedPoolReserves(chainId);

  const targetReserve = _.find(
    reserves,
    (r) => r["underlyingAsset"] === asset.toLowerCase()
  );
  if (!targetReserve) {
    throw new Error("bad asset id");
  }
  if (
    (action === UserAction.Deposit || action === UserAction.Withdraw) &&
    (!targetReserve.usageAsCollateralEnabled || targetReserve.isIsolated)
  ) {
    return userSummary.healthFactor;
  }

  const reserveLiquidationThreshold =
    parseInt(targetReserve.reserveLiquidationThreshold) / 10000;

  const totalCollateralUSD = valueToBigNumber(userSummary.totalCollateralUSD);
  const totalBorrowsUSD = valueToBigNumber(
    userSummary.totalBorrowsMarketReferenceCurrency
  );

  let totalCollateralUSDAfter = totalCollateralUSD;
  let totalBorrowsUSDAfter = totalBorrowsUSD;
  let liquidationThresholdAfter = valueToBigNumber(
    userSummary.currentLiquidationThreshold
  );

  switch (action) {
    case UserAction.Deposit: {
      totalCollateralUSDAfter = totalCollateralUSD.plus(amountUSD);
      liquidationThresholdAfter = totalCollateralUSD
        .multipliedBy(valueToBigNumber(userSummary.currentLiquidationThreshold))
        .plus(
          valueToBigNumber(amountUSD).multipliedBy(reserveLiquidationThreshold)
        )
        .dividedBy(totalCollateralUSDAfter);
      break;
    }
    case UserAction.Withdraw: {
      totalCollateralUSDAfter = totalCollateralUSD.minus(amountUSD);
      liquidationThresholdAfter = totalCollateralUSD
        .multipliedBy(valueToBigNumber(userSummary.currentLiquidationThreshold))
        .minus(
          valueToBigNumber(amountUSD).multipliedBy(reserveLiquidationThreshold)
        )
        .dividedBy(totalCollateralUSDAfter);
      break;
    }
    case UserAction.Borrow: {
      totalBorrowsUSDAfter = totalBorrowsUSD.plus(amountUSD);
      break;
    }
    case UserAction.Repay: {
      totalBorrowsUSDAfter = totalBorrowsUSD.minus(amountUSD);
      break;
    }
  }

  const newHealthFactor = calculateHealthFactorFromBalancesBigUnits({
    collateralBalanceMarketReferenceCurrency: totalCollateralUSDAfter,
    borrowBalanceMarketReferenceCurrency: totalBorrowsUSDAfter,
    currentLiquidationThreshold: liquidationThresholdAfter,
  });

  return newHealthFactor.toString();
}
