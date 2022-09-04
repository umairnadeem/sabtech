import { flow } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { useBulkQuery } from "../hooks/useBulkQuery";
import { LineItem } from "../models/LineItem";
import { Order } from "../models/Order";
import { getOrders } from "../queries/getOrders";
import {
  groupOrderFinancials,
  mapOrderData,
  OrderFinancials,
  sumOrderFinancials,
  TimeInterval,
} from "../util/mapperUtils";
import { DataTable, Modal } from "@shopify/polaris";
import { sumObjectsByKey } from "../util/mathUtils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import axios from "axios";

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
  const params = {
    from: props.start,
    to: props.end,
  };
  console.log(params.from.toISOString(), params.to.toISOString());
  const { error, data } = useBulkQuery<(Order | LineItem)[]>(
    getOrders(
      `created_at:>=${params.from.toISOString()} AND created_at:<=${dayjs
        .utc(params.to)
        .add(1, "day")
        .toISOString()}`
    )
  );
  const [rows, setRows] = useState([]);
  const [primaryFooterAction, setPrimaryFooterAction] = useState(null);
  useEffect(() => {
    if (data) {
      const postData = groupOrderFinancials(
        flow(mapOrderData, sumOrderFinancials)(data),
        TimeInterval.MONTH,
        params
      );
      const summedPostData: OrderFinancials = sumObjectsByKey(
        ...Object.values(postData)
      );
      setRows([
        ["Gross Revenue", summedPostData?.grossRevenue],
        ["Shipping Revenue", summedPostData?.shippingRevenue],
        ["Discounts", summedPostData?.discounts],
        ["Returns", summedPostData?.returns],
        ["Cost of goods sold", summedPostData?.cogs],
      ]);
      setPrimaryFooterAction(() => () =>
        download(`/xls?data=${btoa(JSON.stringify(postData))}`, "reports.xlsx")
      );
      axios.post("/rest");
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
