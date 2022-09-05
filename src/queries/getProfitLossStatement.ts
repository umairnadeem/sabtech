import { gql } from "apollo-boost";

export const getProfitLossStatement = (from: Date, to: Date) => gql`
  query {
    shopifyqlQuery(
      query: "FROM sales SHOW gross_sales, shipping, discounts, returns, net_sales, total_cost BY month SINCE ${
        from.toISOString().split("T")[0]
      } UNTIL ${to.toISOString().split("T")[0]}"
    ) {
      __typename
      ... on TableResponse {
        tableData {
          rowData
          columns {
            # Elements in the columns section describe which column properties you want to return.
            name
            dataType
            displayName
          }
        }
      }
      # parseErrors specifies that you want errors returned, if there were any, and which error properties you want to return.
      parseErrors {
        code
        message
        range {
          start {
            line
            character
          }
          end {
            line
            character
          }
        }
      }
    }
  }
`;
