import { fetchTokenBalances } from "../../utils/token";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
};

interface Env {
  KV: KVNamespace;
}

/**
 * example: http://127.0.0.1:8788/balances?account=0xF7175dC7D7D42Cd41fD7d19f10adE1EA84D99D0C&tokens=0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9|0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9
 * NOTE: this endpoint will be deprecated
 */
export const onRequest: PagesFunction<Env> = async (context) => {
  const { searchParams } = new URL(context.request.url);
  const account = searchParams.get("account");
  const tokens = searchParams.get("tokens")?.split("|");

  if (!account || !tokens) {
    return new Response("missing query params", {
      status: 400,
      headers,
    });
  }

  const res = await fetchTokenBalances(
    context.params.chain as any,
    account,
    tokens
  );
  return new Response(JSON.stringify(res), {
    status: 200,
    headers,
  });
};
