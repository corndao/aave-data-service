import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { fetchMarketsData } from "../../utils/markets";

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
};

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const res = await fetchMarketsData();
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(res),
  };
};

export { handler };
