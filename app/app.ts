import cors from "@koa/cors";
import Koa from "koa";
import Router from "koa-router";
import logger from "koa-logger";
import { UserAction, calculateHealthFactor } from "../utils/health_factor";
import { fetchMarketsData } from "../utils/markets";
import { fetchTokenBalances } from "../utils/token";
import { fetchUserDebtData, fetchUserDepositData } from "../utils/user";

const app = new Koa();
const router = new Router();

router.get("/:chainId/markets", async (ctx) => {
  ctx.body = await fetchMarketsData(ctx.params.chainId as any);
});

router.get("/:chainId/deposits/:user", async (ctx) => {
  ctx.body = await fetchUserDepositData(
    ctx.params.chainId as any,
    ctx.params.user as string
  );
});

router.get("/:chainId/debts/:user", async (ctx) => {
  ctx.body = await fetchUserDebtData(
    ctx.params.chainId as any,
    ctx.params.user as string
  );
});

router.get("/:chainId/balances", async (ctx) => {
  const { searchParams } = new URL(ctx.request.URL);
  const account = searchParams.get("account");
  const tokens = searchParams.get("tokens")?.split("|");

  if (!account || !tokens) {
    ctx.body = "missing query params";
    ctx.status = 400;
    return;
  }

  ctx.body = await fetchTokenBalances(
    ctx.params.chainId as any,
    account,
    tokens
  );
});

const userActions: { [act: string]: UserAction } = {
  deposit: UserAction.Deposit,
  withdraw: UserAction.Withdraw,
  borrow: UserAction.Borrow,
  repay: UserAction.Repay,
};

router.get("/:chainId/health/:user", async (ctx) => {
  const { chainId, user } = ctx.params;
  const { searchParams } = new URL(ctx.request.URL);
  const action = searchParams.get("action");
  const amount = searchParams.get("amount");
  const asset = searchParams.get("asset");

  ctx.body = await calculateHealthFactor(
    chainId as any,
    user as string,
    asset as string,
    userActions[action as string],
    parseFloat(amount as string)
  );
});

app.use(cors()).use(logger()).use(router.routes()).use(router.allowedMethods());

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Running at port ${port}`);
});
