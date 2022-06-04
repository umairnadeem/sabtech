import {
  Page,
  Card,
  Select,
  Frame,
  Navigation,
  Modal,
  TextContainer,
  Button,
  DataTable,
} from "@shopify/polaris";
import { HomeMinor, OrdersMinor, ProductsMinor } from "@shopify/polaris-icons";
import { useQuery } from "react-apollo";
import { useBulkQuery } from "../hooks/useBulkQuery";
import { LineItem } from "../models/LineItem";
import { Order } from "../models/Order";
import { getOrders } from "../queries/getOrders";
import {
  groupOrderFinancials,
  mapOrderData,
  sumOrderFinancials,
  TimeInterval,
} from "../util/mapperUtils";
import { flow } from "lodash/fp";
import { useEffect, useState, useRef, useCallback } from "react";
import ProfitLossStatement from "../components/profitLossStatement";

export default function Index() {
  const options = [
    {
      label: "Profit & Loss statement",
      value: "profitLossStatement",
    },
  ];
  const [selected, setSelected] = useState(options[0]);
  const handleSelectChange = useCallback((value) => setSelected(value), []);

  const [active, setActive] = useState(false);

  const handleOpen = useCallback(() => setActive(true), []);

  const handleClose = useCallback(() => setActive(false), []);

  const getModal = () => {
    if (active) {
      switch (selected.value) {
        case "profitLossStatement":
          return (
            <ProfitLossStatement
              active={active}
              handleClose={handleClose}
              selected={selected}
            />
          );
        default:
          return null;
      }
    }
  };

  const navigationMarkup = (
    <Navigation location="/">
      <Navigation.Section
        items={[
          {
            url: "/",
            label: "Home",
            icon: HomeMinor,
          },
          {
            url: "/path/to/place",
            label: "Orders",
            icon: OrdersMinor,
            badge: "15",
          },
          {
            url: "/path/to/place",
            label: "Products",
            icon: ProductsMinor,
          },
        ]}
      />
    </Navigation>
  );

  return (
    <Frame navigation={navigationMarkup}>
      <Page title="Reports">
        <Card
          primaryFooterAction={{ content: "Generate", onAction: handleOpen }}
        >
          <Card.Section>
            <Select
              label="Select report to generate"
              options={options}
              onChange={handleSelectChange}
              value={selected.value}
            />
          </Card.Section>
        </Card>
      </Page>
      {getModal()}
    </Frame>
  );
}
