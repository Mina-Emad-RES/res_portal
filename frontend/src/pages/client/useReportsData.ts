"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "../../api/axios";
import type {
  GroupedReports,
  MainTab,
  Report,
  SelectOption,
} from "./report-types";

export function useReportsData() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [mainTab, setMainTab] = useState<MainTab>("audit");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get("/reports");
        setReports(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const clientOptions = useMemo<SelectOption[]>(() => {
    const map = new Map<string, string>();

    reports.forEach((report) => {
      if (report.client) {
        map.set(report.client.id, report.client.username);
      }
    });

    return Array.from(map.entries()).map(([id, username]) => ({
      label: username,
      value: id,
    }));
  }, [reports]);

  useEffect(() => {
    if (clientOptions.length && !selectedClientId) {
      setSelectedClientId(clientOptions[0].value);
    }
  }, [clientOptions, selectedClientId]);

  const selectedClientLabel = useMemo(() => {
    return (
      clientOptions.find((client) => client.value === selectedClientId)
        ?.label ?? ""
    );
  }, [clientOptions, selectedClientId]);

  const filteredReports = useMemo(() => {
    if (!selectedClientId) return [];
    return reports.filter((report) => report.client?.id === selectedClientId);
  }, [reports, selectedClientId]);

  const grouped = useMemo<GroupedReports>(() => {
    const map: GroupedReports = {};

    filteredReports.forEach((report) => {
      if (!map[report.reportDate]) {
        map[report.reportDate] = {};
      }

      map[report.reportDate][report.type] = report.content;
    });

    return map;
  }, [filteredReports]);

  const dates = useMemo(() => {
    return Object.keys(grouped).sort((a, b) => b.localeCompare(a));
  }, [grouped]);

  const dateOptions = useMemo<SelectOption[]>(() => {
    return dates.map((date) => ({
      label: date,
      value: date,
    }));
  }, [dates]);

  useEffect(() => {
    if (!dates.length) {
      if (selectedDate) {
        setSelectedDate("");
      }
      return;
    }

    if (!selectedDate || !dates.includes(selectedDate)) {
      setSelectedDate(dates[0]);
    }
  }, [dates, selectedDate]);

  const selectedData = grouped[selectedDate];

  useEffect(() => {
    if (selectedData?.AUDIT) {
      setMainTab("audit");
    } else if (selectedData?.DM) {
      setMainTab("dm");
    }
  }, [selectedData]);

  const handleClientChange = (value: string) => {
    setSelectedClientId(value);
    setSelectedDate("");
  };

  const handleDateChange = (value: string) => {
    setSelectedDate(value);
  };

  return {
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
  };
}
