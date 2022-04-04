import { gql } from "apollo-boost";

export const GET_ORDERS = gql`
  {
    orders(first: 11) {
      edges {
        node {
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
          lineItems(first: 10) {
            edges {
              node {
                variant {
                  inventoryItem {
                    id
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
