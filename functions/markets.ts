import { fetchMarketsData } from "../utils/markets";

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
};

interface Env {
	KV: KVNamespace;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const res = await fetchMarketsData();
 	return new Response(JSON.stringify(res), {
    status: 200,
    headers,
  });
}
