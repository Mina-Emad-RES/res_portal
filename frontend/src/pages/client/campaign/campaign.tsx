"use client";

import {
  Box,
  Card,
  Flex,
  Spinner,
  Text,
  VStack,
  Button,
} from "@chakra-ui/react";
import { RefreshCw } from "lucide-react";
import CampaignsHero from "./CampaignsHero";
import CampaignsFilters from "./CampaignsFilters";
import CampaignNumbers from "./CampaignNumbers";
import CampaignGraph from "./CampaignGraph";
import { useCampaignData } from "./useCampaignData";

function SectionLoader({ label }: { label: string }) {
  return (
    <Flex minH="160px" align="center" justify="center">
      <VStack gap={3}>
        <Spinner size="md" color="brand.solid" />
        <Text color="fg.muted" fontSize="sm">
          {label}
        </Text>
      </VStack>
    </Flex>
  );
}

function SectionError({ onRetry }: { onRetry: () => void }) {
  return (
    <Flex minH="160px" align="center" justify="center">
      <VStack gap={3}>
        <Text color="fg.muted" fontSize="sm">
          Something went wrong.
        </Text>
        <Button size="sm" variant="subtle" onClick={onRetry}>
          <RefreshCw size={14} />
          Retry
        </Button>
      </VStack>
    </Flex>
  );
}

export default function Campaign() {
  const {
    isAdmin,
    clientOptions,
    clientsLoading,
    selectedCampaign,
    selectedCampaignLabel,
    dateRange,
    summaryState,
    logsState,
    handleCampaignChange,
    handleDateChange,
    retrySummary,
    retryLogs,
  } = useCampaignData();

  const nothingSelected =
    summaryState.status === "idle" && logsState.status === "idle";

  if (clientsLoading) {
    return (
      <Flex minH="50vh" align="center" justify="center" bg="bg">
        <VStack gap={3}>
          <Spinner size="lg" color="brand.solid" />
          <Text color="fg.muted">Loading...</Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <Box minH="100dvh" bg="bg">
      <Box
        maxW="1240px"
        mx="auto"
        px={{ base: 4, md: 6 }}
        py={{ base: 6, md: 8 }}
      >
        <VStack align="stretch" gap={6}>
          <CampaignsHero
            campaignName={selectedCampaignLabel || "Campaign Dashboard"}
          />

          <Card.Root
            variant="outline"
            bg="bg.panel"
            borderColor="border"
            rounded="2xl"
            shadow="xs"
          >
            <Card.Body p={{ base: 4, md: 5 }}>
              <CampaignsFilters
                showCampaignFilter={isAdmin}
                campaignOptions={clientOptions}
                selectedCampaign={selectedCampaign}
                onCampaignChange={handleCampaignChange}
                dateRange={dateRange}
                onDateChange={handleDateChange}
              />
            </Card.Body>
          </Card.Root>

          {nothingSelected && (
            <Flex minH="30vh" align="center" justify="center">
              <Text color="fg.muted">
                Select a date range to load campaign data.
              </Text>
            </Flex>
          )}

          {summaryState.status !== "idle" && (
            <Card.Root
              variant="outline"
              bg="bg.panel"
              borderColor="border"
              rounded="2xl"
              shadow="xs"
            >
              <Card.Body p={{ base: 4, md: 5 }}>
                {summaryState.status === "loading" && (
                  <SectionLoader label="Loading summary..." />
                )}
                {summaryState.status === "error" && (
                  <SectionError onRetry={retrySummary} />
                )}
                {summaryState.status === "success" && (
                  <CampaignNumbers summary={summaryState.data} />
                )}
              </Card.Body>
            </Card.Root>
          )}

          {logsState.status !== "idle" && (
            <Card.Root
              variant="outline"
              bg="bg.panel"
              borderColor="border"
              rounded="2xl"
              shadow="xs"
            >
              <Card.Body p={{ base: 4, md: 5 }}>
                {logsState.status === "loading" && (
                  <SectionLoader label="Loading call logs..." />
                )}
                {logsState.status === "error" && (
                  <SectionError onRetry={retryLogs} />
                )}
                {logsState.status === "success" && (
                  <CampaignGraph logs={logsState.data} />
                )}
              </Card.Body>
            </Card.Root>
          )}
        </VStack>
      </Box>
    </Box>
  );
}
