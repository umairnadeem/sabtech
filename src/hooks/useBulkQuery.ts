import { useMutation, useQuery } from "react-apollo";
import { BulkOperationRunQuery } from "../models/BulkOperationRunQuery";
import { BULK_OPERATION_RUN_QUERY } from "../queries/bulkOperationRunQuery";
import { useEffect, useState } from "react";
import { BulkOperationPollQuery } from "../models/BulkOperationPollQuery";
import { BULK_OPERATION_POLL_QUERY } from "../queries/bulkOperationPollQuery";
import { print } from "graphql/language/printer";
import { DocumentNode } from "graphql";
import { ApolloError } from "apollo-boost";
import { jsonlToJson } from "../util/jsonlUtils";

export const useBulkQuery = <T>(
  query: DocumentNode
): {
  data: T;
  error: ApolloError;
} => {
  const [
    runBulkQuery,
    { data: runData, error: runError },
  ] = useMutation<BulkOperationRunQuery>(BULK_OPERATION_RUN_QUERY, {
    variables: { query: print(query) },
  });
  const id = runData?.bulkOperationRunQuery?.bulkOperation?.id;
  console.log("rundata", runData);
  console.log("got id", id);
  const {
    data: pollData,
    error: pollError,
    startPolling,
    stopPolling,
  } = useQuery<BulkOperationPollQuery>(BULK_OPERATION_POLL_QUERY, {
    skip: !id,
    variables: { id },
  });
  const [jsonData, setJsonData] = useState(undefined);
  const extractJson = async (data) => {
    const extractedData = await jsonlToJson(data?.node?.url);
    setJsonData(extractedData);
    console.log("got poll data", extractedData);
  };

  useEffect(() => {
    console.log("running query", print(query));
    runBulkQuery();
  }, [query, runBulkQuery]);

  useEffect(() => {
    if (id) {
      startPolling(1000);
      console.log("started polling", id);
    }
    if (pollData?.node?.status === "COMPLETED") {
      stopPolling();
      extractJson(pollData);
    }
    return () => stopPolling();
  }, [startPolling, stopPolling, runBulkQuery, id, pollData]);
  return {
    data: jsonData,
    error: runError,
  };
};
