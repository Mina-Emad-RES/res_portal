"use client";

import { useMemo, useState } from "react";
import { Box, Heading, Text, Checkbox, SimpleGrid } from "@chakra-ui/react";
import { Chart, useChart } from "@chakra-ui/charts";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  Legend,
} from "recharts";

type CallLogEntry = {
  date: string;
  total: number;
  deadCall: number;
  doNotCall: number;
  notAvailable: number;
  notInterested: number;
  voicemail: number;
  wrongNumber: number;
  lead: number;
  decisionMakerLead: number;
  decisionMakerNYI: number;
  dncDecisionMaker: number;
  agent: number;
  wrongNumberAlt: number;
  unknown: number;
  dncUnknown: number;
  influencer: number;
};

type Props = {
  logs: CallLogEntry[];
};

const order = [
  "total",
  "voicemail",
  "decisionMakerNYI",
  "unknown",
  "deadCall",
  "wrongNumber",
  "wrongNumberAlt",
  "lead",
  "decisionMakerLead",
  "agent",
  "dncDecisionMaker",
  "dncUnknown",
  "influencer",
  "doNotCall",
  "notAvailable",
  "notInterested",
];

const labelMap: Record<string, string> = {
  total: "Total",
  voicemail: "Voicemail",
  decisionMakerNYI: "Decision Maker NYI",
  unknown: "Unknown",
  deadCall: "Dead Call",
  wrongNumber: "Wrong Number",
  wrongNumberAlt: "Wrong Number Alt",
  lead: "Lead",
  decisionMakerLead: "Decision Maker Lead",
  agent: "Agent",
  dncDecisionMaker: "DNC Decision Maker",
  dncUnknown: "DNC Unknown",
  influencer: "Influencer",
  doNotCall: "Do Not Call",
  notAvailable: "Not Available",
  notInterested: "Not Interested",
};

const DEFAULT_VISIBLE = [
  "total",
  "voicemail",
  "decisionMakerLead",
  "wrongNumber",
  "decisionMakerNYI",
  "unknown",
  "deadCall",
  "agent",
  "dncDecisionMaker",
  "dncUnknown",
  "influencer",
];

export default function CampaignGraph({ logs }: Props) {
  const [visibleLabels, setVisibleLabels] = useState<string[]>(DEFAULT_VISIBLE);

  const chart = useChart({
    data: logs,
    series: [
      { name: "voicemail", color: "blue.solid" },
      { name: "decisionMakerNYI", color: "green.solid" },
      { name: "unknown", color: "purple.solid" },
      { name: "deadCall", color: "red.solid" },
      { name: "wrongNumber", color: "orange.solid" },
      { name: "decisionMakerLead", color: "teal.emphasized" },
      { name: "agent", color: "cyan.solid" },
      { name: "dncDecisionMaker", color: "pink.solid" },
      { name: "dncUnknown", color: "pink.subtle" },
      { name: "influencer", color: "yellow.solid" },
      { name: "doNotCall", color: "gray.solid" },
      { name: "notAvailable", color: "gray.subtle" },
      { name: "notInterested", color: "slate.solid" },
      { name: "total", color: "border.emphasized" },
    ],
  });

  const series = useMemo(() => {
    return order
      .map((name) => {
        const s = chart.series.find((x) => x.name === name);
        if (!s) return null;
        return {
          ...s,
          label: labelMap[name] ?? name,
          resolvedColor: chart.color(s.color),
        };
      })
      .filter(Boolean) as Array<{
      name: string;
      label: string;
      color: string;
      resolvedColor: string;
    }>;
  }, [chart]);

  const visibleSeries = series.filter((s) => visibleLabels.includes(s.name));

  const toggleLabel = (name: string) => {
    setVisibleLabels((curr) =>
      curr.includes(name) ? curr.filter((i) => i !== name) : [...curr, name],
    );
  };

  if (logs.length === 0) {
    return (
      <Box>
        <Heading size="md" mb={1}>
          Disposition Trends
        </Heading>
        <Text fontSize="sm" color="fg.muted">
          No data available for the selected date range.
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={4}>
        <Heading size="md" mb={1}>
          Disposition Trends
        </Heading>
        <Text fontSize="sm" color="fg.muted">
          Overview of call outcomes across selected dates
        </Text>
      </Box>

      <Box mb={4}>
        <Text fontSize="sm" fontWeight="medium" mb={2}>
          Show labels
        </Text>
        <SimpleGrid columns={{ base: 2, md: 4 }} gap={2}>
          {series.map((item) => (
            <Checkbox.Root
              key={item.name}
              checked={visibleLabels.includes(item.name)}
              onCheckedChange={() => toggleLabel(item.name)}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control colorPalette="brand" />
              <Checkbox.Label>{item.label}</Checkbox.Label>
            </Checkbox.Root>
          ))}
        </SimpleGrid>
      </Box>

      <Box h="460px">
        <Chart.Root h="full" chart={chart}>
          <AreaChart data={chart.data} responsive>
            <CartesianGrid
              stroke={chart.color("border.emphasized")}
              strokeOpacity={0.5}
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              axisLine={false}
              tickLine={false}
              dataKey={chart.key("date")}
              tickFormatter={(value) => {
                const d = new Date(value);
                return `${d.getMonth() + 1}/${d.getDate()}`;
              }}
            />
            <Tooltip
              cursor={false}
              animationDuration={100}
              content={<Chart.Tooltip />}
            />
            <Legend
              content={
                <Chart.Legend
                  payload={visibleSeries.map((s) => ({
                    value: s.label,
                    color: s.resolvedColor,
                  }))}
                />
              }
            />
            {visibleSeries.map((item) => (
              <Area
                key={item.name}
                dataKey={chart.key(item.name)}
                name={item.label}
                stroke={item.resolvedColor}
                fill={item.resolvedColor}
                fillOpacity={0.2}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </Chart.Root>
      </Box>
    </Box>
  );
}
