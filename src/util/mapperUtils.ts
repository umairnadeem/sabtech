import { LineItem } from "../models/LineItem";
import { Order } from "../models/Order";
import { keyBy, mapValues } from "lodash";
import { sumObjectsByKey } from "./mathUtils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { format } from "date-fns";
import { StoreStatusMajor } from "@shopify/polaris-icons";

dayjs.extend(utc);

export type MappedOrder = Order & {
  lineItems?: LineItem[];
};

export interface OrderFinancials {
  grossRevenue: number;
  shippingRevenue: number;
  discounts: number;
  returns: number;
  cogs: number;
  createdAt?: Date;
}

export enum TimeInterval {
  MONTH = "MONTH",
}

export interface TimeRange {
  from: Date;
  to: Date;
}

const monthYear = (date: string | Date): string =>
  dayjs(date).local().startOf("month").format("MMM YYYY");

const subMonths = (date: string | Date, n: number): Date =>
  dayjs(date).local().subtract(n, "months").toDate();

const isAfter = (date: string | Date, dateToCompare: string | Date): boolean =>
  dayjs(date).local().isAfter(dayjs(dateToCompare));

export const mapOrderData = (
  orderData: (Order | LineItem)[]
): MappedOrder[] => {
  const idToOrder = keyBy(
    orderData.filter((order): order is Order => "id" in order),
    "id"
  );
  orderData.forEach((order) => {
    if ("__parentId" in order) {
      const parentOrder: MappedOrder = idToOrder[order.__parentId];
      parentOrder.lineItems = parentOrder.lineItems
        ? [...parentOrder.lineItems, order]
        : [order];
    }
  });
  return Object.values(idToOrder);
};

export const sumOrderFinancials = (
  mappedOrders: MappedOrder[]
): OrderFinancials[] => {
  console.log("mappedOrders", mappedOrders);
  return mappedOrders.map((order) => ({
    grossRevenue:
      Number(order.totalPriceSet?.shopMoney?.amount ?? 0) +
      Number(order.totalDiscountsSet?.shopMoney?.amount ?? 0) -
      Number(order.totalShippingPriceSet?.shopMoney?.amount ?? 0),
    discounts: Number(order.totalDiscountsSet?.shopMoney?.amount ?? 0),
    returns: Number(order.totalRefundedSet?.shopMoney?.amount ?? 0),
    shippingRevenue:
      Number(order.totalShippingPriceSet?.shopMoney?.amount ?? 0) -
      Number(order.totalRefundedShippingSet?.shopMoney?.amount ?? 0),
    cogs: (order.lineItems ?? []).reduce(
      (sum, lineItem) =>
        sum +
        lineItem.currentQuantity *
          Number(lineItem?.variant?.inventoryItem?.unitCost?.amount ?? 0),
      0
    ),
    createdAt: new Date(order.createdAt),
  }));
};

export function mapProfitLossStatement(
  data: any,
  from: Date,
  to: Date
): Record<string, OrderFinancials> {
  const output = {};
  let date = to;
  while (isAfter(date, from)) {
    output[monthYear(date)] = {
      grossRevenue: 0,
      shippingRevenue: 0,
      discounts: 0,
      returns: 0,
      cogs: 0,
    };
    date = subMonths(date, 1);
  }
  data.shopifyqlQuery.tableData.rowData.forEach((row) => {
    output[row[0]] = {
      grossRevenue: row[1].substring(1),
      shippingRevenue: row[2].substring(1),
      discounts: row[3].substring(1),
      returns: row[4].substring(1),
      cogs: row[5].substring(1),
    };
  });
  return output;
}

export function sumProfitLossStatement(
  mappedData: Record<string, OrderFinancials>
): OrderFinancials {
  const mappedObj = Object.values(mappedData).map((obj) =>
    mapValues(obj, Number)
  );
  console.log(mappedObj);
  return sumObjectsByKey(...mappedObj);
}
