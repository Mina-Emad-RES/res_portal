"use client";

import { Box, Card, Flex, Spinner, Tabs, Text, VStack } from "@chakra-ui/react";
import { useAuth } from "../../../context/useAuth";
import AuditView from "./AuditView";
import DMView from "./DMView";
import EmptyMessage from "./EmptyMessage";
import ReportsFilters from "./ReportsFilters";
import ReportsHero from "./ReportsHero";
import type { MainTab } from "./report-types";
import { useReportsData } from "./useReportsData";

export default function Reports() {
  const { user } = useAuth();

  const {
    loading,
    loadingDates,
    loadingReport,
    selectedDate,
    selectedClientId,
    selectedClientLabel,
    selectedData,
    dates,
    clientOptions,
    dateOptions,
    mainTab,
    setMainTab,
    handleClientChange,
    handleDateChange,
  } = useReportsData();

  if (loading) {
    return (
      <Flex minH="50vh" align="center" justify="center" bg="bg">
        <VStack gap={3}>
          <Spinner size="lg" color="brand.solid" />
          <Text color="fg.muted">Loading reports...</Text>
        </VStack>
      </Flex>
    );
  }

  // Content-area state derivation
  const isAdmin = user?.role === "ADMIN";
  const needsClient = isAdmin && !selectedClientId;
  const noDatesAvailable = !needsClient && !loadingDates && dates.length === 0;
  const needsDate =
    !needsClient && !loadingDates && dates.length > 0 && !selectedDate;
  const showLoadingReport = !!selectedDate && loadingReport;
  const showReport = !!selectedDate && !loadingReport;

  return (
    <Box minH="100dvh" bg="bg">
      <Box
        maxW="1240px"
        mx="auto"
        px={{ base: 4, md: 6 }}
        py={{ base: 6, md: 8 }}
      >
        <VStack align="stretch" gap={6}>
          <Box className="hero-section">
            <ReportsHero
              selectedClientLabel={selectedClientLabel}
              selectedDate={selectedDate}
              periodCount={dates.length}
              hasAudit={Boolean(selectedData?.AUDIT)}
              hasDM={Boolean(selectedData?.DM)}
            />
          </Box>

          <Box className="report-filters">
            <Card.Root
              variant="outline"
              bg="bg.panel"
              borderColor="border"
              rounded="2xl"
              shadow="xs"
            >
              <Card.Body p={{ base: 4, md: 5 }}>
                <ReportsFilters
                  showClientFilter={isAdmin}
                  clientOptions={clientOptions}
                  selectedClientId={selectedClientId}
                  onClientChange={handleClientChange}
                  dateOptions={dateOptions}
                  selectedDate={selectedDate}
                  onDateChange={handleDateChange}
                  loadingDates={loadingDates}
                  dateDisabled={needsClient}
                />
              </Card.Body>
            </Card.Root>
          </Box>

          {needsClient ? (
            <EmptyMessage
              title="Select a client"
              description="Choose a client from the dropdown to view their available reports."
            />
          ) : loadingDates ? (
            <Flex minH="200px" align="center" justify="center">
              <VStack gap={3}>
                <Spinner size="lg" color="brand.solid" />
                <Text color="fg.muted">Loading available dates...</Text>
              </VStack>
            </Flex>
          ) : noDatesAvailable ? (
            <EmptyMessage
              title="No reports found"
              description="There are no reporting periods available for this campaign yet."
            />
          ) : needsDate ? (
            <EmptyMessage
              title="Select a date"
              description="Choose a reporting date from the dropdown to view the report."
            />
          ) : showLoadingReport ? (
            <Flex minH="300px" align="center" justify="center">
              <VStack gap={3}>
                <Spinner size="lg" color="brand.solid" />
                <Text color="fg.muted">Loading report...</Text>
              </VStack>
            </Flex>
          ) : showReport ? (
            <Card.Root
              variant="outline"
              bg="bg.panel"
              borderColor="border"
              rounded="2xl"
              shadow="xs"
            >
              <Card.Body p={{ base: 4, md: 5 }}>
                <Tabs.Root
                  value={mainTab}
                  onValueChange={(e) => setMainTab(e.value as MainTab)}
                  variant="subtle"
                  colorPalette="brand"
                  size="lg"
                  fitted
                  lazyMount
                  unmountOnExit
                >
                  <Tabs.List
                    bg="bg.muted"
                    p="1"
                    rounded="xl"
                    gap="1"
                    borderWidth="1px"
                    borderColor="border"
                  >
                    <Tabs.Trigger
                      className="audit-tab"
                      value="audit"
                      rounded="lg"
                      borderWidth="1px"
                      borderColor="transparent"
                      color="fg.muted"
                      transition="all 0.2s ease"
                      _hover={{ color: "fg" }}
                      _selected={{
                        bg: "brand.subtle",
                        color: "brand.fg",
                        borderColor: "brand.emphasized",
                        shadow: "xs",
                      }}
                    >
                      Audit Report
                    </Tabs.Trigger>

                    <Tabs.Trigger
                      className="dm-tab"
                      value="dm"
                      rounded="lg"
                      borderWidth="1px"
                      borderColor="transparent"
                      color="fg.muted"
                      transition="all 0.2s ease"
                      _hover={{ color: "fg" }}
                      _selected={{
                        bg: "brand.subtle",
                        color: "brand.fg",
                        borderColor: "brand.emphasized",
                        shadow: "xs",
                      }}
                    >
                      Data Report
                    </Tabs.Trigger>
                  </Tabs.List>

                  <Tabs.Content value="audit" pt={5}>
                    {selectedData?.AUDIT ? (
                      <AuditView content={selectedData.AUDIT} />
                    ) : (
                      <EmptyMessage
                        title="No audit report"
                        description="There is no audit report for the selected reporting period."
                      />
                    )}
                  </Tabs.Content>

                  <Tabs.Content value="dm" pt={5}>
                    {selectedData?.DM ? (
                      <DMView content={selectedData.DM} />
                    ) : (
                      <EmptyMessage
                        title="No data report"
                        description="There is no data report for the selected reporting period."
                      />
                    )}
                  </Tabs.Content>
                </Tabs.Root>
              </Card.Body>
            </Card.Root>
          ) : null}
        </VStack>
      </Box>
    </Box>
  );
}
