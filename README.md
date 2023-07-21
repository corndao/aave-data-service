# Data Service for AAVE BOS Component

AAVE NEAR BOS: https://near.org/aave-v3.near/widget/AAVE

## Run locally

- `yarn i`
- `yarn start`
- App server will run on `localhost:8080`

## Deploy to cloudflare pages

- `yarn deploy`

## APIs

- markets

  - `GET` `/:chainId/markets`
  - Get all available AAVE markets
  - `chainId`: AAVE supported chain ID

- deposits

  - `GET` `/:chainId/deposits/:user`
  - Get user deposits
  - `chainId`: AAVE supported chain ID
  - `user`: user address

- debts

  - `GET` `/:chainId/debts/:user`
  - Get user debts
  - `chainId`: AAVE supported chain ID
  - `user`: user address

- health factor
  - `GET` `/:chainId/health/:user`
  - Estimate user's new health factor after certain action
  - `chainId`: AAVE supported chain ID
  - `user`: user address
  - query params
    - `action`: `deposit` | `withdraw` | `borrow` | `repay`
    - `amount`: token USD value
    - `asset`: token address
