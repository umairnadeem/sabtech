import {
  Page,
  Card,
  Select,
  Frame,
  Navigation,
  DatePicker,
  TextField,
  FormLayout,
} from "@shopify/polaris";
import { HomeMinor } from "@shopify/polaris-icons";
import { useState, useCallback } from "react";
import ProfitLossStatement from "../components/profitLossStatement";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

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
  const today = new Date();
  const [{ month, year }, setDate] = useState({
    month: today.getMonth() - 1,
    year: 2022,
  });
  const [selectedDates, setSelectedDates] = useState({
    start: new Date(today.getFullYear() - 1, today.getMonth() + 1, 1),
    end: today,
  });
  const [startDate, setStartDate] = useState(
    dayjs(selectedDates.start).format("MM-DD-YYYY")
  );
  const [endDate, setEndDate] = useState(
    dayjs(selectedDates.end).format("MM-DD-YYYY")
  );
  const onChangeDatePicker = (dates) => {
    setStartDate(dayjs(dates.start).format("MM-DD-YYYY"));
    setEndDate(dayjs(dates.end).format("MM-DD-YYYY"));
    setSelectedDates(dates);
  };

  const onChangeStart = (date) => {
    setStartDate(date);
    if (dayjs(date).isValid()) {
      setSelectedDates({
        start: new Date(date),
        end: selectedDates.end,
      });
    }
  };

  const onChangeEnd = (date) => {
    setEndDate(date);
    if (dayjs(date).isValid()) {
      setSelectedDates({
        end: new Date(date),
        start: selectedDates.start,
      });
    }
  };

  const handleMonthChange = useCallback(
    (month, year) => setDate({ month, year }),
    []
  );

  const getModal = () => {
    if (active) {
      switch (selected.value) {
        case "profitLossStatement":
          return (
            <ProfitLossStatement
              active={active}
              handleClose={handleClose}
              selected={selected}
              start={
                new Date(
                  `${dayjs(selectedDates.start).format(
                    "YYYY-MM-DD"
                  )}T00:00:00.000Z`
                )
              }
              end={dayjs(
                new Date(
                  `${dayjs(selectedDates.end).format(
                    "YYYY-MM-DD"
                  )}T00:00:00.000Z`
                )
              )
                .toDate()}
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
          <Card.Section>
            <DatePicker
              month={month}
              year={year}
              onChange={onChangeDatePicker}
              onMonthChange={handleMonthChange}
              selected={selectedDates}
              multiMonth
              allowRange
            />
          </Card.Section>
          <Card.Section>
            <FormLayout>
              <FormLayout.Group>
                <TextField
                  label="From"
                  value={startDate}
                  onChange={onChangeStart}
                  autoComplete="off"
                />
                <TextField
                  label="To"
                  value={endDate}
                  onChange={onChangeEnd}
                  autoComplete="off"
                />
              </FormLayout.Group>
            </FormLayout>
          </Card.Section>
        </Card>
      </Page>
      {getModal()}
    </Frame>
  );
}
