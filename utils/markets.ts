import { ChainId, UiPoolDataProvider } from "@aave/contract-helpers";
import { formatReserves } from "@aave/math-utils";
import { ethers } from "ethers";
import { chainConfig, getTimestamp } from "./helper";
import { permitByChainAndToken } from "./permit_config";

interface Market {
  id: string;
  underlyingAsset: string;
  name: string;
  symbol: string;
  decimals: number;
  supplyAPY: string;
  marketReferencePriceInUsd: string;
  usageAsCollateralEnabled: boolean;
  aTokenAddress: string;
  variableBorrowAPY: string;
  variableDebtTokenAddress: string;
  supportPermit: boolean;
}

export async function fetchFormattedPoolReserves(chainId: ChainId) {
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

  return formatReserves({
    reserves: reserves.reservesData,
    currentTimestamp: getTimestamp(),
    marketReferenceCurrencyDecimals:
      reserves.baseCurrencyData.marketReferenceCurrencyDecimals,
    marketReferencePriceInUsd:
      reserves.baseCurrencyData.marketReferenceCurrencyPriceInUsd,
  });
}

export async function fetchMarketsData(chainId: ChainId): Promise<Market[]> {
  const formattedPoolReserves = await fetchFormattedPoolReserves(chainId);
  const permitConfig = permitByChainAndToken;

  return formattedPoolReserves.map((reserve) => {
    return {
      id: reserve.id,
      underlyingAsset: reserve.underlyingAsset,
      name: reserve.name,
      symbol: reserve.symbol,
      decimals: reserve.decimals,
      supplyAPY: reserve.supplyAPY,
      marketReferencePriceInUsd: reserve.priceInUSD,
      usageAsCollateralEnabled: reserve.usageAsCollateralEnabled,
      aTokenAddress: reserve.aTokenAddress,
      variableDebtTokenAddress: reserve.variableDebtTokenAddress,
      isIsolated: reserve.isIsolated,
      availableLiquidity: reserve.availableLiquidity,
      availableLiquidityUSD: reserve.availableLiquidityUSD,
      variableBorrowAPY: reserve.variableBorrowAPY,
      supportPermit: !!permitConfig[chainId][reserve.underlyingAsset],
    };
  });
}
