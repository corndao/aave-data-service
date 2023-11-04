# Data Service for Spark Protocol BOS Component

This service aggregates data from Spark Protocol across multiple chains, providing a crucial link between Spark Lend and applications that wish to utilize its data. Spark Lend, based on the Aave v3 codebase, is currently live on Gnosis and Ethereum.
https://github.com/marsfoundation/sparklend

## Features

- Aggregates and serves market data from Spark Lend.
- Provides user-specific deposit, debt, and health factor information.
- Supports multiple blockchains (i.e. where Spark Protocol is deployed)

## Getting Started

You can deploy this locally, or have it run on Cloudflare.

### Prerequisites

Before running the service locally, ensure you have the following installed:
- Node.js
- Yarn package manager

## Installation (locally)

1. Clone the repository to your local machine.
2. Run `yarn install` to install dependencies.
3. Use `yarn start` to run the app server locally on `localhost:8080`.


## Deployment


Deploy the service to Cloudflare Pages with the `yarn deploy` command. 

Ensure you have the correct permissions and environmental variables set up.
i.e. in the [Cloudflare Dashboard]([url](https://dash.cloudflare.com/)), under `Workers & Pages` create a Page with name `spark-api` (or which name you defined in `package.json`). You **do not** need to link it to the Github repo. 

## Support Chains (chainID)

- Ethereum Mainnet (1)
- Gnosis (100)
- _For debuggin purposes only:_ Polygon Mainnet (137) (fetching data from Aave v3 on Polygon)

## API endpoints

- markets

  - `GET` `/:chainId/markets`
  - Get all available Spark Lend markets
  - `chainId`: Spark Lend supported chain ID
 
    Example query: http://localhost:8080/100/markets

- deposits

  - `GET` `/:chainId/deposits/:user`
  - Get user deposits
  - `chainId`: Spark Lend supported chain ID
  - `user`: user address

  Example query: http://localhost:8080/100/deposits/0xca4aD39F872E89Ef23eABd5716363Fc22513E147
  
- debts

  - `GET` `/:chainId/debts/:user`
  - Get user debts
  - `chainId`: Spark Lend supported chain ID
  - `user`: user address
 
    Example query: http://localhost:8080/100/debts/0xca4aD39F872E89Ef23eABd5716363Fc22513E147

- health factor
  - `GET` `/:chainId/health/:user`
  - Estimate user's new health factor after certain action
  - `chainId`: Spark Lend supported chain ID
  - `user`: user address
  - query params
    - `action`: `deposit` | `withdraw` | `borrow` | `repay`
    - `amount`: token USD value
    - `asset`: token address
   
    Example query: http://localhost:8080/100/health/0xca4aD39F872E89Ef23eABd5716363Fc22513E147?action=deposit&amount=10&asset=0xe91d153e0b41518a2ce8dd3d7944fa863463a97d



## Acknowledgments

A special thank you to the contributors and maintainers of the Aave Data Service, originally developed for the AAVE v3 NEAR BOS Component, upon which this project is based.

References:
https://github.com/corndao/aave-data-service

https://near.org/aave-v3.near/widget/AAVE

