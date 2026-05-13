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
import InfoPopover from "../../../components/my-ui/InfoPopover";
import SearchableSelect from "../../../components/my-ui/SearchableSelect";
import type { SelectOption } from "./report-types";

type ReportsFiltersProps = {
  showClientFilter: boolean;
  clientOptions: SelectOption[];
  selectedClientId: string;
  onClientChange: (value: string) => void;
  dateOptions: SelectOption[];
  selectedDate: string;
  onDateChange: (value: string) => void;
  loadingDates?: boolean;
  dateDisabled?: boolean;
};

export default function ReportsFilters({
  showClientFilter,
  clientOptions,
  selectedClientId,
  onClientChange,
  dateOptions,
  selectedDate,
  onDateChange,
  loadingDates = false,
  dateDisabled = false,
}: ReportsFiltersProps) {
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

  const datePlaceholder = loadingDates
    ? "Loading dates..."
    : dateDisabled
      ? "Select a client first"
      : "Select date";

  return (
    <Grid
      templateColumns={{
        base: "1fr",
        md: showClientFilter ? "repeat(2, minmax(0, 1fr))" : "1fr",
      }}
      gap={4}
    >
      {showClientFilter && (
        <Box>
          <Text
            fontWeight="medium"
            color="fg.subtle"
            mb={2}
            h="40px"
            display="flex"
            alignItems="center"
          >
            Select Client
          </Text>
          <SearchableSelect
            options={clientOptions}
            value={selectedClientId}
            onChange={onClientChange}
            placeholder="Search client..."
            emptyText="No clients found"
            size="lg"
          />
        </Box>
      )}

      <Box className="tour-date-filter">
        <HStack mb={2} h="40px" align="center" gap={2}>
          <Text fontWeight="medium" color="fg.subtle">
            Select Date
          </Text>
          <Box as="span" className="tour-info-popover">
            <InfoPopover content="Reports usually include data from 2 weeks prior to the selected date." />
          </Box>
        </HStack>

        <Select.Root
          collection={dateCollection}
          multiple={false}
          size="lg"
          variant="subtle"
          value={selectedDate ? [selectedDate] : []}
          disabled={dateDisabled || loadingDates}
          onValueChange={(details) => {
            onDateChange(details.value[0] ?? "");
          }}
        >
          <Select.HiddenSelect />

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
              <Select.ValueText placeholder={datePlaceholder} />
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
