"use client";

import { Box, SimpleGrid, Text, HStack, VStack, Icon } from "@chakra-ui/react";
import {
  Phone,
  CheckCircle,
  Link as LinkIcon,
  Settings,
  Percent,
  Cpu,
  PhoneForwarded,
  BarChart,
  Activity,
  AlertCircle,
  DollarSign,
  TrendingDown,
  XCircle,
} from "lucide-react";
import InfoPopover from "../../../components/my-ui/InfoPopover";
import { METRIC_DESCRIPTIONS } from "./CampaignNumbers-config";

type DialerSummary = {
  calls: number;
  answered: number;
  connects: number;
  machines: number;
  abandoned: number;
  avgAnswerPercentage: number;
  avgMachinePercentage: number;
  avgCallsToConnects: number;
  avgConnectsToLeads: number;
  avgConnectsToQualifiedLeads: number;
  totalNIS: number;
  avgCPA: number;
  avgAbandonedPercentage: number;
};

type Props = {
  summary: DialerSummary | null;
};

function fmt(n: number | undefined, decimals = 0): string {
  if (n == null) return "—";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtPct(n: number | undefined): string {
  if (n == null) return "—";
  return `${n.toFixed(2)}%`;
}

export default function CampaignNumbers({ summary }: Props) {
  const metrics = [
    {
      label: "Calls",
      value: fmt(summary?.calls),
      icon: Phone,
      description: METRIC_DESCRIPTIONS.calls,
    },
    {
      label: "Answered",
      value: fmt(summary?.answered),
      icon: CheckCircle,
      description: METRIC_DESCRIPTIONS.answered,
    },
    {
      label: "Connects",
      value: fmt(summary?.connects),
      icon: LinkIcon,
      description: METRIC_DESCRIPTIONS.connects,
    },
    {
      label: "Machines",
      value: fmt(summary?.machines),
      icon: Settings,
      description: METRIC_DESCRIPTIONS.machines,
    },
    {
      label: "Abandoned",
      value: fmt(summary?.abandoned),
      icon: XCircle,
      description: METRIC_DESCRIPTIONS.abandoned,
    },
    {
      label: "Answer%",
      value: fmtPct(summary?.avgAnswerPercentage),
      icon: Percent,
      description: METRIC_DESCRIPTIONS.answerPct,
    },
    {
      label: "Machine%",
      value: fmtPct(summary?.avgMachinePercentage),
      icon: Cpu,
      description: METRIC_DESCRIPTIONS.machinePct,
    },
    {
      label: "Aband. %",
      value: fmtPct(summary?.avgAbandonedPercentage),
      icon: TrendingDown,
      description: METRIC_DESCRIPTIONS.abandPct,
    },
    {
      label: "CTC",
      value: fmt(summary?.avgCallsToConnects, 2),
      icon: PhoneForwarded,
      description: METRIC_DESCRIPTIONS.ctc,
    },
    {
      label: "Avg CTL",
      value: fmt(summary?.avgConnectsToLeads, 2),
      icon: BarChart,
      description: METRIC_DESCRIPTIONS.avgCtl,
    },
    {
      label: "Avg CTQL",
      value: fmt(summary?.avgConnectsToQualifiedLeads, 2),
      icon: Activity,
      description: METRIC_DESCRIPTIONS.avgCtql,
    },
    {
      label: "NIS",
      value: fmt(summary?.totalNIS),
      icon: AlertCircle,
      description: METRIC_DESCRIPTIONS.nis,
    },
    {
      label: "Avg CPA",
      value: fmt(summary?.avgCPA, 2),
      icon: DollarSign,
      description: METRIC_DESCRIPTIONS.avgCpa,
    },
  ];

  return (
    <SimpleGrid gapX={25} gapY={4} minChildWidth={150}>
      {metrics.map((metric) => (
        <Box
          key={metric.label}
          p={4}
          rounded="xl"
          bg="bg.panel"
          borderWidth="1px"
          borderColor="border"
          _hover={{ shadow: "sm" }}
          transition="all 0.2s ease"
        >
          <VStack align="start" gap={2}>
            <HStack gap={2} w="full" justify="space-between">
              <HStack gap={2}>
                <Icon as={metric.icon} boxSize={4.5} color="brand.fg" />
                <Text fontSize="sm" color="fg.muted" fontWeight="medium">
                  {metric.label}
                </Text>
              </HStack>
              <InfoPopover content={metric.description} />
            </HStack>
            <Text
              fontSize="xl"
              fontWeight="semibold"
              letterSpacing="-0.02em"
              color="fg"
            >
              {metric.value}
            </Text>
          </VStack>
        </Box>
      ))}
    </SimpleGrid>
  );
}
