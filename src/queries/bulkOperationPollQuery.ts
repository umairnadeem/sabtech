import { gql } from "apollo-boost";

export const BULK_OPERATION_POLL_QUERY = gql`
  query BulkOperationPollQuery($id: ID!) {
    node(id: $id) {
      ... on BulkOperation {
        id
        status
        errorCode
        createdAt
        completedAt
        objectCount
        fileSize
        url
        partialDataUrl
      }
    }
  }
`;
