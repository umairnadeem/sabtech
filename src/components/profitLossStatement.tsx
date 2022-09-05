import { flow } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { useBulkQuery } from "../hooks/useBulkQuery";
import { LineItem } from "../models/LineItem";
import { Order } from "../models/Order";
import { getOrders } from "../queries/getOrders";
import {
  groupOrderFinancials,
  mapOrderData,
  mapProfitLossStatement,
  OrderFinancials,
  sumOrderFinancials,
  sumProfitLossStatement,
  TimeInterval,
} from "../util/mapperUtils";
import { DataTable, Modal } from "@shopify/polaris";
import { sumObjectsByKey } from "../util/mathUtils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import axios from "axios";
import { useAppBridge } from "@shopify/app-bridge-react/useAppBridge";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { useQuery } from "react-apollo";
import { getProfitLossStatement } from "../queries/getProfitLossStatement";

dayjs.extend(utc);

// const today = new Date();
// const params = {
//   to: new Date("2021-11-01T00:00:00.000Z") || today,
//   from:
//     new Date("2021-10-01T00:00:00.000Z") ||
//     new Date(today.getFullYear() - 1, today.getMonth() + 1, today.getDate()),
// };

function download(dataurl, filename) {
  const link = document.createElement("a");
  link.href = dataurl;
  link.download = filename;
  link.click();
}

export default function ProfitLossStatement(props) {
  const { loading, error, data } = useQuery(
    getProfitLossStatement(props.start, props.end)
  );

  const [rows, setRows] = useState([]);
  const [primaryFooterAction, setPrimaryFooterAction] = useState(null);
  useEffect(() => {
    if (data) {
      console.log(data);
      const mappedData = mapProfitLossStatement(data, props.start, props.end);
      console.log(mappedData);
      const summedPostData = sumProfitLossStatement(mappedData);
      console.log(summedPostData);
      setRows([
        ["Gross Revenue", summedPostData?.grossRevenue],
        ["Shipping Revenue", summedPostData?.shippingRevenue],
        ["Discounts", summedPostData?.discounts],
        ["Returns", summedPostData?.returns],
        ["Cost of goods sold", summedPostData?.cogs],
      ]);
      setPrimaryFooterAction(() => () =>
        download(
          `/xls?data=${btoa(JSON.stringify(mappedData))}`,
          "reports.xlsx"
        )
      );
    }
  }, [data]);
  return (
    <Modal
      loading={!data}
      instant
      large
      open={props.active}
      onClose={props.handleClose}
      title={props.selected.label}
      primaryAction={{ content: "Download", onAction: primaryFooterAction }}
      // secondaryActions={[{ content: "Share" }]}
    >
      <Modal.Section>
        <DataTable
          columnContentTypes={["text", "numeric"]}
          headings={["Category", "Total"]}
          rows={rows}
        />
      </Modal.Section>
    </Modal>
  );
}
