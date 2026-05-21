"use client";

import { Box, Button, Flex, HStack, Text } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Joyride,
  STATUS,
  type EventData,
  type Step,
  type TooltipRenderProps,
} from "react-joyride";
import { useAuth } from "../../context/useAuth";
import type { Options } from "react-joyride";

const NAV_DELAY_MS = 350;

// ─── Step definitions ──────────────────────────────────────────

const reportsSteps: Step[] = [
  {
    target: "body",
    placement: "center",
    skipBeacon: true,
    content:
      "Welcome to the RES-VA portal. This workspace is designed to give you a clear view of your campaign performance and reporting insights.",
  },
  {
    target: ".tour-nav-reports",
    content:
      "This is the Reports page. It contains the full reports that help you understand why your campaign is performing the way it is.",
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
    target: ".tour-nav-campaign",
    content:
      "This is the Campaign page. It shows exact numbers so you can directly see the performance and activity of your campaign.",
  },
];

const campaignSteps: Step[] = [
  {
    target: ".tour-campaign-date-picker",
    skipBeacon: true,
    content:
      "Select a date range to view campaign metrics and analysis for that period.",
  },
  {
    target: "body",
    placement: "center",
    skipBeacon: true,
    content:
      "Thank you for completing the tour. We hope the portal provides a smooth and valuable reporting experience.",
  },
];

// Counter math — make the two phases look like one continuous tour.
const REPORTS_COUNT = reportsSteps.length;
const CAMPAIGN_COUNT = campaignSteps.length;
const TOTAL_STEPS = REPORTS_COUNT + CAMPAIGN_COUNT;

// ─── Tooltip ───────────────────────────────────────────────────

// `offset` is added to Joyride's local step index so the counter reads as
// a single tour (1..TOTAL_STEPS) even though there are two Joyride mounts.
// `lastButtonLabel` differs because the reports tour's "last step" leads
// into the campaign tour, not the end of the entire flow.
const makeTourTooltip = (
  lastButtonLabel: string,
  offset: number,
  total: number,
) => {
  const TourTooltip = ({
    index,
    step,
    backProps,
    primaryProps,
    skipProps,
    tooltipProps,
    continuous,
    isLastStep,
  }: TooltipRenderProps) => {
    const displayIndex = index + offset;
    const primaryLabel = continuous
      ? isLastStep
        ? lastButtonLabel
        : "Next"
      : "Done";

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
              {`${displayIndex + 1} / ${total}`}
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
              {primaryLabel}
            </Button>
          </HStack>
        </Flex>
      </Box>
    );
  };

  return TourTooltip;
};

const ReportsTourTooltip = makeTourTooltip("Continue", 0, TOTAL_STEPS);
const CampaignTourTooltip = makeTourTooltip(
  "Finish",
  REPORTS_COUNT,
  TOTAL_STEPS,
);

// ─── Helpers ───────────────────────────────────────────────────

const waitForTarget = (
  selector: string,
  timeoutMs = 8000,
): Promise<boolean> => {
  return new Promise((resolve) => {
    const startedAt = Date.now();

    const tick = () => {
      if (document.querySelector(selector)) {
        resolve(true);
        return;
      }
      if (Date.now() - startedAt > timeoutMs) {
        resolve(false);
        return;
      }
      setTimeout(tick, 150);
    };

    tick();
  });
};

// ─── Component ─────────────────────────────────────────────────

type Phase = "idle" | "reports" | "campaign";

export default function ClientTour() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>("idle");

  // Once the start sequence is initiated, never run it again — regardless of
  // how many times this effect re-fires (unstable user reference, strict-mode
  // double-invoke, route changes, etc.).
  const startingRef = useRef(false);

  useEffect(() => {
    if (startingRef.current) return;

    const hasStartSignal = location.state?.runClientTour === true;
    const isClient = user?.role === "CLIENT";
    const onReportsPage = location.pathname === "/reports";

    if (!hasStartSignal || !isClient || !onReportsPage) return;

    startingRef.current = true;

    // Clear nav state synchronously so refresh / re-mount won't restart it.
    navigate(location.pathname, { replace: true, state: null });

    (async () => {
      await waitForTarget(".tour-date-filter");
      setPhase("reports");
    })();
  }, [user, location, navigate]);

  // Reports tour ends naturally → hop to /campaign and start the campaign
  // tour. Skipped → end the whole flow.
  const handleReportsEvent = (data: EventData) => {
    const { status } = data;

    if (status === STATUS.SKIPPED) {
      setPhase("idle");
      return;
    }

    if (status === STATUS.FINISHED) {
      setPhase("idle");
      navigate("/campaign");
      setTimeout(async () => {
        await waitForTarget(".tour-campaign-date-picker");
        setPhase("campaign");
      }, NAV_DELAY_MS);
    }
  };

  const handleCampaignEvent = (data: EventData) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setPhase("idle");
    }
  };

  const sharedOptions: Partial<Options> = {
    zIndex: 10000,
    buttons: ["back", "primary"],
  };

  const sharedLocale = {
    back: "Back",
    last: "Finish",
    next: "Next",
    nextWithProgress: "Next {current}/{total}",
    skip: "Skip Tour",
  };

  const sharedStyles = {
    tooltip: {
      padding: 0,
      backgroundColor: "transparent",
      boxShadow: "none",
    },
    tooltipContainer: {
      padding: 0,
      textAlign: "left" as const,
    },
    overlay: {
      backgroundColor: "rgba(11, 18, 32, 0.55)",
    },
    beacon: {
      zIndex: 10000,
    },
  };

  return (
    <>
      {phase === "reports" && (
        <Joyride
          steps={reportsSteps}
          run={true}
          continuous
          scrollToFirstStep
          onEvent={handleReportsEvent}
          tooltipComponent={ReportsTourTooltip}
          options={sharedOptions}
          locale={sharedLocale}
          styles={sharedStyles}
        />
      )}

      {phase === "campaign" && (
        <Joyride
          steps={campaignSteps}
          run={true}
          continuous
          scrollToFirstStep
          onEvent={handleCampaignEvent}
          tooltipComponent={CampaignTourTooltip}
          options={sharedOptions}
          locale={sharedLocale}
          styles={sharedStyles}
        />
      )}
    </>
  );
}
