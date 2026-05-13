"use client";

import {
  Box,
  Button,
  DatePicker,
  Flex,
  Grid,
  Icon,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { parseDate } from "@internationalized/date";
import { LuCalendar, LuChevronDown } from "react-icons/lu";
import SearchableSelect from "../../../components/my-ui/SearchableSelect";
import type React from "react";
import type { SelectOption } from "./useCampaignData";

type PresetTriggerValue = React.ComponentProps<
  typeof DatePicker.PresetTrigger
>["value"];

type CampaignsFiltersProps = {
  showCampaignFilter: boolean;
  campaignOptions: SelectOption[];
  selectedCampaign: string;
  onCampaignChange: (value: string) => void;
  dateRange: [Date | null, Date | null];
  onDateChange: (dates: [Date | null, Date | null]) => void;
};

const presets: { id: string; value: PresetTriggerValue; label: string }[] = [
  { id: "last7Days", value: "last7Days", label: "Last 7 days" },
  { id: "last30Days", value: "last30Days", label: "Last 30 days" },
  { id: "thisMonth", value: "thisMonth", label: "This month" },
  { id: "lastMonth", value: "lastMonth", label: "Last month" },
  { id: "thisYear", value: "thisYear", label: "This year" },
  { id: "lastYear", value: "lastYear", label: "Last year" },
];

const formatDateValue = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const toDatePickerValue = (date: Date | null) => {
  if (!date) return null;

  return parseDate(formatDateValue(date));
};

const fromDatePickerValue = (value: any): Date | null => {
  if (!value) return null;

  if (
    typeof value.year === "number" &&
    typeof value.month === "number" &&
    typeof value.day === "number"
  ) {
    return new Date(value.year, value.month - 1, value.day);
  }

  return null;
};

export default function CampaignsFilters({
  showCampaignFilter,
  campaignOptions,
  selectedCampaign,
  onCampaignChange,
  dateRange,
  onDateChange,
}: CampaignsFiltersProps) {
  const datePickerValue = [
    toDatePickerValue(dateRange[0]),
    toDatePickerValue(dateRange[1]),
  ].filter((date): date is NonNullable<typeof date> => Boolean(date));

  const handleValueChange = (details: { value: any[] }) => {
    onDateChange([
      fromDatePickerValue(details.value[0]),
      fromDatePickerValue(details.value[1]),
    ]);
  };

  return (
    <Grid
      templateColumns={{
        base: "1fr",
        md: showCampaignFilter ? "repeat(2, minmax(0, 1fr))" : "1fr",
      }}
      gap={4}
    >
      {showCampaignFilter && (
        <Box>
          <Text
            fontWeight="medium"
            color="fg.subtle"
            mb={2}
            h="40px"
            display="flex"
            alignItems="center"
          >
            Select Campaign
          </Text>

          <SearchableSelect
            options={campaignOptions}
            value={selectedCampaign || ""}
            onChange={onCampaignChange}
            placeholder="All campaigns"
            emptyText="No campaigns found"
            size="lg"
          />
        </Box>
      )}

      <Box>
        <Text
          fontWeight="medium"
          color="fg.subtle"
          mb={2}
          h="40px"
          display="flex"
          alignItems="center"
        >
          Select Date Range
        </Text>

        <DatePicker.Root
          lazyMount
          unmountOnExit
          selectionMode="range"
          defaultView="day"
          value={datePickerValue}
          onValueChange={handleValueChange}
        >
          <DatePicker.Control>
            <DatePicker.Trigger asChild unstyled>
              <Flex
                as="button"
                align="center"
                gap={2.5}
                px={3.5}
                h="48px"
                bg="bg.subtle"
                border="1px solid"
                borderColor="border"
                rounded="xl"
                cursor="pointer"
                w="full"
                _hover={{ bg: "bg.hover", borderColor: "border.emphasized" }}
                _focusVisible={{
                  outline: "2px solid",
                  outlineColor: "brand.solid",
                  outlineOffset: "2px",
                }}
                transition="all 0.15s ease"
              >
                <Icon color="fg.muted" boxSize={4}>
                  <LuCalendar />
                </Icon>

                <Flex flex="1" align="center" gap={1.5} overflow="hidden">
                  <DatePicker.Input
                    index={0}
                    placeholder="Start date"
                    unstyled
                    style={{
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      fontSize: "0.875rem",
                      color: "inherit",
                      cursor: "pointer",
                      width: "90px",
                      minWidth: 0,
                    }}
                  />

                  <Text fontSize="sm" color="fg.muted" flexShrink={0}>
                    →
                  </Text>

                  <DatePicker.Input
                    index={1}
                    placeholder="End date"
                    unstyled
                    style={{
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      fontSize: "0.875rem",
                      color: "inherit",
                      cursor: "pointer",
                      width: "90px",
                      minWidth: 0,
                    }}
                  />
                </Flex>

                <Icon color="fg.muted" boxSize={3.5} flexShrink={0}>
                  <LuChevronDown />
                </Icon>
              </Flex>
            </DatePicker.Trigger>
          </DatePicker.Control>

          <Portal>
            <DatePicker.Positioner>
              <DatePicker.Content
                maxW="100dvw"
                w="fit-content"
                overflow="auto"
                shadow="lg"
                rounded="xl"
                border="1px solid"
                borderColor="border"
              >
                <Flex
                  px={{ base: "3", sm: "4" }}
                  py={{ base: "3", sm: "4" }}
                  gap={{ base: "3", sm: "6" }}
                  flexDirection={{ base: "column", sm: "row" }}
                >
                  <VStack
                    align="stretch"
                    gap={{ base: "1.5", sm: "2" }}
                    minW={{ base: "full", sm: "140px" }}
                  >
                    <Text
                      fontSize="xs"
                      fontWeight="semibold"
                      color="fg.muted"
                      textTransform="uppercase"
                      letterSpacing="0.05em"
                      mb={1}
                    >
                      Quick select
                    </Text>

                    {presets.map(({ id, value, label }) => (
                      <DatePicker.PresetTrigger key={id} value={value} asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          width="100%"
                          justifyContent="start"
                        >
                          {label}
                        </Button>
                      </DatePicker.PresetTrigger>
                    ))}
                  </VStack>

                  <Box
                    display={{ base: "none", sm: "block" }}
                    w="1px"
                    bg="border"
                    alignSelf="stretch"
                  />

                  <Flex direction="column" flex="1" minW={0}>
                    <DatePicker.View view="day">
                      <DatePicker.Header />
                      <DatePicker.DayTable />
                    </DatePicker.View>

                    <DatePicker.View view="month">
                      <DatePicker.Header />
                      <DatePicker.MonthTable />
                    </DatePicker.View>

                    <DatePicker.View view="year">
                      <DatePicker.Header />
                      <DatePicker.MonthTable />
                    </DatePicker.View>
                  </Flex>
                </Flex>
              </DatePicker.Content>
            </DatePicker.Positioner>
          </Portal>
        </DatePicker.Root>
      </Box>
    </Grid>
  );
}
