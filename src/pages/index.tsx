import { Heading, Page } from "@shopify/polaris";
import { useQuery } from "react-apollo";
import { useBulkQuery } from "../hooks/useBulkQuery";
import { LineItem } from "../models/LineItem";
import { Order } from "../models/Order";
import { getOrders } from "../queries/getOrders";
import { mapOrderData } from "../util/mapperUtils";
const today = new Date();
const params = {
  created_at_max: today.toISOString(),
  created_at_min: new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - 30
  ).toISOString(),
};

export default function Index() {
  // const { loading, error, data } = useQuery(GET_ORDERS, {
  //   variables: {
  //     query: `created_at:>=${params.created_at_min} AND created_at:<=${params.created_at_max}`,
  //   },
  // });
  const { error, data } = useBulkQuery<(Order | LineItem)[]>(
    getOrders(
      `created_at:>=${params.created_at_min} AND created_at:<=${params.created_at_max}`
    )
  );

  return (
    <Page>
      <Heading>
        Shopify app with Node and React and TS BRUh{" "}
        {data ? JSON.stringify(mapOrderData(data)) : JSON.stringify(error)}
        <span role="img" aria-label="tada emoji">
          🎉
        </span>
      </Heading>
    </Page>
  );
}
