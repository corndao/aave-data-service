import {
  UserAction,
  calculateHealthFactor,
} from "../../../utils/health_factor";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
};

interface Env {
  KV: KVNamespace;
}

const userActions: { [act: string]: UserAction } = {
  deposit: UserAction.Deposit,
  withdraw: UserAction.Withdraw,
  borrow: UserAction.Borrow,
  repay: UserAction.Repay,
};

export const onRequest: PagesFunction<Env> = async (context) => {
  const { chain, user } = context.params;
  const { searchParams } = new URL(context.request.url);
  const action = searchParams.get("action");
  const amount = searchParams.get("amount");
  const asset = searchParams.get("asset");

  const res = await calculateHealthFactor(
    chain as any,
    user as string,
    asset as string,
    userActions[action as string],
    parseFloat(amount as string)
  );

  return new Response(JSON.stringify(res), {
    status: 200,
    headers,
  });
};
