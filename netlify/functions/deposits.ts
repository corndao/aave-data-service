import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { fetchUserDepositData } from "../../utils/user";

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const userAddress = event.queryStringParameters?.address;
  if (!userAddress) {
    throw new Error("missing user address");
  }

  const res = await fetchUserDepositData(userAddress);
  return {
    statusCode: 200,
    body: JSON.stringify(res),
  };
};

export { handler };
