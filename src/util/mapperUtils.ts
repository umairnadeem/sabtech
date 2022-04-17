import { LineItem } from "../models/LineItem";
import { Order } from "../models/Order";
import { keyBy } from "lodash";
import { isAfter, subMonths, startOfMonth } from "date-fns";
import { sumObjectsByKey } from "./mathUtils";

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
  return mappedOrders.map((order) => ({
    grossRevenue:
      Number(order.totalPriceSet?.shopMoney?.amount ?? 0) +
      Number(order.totalDiscountsSet?.shopMoney?.amount ?? 0),
    discounts: Number(order.totalDiscountsSet?.shopMoney?.amount ?? 0),
    returns: Number(order.totalRefundedSet?.shopMoney?.amount ?? 0),
    shippingRevenue: Number(
      order.totalShippingPriceSet?.shopMoney?.amount ?? 0
    ),
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

export const groupOrderFinancials = (
  orderFinancials: OrderFinancials[],
  interval: TimeInterval,
  range: TimeRange
): Record<string, OrderFinancials> => {
  const output: Record<string, OrderFinancials> = {};
  console.log(orderFinancials);
  if (interval == TimeInterval.MONTH) {
    let date = range.to;
    while (isAfter(date, range.from)) {
      output[startOfMonth(date).toISOString()] = {
        grossRevenue: 0,
        shippingRevenue: 0,
        discounts: 0,
        returns: 0,
        cogs: 0,
      };
      date = subMonths(date, 1);
    }
    orderFinancials.forEach((financial) => {
      const financialDate = startOfMonth(financial.createdAt).toISOString();
      output[financialDate] = sumObjectsByKey(output[financialDate], financial);
    });
    return output;
  }
  throw new Error(`Invalid time interval specified: ${interval}`);
};
