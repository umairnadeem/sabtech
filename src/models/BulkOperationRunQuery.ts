export interface BulkOperationRunQuery {
  bulkOperationRunQuery: {
    bulkOperation: {
      id: string;
      status: string;
    };
    userErrors: any[];
  };
}
