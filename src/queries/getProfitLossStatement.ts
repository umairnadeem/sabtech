import { gql } from "apollo-boost";
import esc from "js-string-escape";

export const getProfitLossStatement = (query: string) => gql`
  query {
    shopifyqlQuery(
      query: "FROM sales SHOW total_sales BY month SINCE -1y UNTIL today"
    ) {
      __typename
      ... on TableResponse {
        tableData {
          rowData
          columns {
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
