import { ChainId } from "@aave/contract-helpers";
import * as markets from "@bgd-labs/aave-address-book";

export const chainConfig: {
  [key: number]: {
    providerRPC: string;
    uiPoolDataProviderAddress: string;
    lendingPoolAddressProvider: string;
    walletBalanceProvider: string;
  };
} = {
  //Hardcoded the addresses of Spark protocol deployments
  //No Github 'address book' for Spark Protocol available
  [ChainId.mainnet]: {
    providerRPC: "https://eth-pokt.nodies.app",
    uiPoolDataProviderAddress: "0xF028c2F4b19898718fD0F77b9b881CbfdAa5e8Bb",
    lendingPoolAddressProvider: "0x02C3eA4e34C0cBd694D2adFa2c690EECbC1793eE",
    walletBalanceProvider: "0xd2AeF86F51F92E8e49F42454c287AE4879D1BeDc",
  },
  [100]: {
    providerRPC: "https://gnosis-pokt.nodies.app",
    uiPoolDataProviderAddress: "0xF028c2F4b19898718fD0F77b9b881CbfdAa5e8Bb",
    lendingPoolAddressProvider: "0xA98DaCB3fC964A6A0d2ce3B77294241585EAbA6d",
    walletBalanceProvider: "0xd2AeF86F51F92E8e49F42454c287AE4879D1BeDc",
  },
  //Keep for debugging purposes - This relates to Aave v3 on Polygon
  [ChainId.polygon]: {
    providerRPC: "https://rpc.ankr.com/polygon",
    uiPoolDataProviderAddress: markets.AaveV3Polygon.UI_POOL_DATA_PROVIDER,
    lendingPoolAddressProvider: markets.AaveV3Polygon.POOL_ADDRESSES_PROVIDER,
    walletBalanceProvider: markets.AaveV3Polygon.WALLET_BALANCE_PROVIDER,
  },
};

export function getTimestamp() {
  return Math.floor(Date.now() / 1000);
}
