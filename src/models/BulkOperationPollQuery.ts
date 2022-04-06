export interface BulkOperationPollQuery {
  node: {
    id: string;
    status: string;
    errorCode?: string;
    createdAt: string;
    completedAt?: string;
    objectCount: string;
    fileSize?: string;
    url?: string;
    partialDataUrl?: string;
  };
}
