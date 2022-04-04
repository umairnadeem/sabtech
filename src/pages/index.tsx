import { Heading, Page } from "@shopify/polaris";
import { useQuery } from "react-apollo";
import { GET_ORDERS } from "./queries/getOrders";

export default function Index() {
  const { loading, error, data } = useQuery(GET_ORDERS);
  return (
    <Page>
      <Heading>
        Shopify app with Node and React and TS BRUh{" "}
        {JSON.stringify(data) + JSON.stringify(error)}
        <span role="img" aria-label="tada emoji">
          🎉
        </span>
      </Heading>
    </Page>
  );
}
