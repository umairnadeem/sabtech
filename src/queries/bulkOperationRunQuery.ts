import { gql } from "apollo-boost";

export const BULK_OPERATION_RUN_QUERY = gql`
  mutation BulkOperationRunQuery($query: String!) {
    bulkOperationRunQuery(query: $query) {
      bulkOperation {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
  }
`;
