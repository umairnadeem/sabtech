export interface LineItem {
  variant: {
    inventoryItem: {
      unitCost?: {
        amount: string;
      };
    };
  };
  currentQuantity: number;
  __parentId: string;
}
