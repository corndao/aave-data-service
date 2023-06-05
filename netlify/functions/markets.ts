import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { fetchMarketsData } from "../../utils/markets";

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const res = await fetchMarketsData();
  return {
    statusCode: 200,
    body: JSON.stringify(res),
  };
};

export { handler };
