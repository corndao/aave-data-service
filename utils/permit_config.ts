import { ChainId } from "@aave/contract-helpers";

export const permitByChainAndToken: {
  [chainId: number]: Record<string, boolean>;
} = {
  [ChainId.mainnet]: {
    "0x6b175474e89094c44da98b954eedeac495271d0f": false,
    "0x83f20f44975d03b1b09e64809b757c47f942beea": false,
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": false,
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": false,
    "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0": false,
    "0x6810e776880c02933d47db1b9fc05908e5386b96": false,
    "0xae78736cd615f374d3085123a210448e74fc6393": false,
    "0xdac17f958d2ee523a2206206994597c13d831ec7": false,
  },
  //Keep for debugging purposes - This relates to Aave v3 on Polygon
  [ChainId.polygon]: {
    "0x4e3decbb3645551b8a19f0ea1678079fcb33fb4c": true,
  },
  [100]: {
    "0xe91d153e0b41518a2ce8dd3d7944fa863463a97d": false,
    "0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1": false,
    "0x6c76971f98945ae98dd7d4dfca8711ebea946ea6": false,
    "0x9c58bacc331c9aa871afd802db6379a98e80cedb": false,
  },
};
