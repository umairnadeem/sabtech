export interface Order {
  id: string;
  createdAt: string;
  totalPriceSet: {
    shopMoney?: {
      amount: string;
    };
  };
  totalDiscountsSet: {
    shopMoney?: {
      amount: string;
    };
  };
  totalRefundedSet: {
    shopMoney?: {
      amount: string;
    };
  };
  totalShippingPriceSet: {
    shopMoney?: {
      amount: string;
    };
  };
}
