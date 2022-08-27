import { gql } from "apollo-boost";
import esc from "js-string-escape";

export const getOrders = (query: string) => gql`
  query {
    orders(first: 1000000, query: ${query ? `"${esc(query)}"` : null}) {
      edges {
        node {
          id,
          createdAt,
          totalPriceSet {
            shopMoney {
              amount
            }
          }
          totalDiscountsSet {
            shopMoney {
              amount
            }
          }
          totalRefundedSet {
            shopMoney {
              amount
            }
          }
          totalShippingPriceSet {
            shopMoney {
              amount
            }
          }
          totalRefundedShippingSet {
            shopMoney {
              amount
            }
          }
          lineItems(first: 100) {
            edges {
              node {
                variant {
                  inventoryItem {
                    unitCost {
                      amount
                    }
                  }
                }
                currentQuantity
              }
            }
          }
        }
      }
    }
  }
`;
