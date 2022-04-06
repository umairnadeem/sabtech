import { LineItem } from "../models/LineItem";
import { Order } from "../models/Order";
import { keyBy } from "lodash";

export type MappedOrder = Order & {
  lineItems?: LineItem[];
};

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
