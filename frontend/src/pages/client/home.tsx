"use client";

import {
  Box,
  Button,
  Card,
  Flex,
  HStack,
  Spinner,
  Tabs,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useAuth } from "../../context/useAuth";
import AuditView from "./AuditView";
import DMView from "./DMView";
import EmptyMessage from "./EmptyMessage";
import ReportsFilters from "./ReportsFilters";
import ReportsHero from "./ReportsHero";
import type { MainTab } from "./report-types";
import { useReportsData } from "./useReportsData";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  Joyride,
  STATUS,
  type EventData,
  type Step,
  type TooltipRenderProps,
} from "react-joyride";

const TourTooltip = ({
  index,
  size,
  step,
  backProps,
  primaryProps,
  skipProps,
  tooltipProps,
  continuous,
  isLastStep,
}: TooltipRenderProps) => {
  return (
    <Box
      {...tooltipProps}
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
      rounded="2xl"
      overflow="hidden"
      boxShadow="0 24px 60px rgba(15, 23, 42, 0.18), 0 8px 24px rgba(15, 23, 42, 0.10)"
      maxW="520px"
      w="full"
    >
      <Box h="1.5" bg="brand.solid" />

      <Box px={6} pt={6} pb={4}>
        <HStack justify="space-between" align="center" mb={4}>
          <Text
            fontSize="xs"
            fontWeight="semibold"
            textTransform="uppercase"
            letterSpacing="0.12em"
            color="brand.fg"
          >
            Guided Tour
          </Text>

          <Text fontSize="sm" fontWeight="semibold" color="fg.muted">
            {`${index + 1} / ${size}`}
          </Text>
        </HStack>

        <Text color="fg" lineHeight="tall" fontSize="md">
          {step.content}
        </Text>
      </Box>

      <Flex
        justify="space-between"
        align="center"
        gap={3}
        px={6}
        py={5}
        borderTopWidth="1px"
        borderTopColor="border.muted"
        bg="bg.subtle"
      >
        <HStack gap={2}>
          {!isLastStep && skipProps && (
            <Button
              {...skipProps}
              variant="ghost"
              size="md"
              rounded="lg"
              color="fg.muted"
              _hover={{ bg: "bg.hover", color: "fg" }}
            >
              Skip Tour
            </Button>
          )}

          {index > 0 && (
            <Button
              {...backProps}
              variant="ghost"
              size="md"
              rounded="lg"
              color="fg.muted"
              _hover={{ bg: "bg.hover", color: "fg" }}
            >
              Back
            </Button>
          )}
        </HStack>

        <HStack gap={2}>
          <Button
            {...primaryProps}
            colorPalette="brand"
            size="md"
            rounded="lg"
            px={5}
          >
            {continuous ? (isLastStep ? "Finish" : "Next") : "Done"}
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default function Home() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const shouldRunTour = location.state?.runClientTour === true;
  const hasClearedTourState = useRef(false);

  const [runTour, setRunTour] = useState(() => shouldRunTour);

  const steps: Step[] = [
    {
      target: "body",
      placement: "center",
      skipBeacon: true,
      content:
        "Welcome to the RES-VA portal. This workspace is designed to give you a clear view of your campaign performance and reporting insights.",
    },
    {
      target: ".tour-date-filter",
      content:
        "This dropdown allows you to navigate between reporting periods. The most recent report is automatically selected as the default view.",
    },
    {
      target: ".tour-info-popover",
      content:
        "You will notice these help icons across the portal. They provide additional context and guidance wherever needed.",
    },
    {
      target: "body",
      placement: "center",
      skipBeacon: true,
      content:
        "Thank you for completing the tour. We hope the portal provides a smooth and valuable reporting experience.",
    },
  ];

  const handleJoyrideEvent = (data: EventData) => {
    const isDone =
      data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED;

    if (isDone) {
      setRunTour(false);
    }
  };

  const {
    loading,
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

  useEffect(() => {
    if (!shouldRunTour || loading) return;
    if (hasClearedTourState.current) return;

    hasClearedTourState.current = true;

    navigate(location.pathname, {
      replace: true,
      state: undefined,
    });
  }, [shouldRunTour, loading, navigate, location.pathname]);

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

  return (
    <>
      <Joyride
        steps={steps}
        run={runTour}
        continuous
        scrollToFirstStep
        onEvent={handleJoyrideEvent}
        tooltipComponent={TourTooltip}
        options={{
          zIndex: 10000,
          buttons: ["back", "primary"],
        }}
        locale={{
          back: "Back",
          last: "Finish",
          next: "Next",
          nextWithProgress: "Next {current}/{total}",
          skip: "Skip Tour",
        }}
        styles={{
          tooltip: {
            padding: 0,
            backgroundColor: "transparent",
            boxShadow: "none",
          },
          tooltipContainer: {
            padding: 0,
            textAlign: "left",
          },
          overlay: {
            backgroundColor: "rgba(11, 18, 32, 0.55)",
          },
          beacon: {
            zIndex: 10000,
          },
        }}
      />

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
                    showClientFilter={user?.role === "ADMIN"}
                    clientOptions={clientOptions}
                    selectedClientId={selectedClientId}
                    onClientChange={handleClientChange}
                    dateOptions={dateOptions}
                    selectedDate={selectedDate}
                    onDateChange={handleDateChange}
                  />
                </Card.Body>
              </Card.Root>
            </Box>

            {!dates.length ? (
              <EmptyMessage
                title="No reports found"
                description="There are no reporting periods available for this campaign yet."
              />
            ) : (
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
            )}
          </VStack>
        </Box>
      </Box>
    </>
  );
}
