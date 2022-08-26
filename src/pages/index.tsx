import { Page, Card, Select, Frame, Navigation } from "@shopify/polaris";
import { HomeMinor } from "@shopify/polaris-icons";
import { useState, useCallback } from "react";
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
            label: "Reports",
            icon: HomeMinor,
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
