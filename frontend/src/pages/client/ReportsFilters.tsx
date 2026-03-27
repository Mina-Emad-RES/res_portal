"use client";

import {
  Box,
  Grid,
  HStack,
  Select,
  Text,
  createListCollection,
} from "@chakra-ui/react";
import { useMemo } from "react";
import InfoPopover from "../../components/my-ui/InfoPopover";
import type { SelectOption } from "./report-types";

type ReportsFiltersProps = {
  showClientFilter: boolean;
  clientOptions: SelectOption[];
  selectedClientId: string;
  onClientChange: (value: string) => void;
  dateOptions: SelectOption[];
  selectedDate: string;
  onDateChange: (value: string) => void;
};

export default function ReportsFilters({
  showClientFilter,
  clientOptions,
  selectedClientId,
  onClientChange,
  dateOptions,
  selectedDate,
  onDateChange,
}: ReportsFiltersProps) {
  const clientCollection = useMemo(
    () =>
      createListCollection({
        items: clientOptions,
      }),
    [clientOptions],
  );

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.slice(0, 10).split("-");
    return `${month}/${day}/${year}`;
  };

  const dateCollection = useMemo(
    () =>
      createListCollection({
        items: dateOptions.map((item) => ({
          ...item,
          label: formatDate(item.label),
        })),
      }),
    [dateOptions],
  );

  return (
    <Grid
      templateColumns={{
        base: "1fr",
        md: showClientFilter ? "repeat(2, minmax(0, 1fr))" : "1fr",
      }}
      gap={4}
    >
      {showClientFilter && (
        <Select.Root
          collection={clientCollection}
          multiple={false}
          size="lg"
          variant="subtle"
          value={selectedClientId ? [selectedClientId] : []}
          onValueChange={(details) => {
            onClientChange(details.value[0] ?? "");
          }}
        >
          <Select.HiddenSelect />

          <Select.Label
            fontWeight="medium"
            color="fg.subtle"
            mb={2}
            height="40px"
          >
            Select Client
          </Select.Label>

          <Select.Control>
            <Select.Trigger
              rounded="xl"
              bg="bg.subtle"
              borderWidth="1px"
              borderColor="border"
              transition="background 0.2s ease, border-color 0.2s ease"
              _hover={{
                bg: "bg.hover",
                borderColor: "border.emphasized",
              }}
              _focusVisible={{
                borderColor: "brand.solid",
              }}
            >
              <Select.ValueText placeholder="Select client" />
            </Select.Trigger>

            <Select.IndicatorGroup color="fg.muted">
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>

          <Select.Positioner>
            <Select.Content
              rounded="xl"
              bg="bg.panel"
              borderColor="border.emphasized"
              shadow="lg"
            >
              {clientCollection.items.map((item) => (
                <Select.Item key={item.value} item={item}>
                  {item.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      )}

      <Box className="tour-date-filter">
        <Select.Root
          collection={dateCollection}
          multiple={false}
          size="lg"
          variant="subtle"
          value={selectedDate ? [selectedDate] : []}
          onValueChange={(details) => {
            onDateChange(details.value[0] ?? "");
          }}
        >
          <Select.HiddenSelect />

          <Select.Label
            fontWeight="medium"
            color="fg.subtle"
            mb={2}
            height="40px"
          >
            <HStack gap={2}>
              <Text>Select Date</Text>
              <Box as="span" className="tour-info-popover">
                <InfoPopover content="This report includes data from the 2 weeks prior to the selected date." />
              </Box>
            </HStack>
          </Select.Label>

          <Select.Control>
            <Select.Trigger
              rounded="xl"
              bg="bg.subtle"
              borderWidth="1px"
              borderColor="border"
              transition="background 0.2s ease, border-color 0.2s ease"
              _hover={{
                bg: "bg.hover",
                borderColor: "border.emphasized",
              }}
              _focusVisible={{
                borderColor: "brand.solid",
              }}
            >
              <Select.ValueText placeholder="Select date" />
            </Select.Trigger>

            <Select.IndicatorGroup color="fg.muted">
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>

          <Select.Positioner>
            <Select.Content
              rounded="xl"
              bg="bg.panel"
              borderColor="border.emphasized"
              shadow="lg"
            >
              {dateCollection.items.map((item) => (
                <Select.Item key={item.value} item={item}>
                  {item.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      </Box>
    </Grid>
  );
}
