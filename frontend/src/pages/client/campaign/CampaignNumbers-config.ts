export type MetricKey =
  | "calls"
  | "answered"
  | "connects"
  | "machines"
  | "abandoned"
  | "answerPct"
  | "machinePct"
  | "abandPct"
  | "ctc"
  | "avgCtl"
  | "avgCtql"
  | "nis"
  | "avgCpa";

export const METRIC_DESCRIPTIONS: Record<MetricKey, string> = {
  calls: "Total number of outbound calls placed during the campaign.",
  answered: "Calls where someone (human or machine) picked up.",
  connects: "Calls that successfully connected to a live human.",
  machines: "Calls answered by voicemail or answering machines.",
  abandoned:
    "Calls that were disconnected before a connection was established.",
  answerPct:
    "Percentage of total calls that were answered (by a human or machine).",
  machinePct:
    "Percentage of answered calls that were picked up by a voicemail or answering machine.",
  abandPct:
    "Abandonment rate — the percentage of calls that dropped before connecting.",
  ctc: "Calls To Connect: average number of calls needed to get 1 live human connect.\n\nTarget: below 7–8.",
  avgCtl:
    "Average Connects To Lead: average number of live connects required to generate one lead.\n\nTarget: below 250.",
  avgCtql:
    "Average Connects To Qualified Lead: average live connects needed to reach one qualified lead.\n\nTarget: below 300.",
  nis: "Not In Service — total calls that reached a disconnected or invalid number.",
  avgCpa:
    "Calls Per Agent: refers to the minimum number of lines being used in the background per agent.\n\nTarget: below 5.",
};
