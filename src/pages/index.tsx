import { Heading, Page } from "@shopify/polaris";
import { useQuery } from "react-apollo";
import { useBulkQuery } from "../hooks/useBulkQuery";
import { LineItem } from "../models/LineItem";
import { Order } from "../models/Order";
import { getOrders } from "../queries/getOrders";
import {
  groupOrderFinancials,
  mapOrderData,
  sumOrderFinancials,
  TimeInterval,
} from "../util/mapperUtils";
import { flow } from "lodash/fp";
import { useEffect, useState } from "react";
import axios from "axios";
const today = new Date();
const params = {
  to: today,
  from: new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()),
};

function download(dataurl, filename) {
  const link = document.createElement("a");
  link.href = dataurl;
  link.download = filename;
  link.click();
}

export default function Index() {
  const { error, data } = useBulkQuery<(Order | LineItem)[]>(
    getOrders(
      `created_at:>=${params.from.toISOString()} AND created_at:<=${params.to.toISOString()}`
    )
  );
  useEffect(() => {
    if (data) {
      const postData = groupOrderFinancials(
        flow(mapOrderData, sumOrderFinancials)(data),
        TimeInterval.MONTH,
        params
      );
      axios
        .get("/xls", postData)
        .then((data) => console.log(data))
        .catch((err) => console.error(err));
      download("/xls", "reports.xlsx");
    }
  }, [data]);

  return (
    <Page>
      <Heading>
        Shopify app with Node and React and TS BRUh{" "}
        {data ? JSON.stringify(data) : JSON.stringify(error)}
        <span role="img" aria-label="tada emoji">
          🎉
        </span>
      </Heading>
    </Page>
  );
}
