"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import axios from "../../../api/axios";
import { useAuth } from "../../../context/useAuth";
import type {
  MainTab,
  Report,
  ReportContent,
  SelectOption,
} from "./report-types";

type ReportsResponse = {
  items: Report[];
  nextCursor: string | null;
  hasMore: boolean;
};

type FilterOptionsResponse = {
  availableTypes: string[];
  availableDates: string[];
  creators: { id: string; username: string; role: string }[];
};

type SelectedReportData = {
  AUDIT?: ReportContent;
  DM?: ReportContent;
};

export function useReportsData() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  // Selection state lives in the URL so it survives navigation away/back.
  // ?clientId=...&date=YYYY-MM-DD&tab=audit|dm
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedClientId = searchParams.get("clientId") ?? "";
  const selectedDate = searchParams.get("date") ?? "";
  const mainTab = (searchParams.get("tab") as MainTab) || "audit";

  const updateParams = (updates: Record<string, string | null>) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(updates)) {
          if (value === null || value === "") next.delete(key);
          else next.set(key, value);
        }
        return next;
      },
      { replace: true },
    );
  };

  // Query 1: client list (admin only).
  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: () =>
      axios
        .get<{ id: string; username: string }[]>("/users/clients")
        .then((r) => r.data),
    enabled: isAdmin,
  });

  // Query 2: available dates for the current scope.
  const datesQuery = useQuery({
    queryKey: ["report-dates", { clientId: selectedClientId, isAdmin }],
    queryFn: () =>
      axios
        .get<FilterOptionsResponse>("/reports/filter-options", {
          params: selectedClientId ? { clientId: selectedClientId } : {},
        })
        .then((r) => r.data.availableDates),
    enabled: isAdmin ? !!selectedClientId : !!user,
    placeholderData: keepPreviousData,
  });

  // Query 3: report content for the selected date.
  const reportQuery = useQuery({
    queryKey: [
      "report",
      { clientId: selectedClientId, date: selectedDate, isAdmin },
    ],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        reportDate: selectedDate,
        limit: 100,
      };
      if (isAdmin && selectedClientId) params.clientId = selectedClientId;

      const res = await axios.get<ReportsResponse>("/reports", { params });
      const data: SelectedReportData = {};
      res.data.items.forEach((report) => {
        if (report.type === "AUDIT") data.AUDIT = report.content;
        else if (report.type === "DM") data.DM = report.content;
      });
      return data;
    },
    enabled: !!selectedDate,
  });

  // Auto-switch tab only when the active tab has no data in this period.
  useEffect(() => {
    const data = reportQuery.data;
    if (!data) return;
    if (mainTab === "audit" && !data.AUDIT && data.DM) {
      updateParams({ tab: "dm" });
    } else if (mainTab === "dm" && !data.DM && data.AUDIT) {
      updateParams({ tab: "audit" });
    }
  }, [reportQuery.data]);

  const clientOptions = useMemo<SelectOption[]>(
    () =>
      (clientsQuery.data ?? []).map((c) => ({
        label: c.username,
        value: c.id,
      })),
    [clientsQuery.data],
  );

  const dates = datesQuery.data ?? [];

  const dateOptions = useMemo<SelectOption[]>(
    () => dates.map((d) => ({ label: d, value: d })),
    [dates],
  );

  const selectedClientLabel = useMemo(() => {
    if (!isAdmin) return user?.username ?? "";
    return clientOptions.find((c) => c.value === selectedClientId)?.label ?? "";
  }, [isAdmin, user, clientOptions, selectedClientId]);

  const handleClientChange = (value: string) => {
    // Switching client invalidates the current date selection.
    updateParams({ clientId: value || null, date: null });
  };

  const handleDateChange = (value: string) => {
    updateParams({ date: value || null });
  };

  const setMainTab = (tab: MainTab) => {
    updateParams({ tab });
  };

  return {
    loading: isAdmin ? clientsQuery.isLoading : datesQuery.isLoading,
    loadingDates: datesQuery.isFetching,
    loadingReport: reportQuery.isFetching,
    selectedDate,
    selectedClientId,
    selectedClientLabel,
    selectedData: reportQuery.data,
    dates,
    clientOptions,
    dateOptions,
    mainTab,
    setMainTab,
    handleClientChange,
    handleDateChange,
  };
}
