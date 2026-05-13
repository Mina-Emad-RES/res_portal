"use client";

import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "../../../api/axios";
import { useAuth } from "../../../context/useAuth";

export type DialerSummary = {
  calls: number;
  noAnswer: number;
  answered: number;
  machines: number;
  abandoned: number;
  connects: number;
  avgAnswerPercentage: number;
  avgMachinePercentage: number;
  avgAbandonedPercentage: number;
  avgCallsToConnects: number;
  avgConnectsToLeads: number;
  avgConnectsToQualifiedLeads: number;
  avgCPA: number;
  totalNIS: number;
};

export type CallLogEntry = {
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

export type SelectOption = {
  label: string;
  value: string;
};

// Public AsyncState type, kept for compatibility with Campaign.tsx which
// already pattern-matches on `status`. We derive it from the query state.
export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: T };

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDate(s: string | null): Date | null {
  if (!s) return null;
  // Treat URL date strings as local-midnight to avoid timezone drift.
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function useCampaignData() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  // Selections live in URL: ?campaign=X&start=YYYY-MM-DD&end=YYYY-MM-DD
  const [searchParams, setSearchParams] = useSearchParams();

  const urlCampaign = searchParams.get("campaign") ?? "";
  const startStr = searchParams.get("start");
  const endStr = searchParams.get("end");

  const updateParams = (updates: Record<string, string | null>) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [k, v] of Object.entries(updates)) {
          if (v === null || v === "") next.delete(k);
          else next.set(k, v);
        }
        return next;
      },
      { replace: true },
    );
  };

  // Query 1: client list (admin only)
  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: () =>
      axios
        .get<{ id: string; username: string }[]>("/users/clients")
        .then((r) => r.data),
    enabled: isAdmin,
  });

  const clientOptions = useMemo<SelectOption[]>(
    () =>
      (clientsQuery.data ?? []).map((c) => ({
        label: c.username,
        value: c.username,
      })),
    [clientsQuery.data],
  );

  // Effective campaign: admin gets URL value (or auto-select first option),
  // non-admin always uses their own username regardless of URL.
  const effectiveCampaign = isAdmin ? urlCampaign : (user?.username ?? "");

  const start = parseDate(startStr);
  const end = parseDate(endStr);
  const dateRange: [Date | null, Date | null] = [start, end];

  const haveRange = !!effectiveCampaign && !!start && !!end;
  const startParam = start ? formatDate(start) : "";
  const endParam = end ? formatDate(end) : "";

  // Query 2: summary
  const summaryQuery = useQuery({
    queryKey: [
      "campaign-summary",
      { campaign: effectiveCampaign, start: startParam, end: endParam },
    ],
    queryFn: () =>
      axios
        .get("/external/campaign/summary", {
          params: {
            campaign: effectiveCampaign,
            startDate: startParam,
            endDate: endParam,
          },
        })
        .then((r) => (r.data.dialerSummary ?? null) as DialerSummary | null),
    enabled: haveRange,
  });

  // Query 3: logs
  const logsQuery = useQuery({
    queryKey: [
      "campaign-logs",
      { campaign: effectiveCampaign, start: startParam, end: endParam },
    ],
    queryFn: () =>
      axios
        .get("/external/campaign/logs", {
          params: {
            campaign: effectiveCampaign,
            startDate: startParam,
            endDate: endParam,
          },
        })
        .then((r) => (r.data.callLogs ?? []) as CallLogEntry[]),
    enabled: haveRange,
  });

  // Translate query state into the AsyncState shape Campaign.tsx expects.
  const summaryState: AsyncState<DialerSummary | null> = !haveRange
    ? { status: "idle" }
    : summaryQuery.isLoading
      ? { status: "loading" }
      : summaryQuery.isError
        ? {
            status: "error",
            error:
              (summaryQuery.error as any)?.response?.data?.message ??
              "Failed to load summary.",
          }
        : { status: "success", data: summaryQuery.data ?? null };

  const logsState: AsyncState<CallLogEntry[]> = !haveRange
    ? { status: "idle" }
    : logsQuery.isLoading
      ? { status: "loading" }
      : logsQuery.isError
        ? {
            status: "error",
            error:
              (logsQuery.error as any)?.response?.data?.message ??
              "Failed to load call logs.",
          }
        : { status: "success", data: logsQuery.data ?? [] };

  const handleCampaignChange = (value: string) => {
    // Switching campaign drops the current range.
    updateParams({ campaign: value || null, start: null, end: null });
  };

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [s, e] = dates;
    if (s && e) {
      updateParams({ start: formatDate(s), end: formatDate(e) });
    } else {
      updateParams({ start: null, end: null });
    }
  };

  const selectedCampaignLabel =
    clientOptions.find((o) => o.value === effectiveCampaign)?.label ??
    effectiveCampaign;

  return {
    isAdmin,
    clientOptions,
    clientsLoading: isAdmin ? clientsQuery.isLoading : false,
    selectedCampaign: effectiveCampaign,
    selectedCampaignLabel,
    dateRange,
    summaryState,
    logsState,
    handleCampaignChange,
    handleDateChange,
    retrySummary: () => summaryQuery.refetch(),
    retryLogs: () => logsQuery.refetch(),
  };
}
