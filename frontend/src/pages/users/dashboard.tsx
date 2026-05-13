"use client";

import {
  Badge,
  Box,
  Button,
  Card,
  CloseButton,
  Dialog,
  Flex,
  Heading,
  HStack,
  Portal,
  SimpleGrid,
  Spinner,
  Stack,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "../../api/axios";
import { toaster } from "../../components/ui/toaster";
import SearchableSelect, {
  type SearchableSelectOption,
} from "../../components/my-ui/SearchableSelect";
import CreateReportModal from "./CreateReportModal";
import DMReportModal from "./DMReportModal";
import AuditReportModal from "./AuditReportModal";

type Report = {
  id: string;
  type: string;
  reportDate: string;
  content: any;
  createdAt: string;
  client?: { id: string; username: string };
  createdBy?: { id: string; username: string };
};

type ReportsResponse = {
  items: Report[];
  nextCursor: string | null;
  hasMore: boolean;
};

type ClientOption = { id: string; username: string };
type CreatorOption = { id: string; username: string; role: string };

type FilterOptions = {
  availableTypes: string[];
  availableDates: string[];
  creators: CreatorOption[];
};

const PAGE_SIZE = 50;

const FILTER_KEYS = ["clientId", "type", "createdById", "reportDate"] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

const formatReportDate = (value: string) => {
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${month}/${day}/${year}`;
};

const Dashboard = () => {
  const queryClient = useQueryClient();

  // Filters live in URL so navbar's "remember last URL" works for this page.
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(
    () => ({
      clientId: searchParams.get("clientId") ?? "",
      type: searchParams.get("type") ?? "",
      createdById: searchParams.get("createdById") ?? "",
      reportDate: searchParams.get("reportDate") ?? "",
    }),
    [searchParams],
  );

  const updateFilter = (key: FilterKey, value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (!value) next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true },
    );
  };

  const clearFilters = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        FILTER_KEYS.forEach((k) => next.delete(k));
        return next;
      },
      { replace: true },
    );
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [editReport, setEditReport] = useState<Report | null>(null);
  const [deleteReport, setDeleteReport] = useState<Report | null>(null);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Build the query params we send to /reports (filters minus cursor/limit,
  // which useInfiniteQuery manages itself via pageParam).
  const filterParams = useMemo(() => {
    const params: Record<string, string> = {};
    for (const key of FILTER_KEYS) {
      const value = filters[key];
      if (value) params[key] = value;
    }
    return params;
  }, [filters]);

  // Paginated reports list.
  // queryKey includes the filter object, so changing any filter
  // invalidates the existing pages and starts fresh from cursor=undefined.
  const reportsQuery = useInfiniteQuery({
    queryKey: ["reports", "list", filterParams],
    queryFn: ({ pageParam }) =>
      axios
        .get<ReportsResponse>("/reports", {
          params: {
            ...filterParams,
            limit: PAGE_SIZE,
            ...(pageParam ? { cursor: pageParam } : {}),
          },
        })
        .then((r) => r.data),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
  });

  const reports = useMemo(
    () => reportsQuery.data?.pages.flatMap((p) => p.items) ?? [],
    [reportsQuery.data],
  );

  // Clients list (for filter dropdown)
  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: () =>
      axios.get<ClientOption[]>("/users/clients").then((r) => r.data),
  });
  const clients = clientsQuery.data ?? [];

  // Filter options (types, dates, creators)
  const filterOptionsQuery = useQuery({
    queryKey: ["reports", "filter-options"],
    queryFn: () =>
      axios.get<FilterOptions>("/reports/filter-options").then((r) => r.data),
  });
  const filterOptions: FilterOptions = filterOptionsQuery.data ?? {
    availableTypes: [],
    availableDates: [],
    creators: [],
  };

  // If a date filter is set to a value that's no longer in the available
  // dates (e.g. last report on that date was just deleted), drop it.
  useEffect(() => {
    if (
      filters.reportDate &&
      filterOptionsQuery.data &&
      !filterOptionsQuery.data.availableDates.includes(filters.reportDate)
    ) {
      updateFilter("reportDate", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterOptionsQuery.data, filters.reportDate]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (reportId: string) => axios.delete(`/reports/${reportId}`),
    onSuccess: () => {
      // Refetch the list and filter options (a deleted report's date may
      // no longer appear in availableDates).
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toaster.create({ title: "Report deleted", type: "success" });
    },
    onError: () => {
      toaster.create({ title: "Failed to delete report", type: "error" });
    },
  });

  const handleConfirmDelete = () => {
    if (!deleteReport) return;
    deleteMutation.mutate(deleteReport.id, {
      onSettled: () => setDeleteReport(null),
    });
  };

  // Infinite scroll sentinel
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !reportsQuery.hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !reportsQuery.isFetchingNextPage) {
          reportsQuery.fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: "200px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [
    reportsQuery.hasNextPage,
    reportsQuery.isFetchingNextPage,
    reportsQuery.fetchNextPage,
    reports.length,
  ]);

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");
  const showTypeFilter = filterOptions.availableTypes.length > 1;

  // Dropdown option lists (memoized to avoid resetting SearchableSelect's
  // internal collection on every render).
  const clientSelectOptions = useMemo<SearchableSelectOption[]>(
    () => clients.map((c) => ({ label: c.username, value: c.id })),
    [clients],
  );

  const typeSelectOptions = useMemo<SearchableSelectOption[]>(
    () => filterOptions.availableTypes.map((t) => ({ label: t, value: t })),
    [filterOptions.availableTypes],
  );

  const creatorSelectOptions = useMemo<SearchableSelectOption[]>(
    () =>
      filterOptions.creators.map((u) => ({
        label: `${u.username} (${u.role})`,
        value: u.id,
      })),
    [filterOptions.creators],
  );

  const dateSelectOptions = useMemo<SearchableSelectOption[]>(
    () =>
      filterOptions.availableDates.map((d) => ({
        label: formatReportDate(d),
        value: d,
      })),
    [filterOptions.availableDates],
  );

  const renderEditModal = () => {
    if (!editReport) return null;

    const commonProps = {
      open: !!editReport,
      onOpenChange: (open: boolean) => !open && setEditReport(null),
      baseData: {
        id: editReport.id,
        type: editReport.type,
        clientId: editReport.client?.id || "",
        reportDate: editReport.reportDate,
        content: editReport.content,
      },
      onReportCreated: () => {
        // The report was updated server-side; invalidate everything so the
        // list and filter options refetch.
        queryClient.invalidateQueries({ queryKey: ["reports"] });
        setEditReport(null);
      },
    };

    switch (editReport.type) {
      case "DM":
        return <DMReportModal {...commonProps} />;
      case "AUDIT":
        return <AuditReportModal {...commonProps} />;
      default:
        return null;
    }
  };

  const isInitialLoading = reportsQuery.isLoading;

  return (
    <Box minH="100dvh" bg="bg">
      <VStack align="stretch" gap={6}>
        {/* Header card */}
        <Card.Root
          variant="outline"
          bg="bg.panel"
          borderColor="border"
          rounded="2xl"
          shadow="sm"
          overflow="hidden"
        >
          <Box h="1.5" bg="brand.solid" />
          <Card.Body p={{ base: 5, md: 6 }}>
            <Flex
              direction={{ base: "column", lg: "row" }}
              justify="space-between"
              align={{ base: "start", lg: "center" }}
              gap={5}
            >
              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color="fg.subtle"
                  mb={2}
                >
                  Reports management
                </Text>

                <Heading size="xl" letterSpacing="-0.02em">
                  Dashboard
                </Heading>

                <Text mt={3} color="fg.muted" maxW="3xl" lineHeight="tall">
                  Create, review, edit, and remove reports workspace.
                </Text>
              </Box>

              <HStack gap={3} wrap="wrap">
                <Badge
                  variant="subtle"
                  colorPalette="brand"
                  rounded="full"
                  px="3"
                  py="1.5"
                >
                  {reports.length} loaded
                  {reportsQuery.hasNextPage ? "+" : ""}
                </Badge>

                <Button
                  colorPalette="brand"
                  size="lg"
                  rounded="xl"
                  onClick={() => setModalOpen(true)}
                >
                  Create New Report
                </Button>
              </HStack>
            </Flex>
          </Card.Body>
        </Card.Root>

        {/* Filters card */}
        <Card.Root
          variant="outline"
          bg="bg.panel"
          borderColor="border"
          rounded="2xl"
          shadow="xs"
        >
          <Card.Body p={{ base: 4, md: 5 }}>
            <Flex
              justify="space-between"
              align="center"
              mb={4}
              wrap="wrap"
              gap={2}
            >
              <Heading size="sm" color="fg.muted">
                Filters
              </Heading>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  rounded="lg"
                  onClick={clearFilters}
                >
                  Clear all
                </Button>
              )}
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
              <Stack gap={1.5}>
                <Text fontSize="xs" fontWeight="medium" color="fg.muted">
                  Client
                </Text>
                <SearchableSelect
                  options={clientSelectOptions}
                  value={filters.clientId}
                  onChange={(v) => updateFilter("clientId", v)}
                  placeholder="All clients"
                  emptyText="No clients found"
                />
              </Stack>

              {showTypeFilter && (
                <Stack gap={1.5}>
                  <Text fontSize="xs" fontWeight="medium" color="fg.muted">
                    Type
                  </Text>
                  <SearchableSelect
                    options={typeSelectOptions}
                    value={filters.type}
                    onChange={(v) => updateFilter("type", v)}
                    placeholder="All types"
                    emptyText="No types"
                  />
                </Stack>
              )}

              <Stack gap={1.5}>
                <Text fontSize="xs" fontWeight="medium" color="fg.muted">
                  Created by
                </Text>
                <SearchableSelect
                  options={creatorSelectOptions}
                  value={filters.createdById}
                  onChange={(v) => updateFilter("createdById", v)}
                  placeholder="Anyone"
                  emptyText="No users found"
                />
              </Stack>

              <Stack gap={1.5}>
                <Text fontSize="xs" fontWeight="medium" color="fg.muted">
                  Report date
                </Text>
                <SearchableSelect
                  options={dateSelectOptions}
                  value={filters.reportDate}
                  onChange={(v) => updateFilter("reportDate", v)}
                  placeholder="All dates"
                  emptyText="No dates"
                />
              </Stack>
            </SimpleGrid>
          </Card.Body>
        </Card.Root>

        <CreateReportModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onReportCreated={() =>
            queryClient.invalidateQueries({ queryKey: ["reports"] })
          }
        />

        {renderEditModal()}

        {/* Shared delete dialog */}
        <Dialog.Root
          role="alertdialog"
          open={!!deleteReport}
          onOpenChange={({ open }) => {
            if (!open) setDeleteReport(null);
          }}
        >
          <Portal>
            <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(6px)" />
            <Dialog.Positioner px={4}>
              <Dialog.Content
                maxW="md"
                rounded="2xl"
                borderWidth="1px"
                borderColor="border"
                bg="bg.panel"
                shadow="2xl"
              >
                <Box h="1.5" bg="status.danger" borderTopRadius="inherit" />

                <Dialog.Header
                  display="flex"
                  justifyContent="space-between"
                  alignItems="start"
                  px={6}
                  pt={6}
                  pb={3}
                >
                  <Box>
                    <Dialog.Title>Delete report</Dialog.Title>
                    <Text mt={2} fontSize="sm" color="fg.muted">
                      This action cannot be undone.
                    </Text>
                  </Box>

                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" />
                  </Dialog.CloseTrigger>
                </Dialog.Header>

                <Dialog.Body px={6} pb={4}>
                  <Text color="fg.muted" lineHeight="tall">
                    This will permanently delete the report and remove its data
                    from your system.
                  </Text>
                </Dialog.Body>

                <Dialog.Footer px={6} pb={6} pt={0}>
                  <Dialog.ActionTrigger asChild>
                    <Button variant="outline" rounded="xl">
                      Cancel
                    </Button>
                  </Dialog.ActionTrigger>

                  <Button
                    colorPalette="red"
                    rounded="xl"
                    onClick={handleConfirmDelete}
                    loading={deleteMutation.isPending}
                  >
                    Delete
                  </Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>

        {/* Reports table */}
        <Card.Root
          variant="outline"
          bg="bg.panel"
          borderColor="border"
          rounded="2xl"
          shadow="xs"
        >
          <Card.Body p={0}>
            {isInitialLoading ? (
              <Flex minH="40vh" align="center" justify="center">
                <VStack gap={3}>
                  <Spinner size="lg" color="brand.solid" />
                  <Text color="fg.muted">Loading reports...</Text>
                </VStack>
              </Flex>
            ) : !reports.length ? (
              <Box px={{ base: 5, md: 6 }} py={{ base: 10, md: 12 }}>
                <VStack gap={2} textAlign="center">
                  <Heading size="md">
                    {hasActiveFilters
                      ? "No reports match your filters"
                      : "No reports yet"}
                  </Heading>
                  <Text color="fg.muted">
                    {hasActiveFilters
                      ? "Try adjusting or clearing the filters above."
                      : "Create your first report to start populating this dashboard."}
                  </Text>
                </VStack>
              </Box>
            ) : (
              <>
                <Box overflowX="auto" padding="10px">
                  <Table.Root variant="line" size="sm">
                    <Table.Header>
                      <Table.Row bg="bg.muted">
                        <Table.ColumnHeader color="fg.subtle">
                          Type
                        </Table.ColumnHeader>
                        <Table.ColumnHeader color="fg.subtle">
                          Client
                        </Table.ColumnHeader>
                        <Table.ColumnHeader color="fg.subtle">
                          Created By
                        </Table.ColumnHeader>
                        <Table.ColumnHeader color="fg.subtle">
                          Report Date
                        </Table.ColumnHeader>
                        <Table.ColumnHeader color="fg.subtle">
                          Created At
                        </Table.ColumnHeader>
                        <Table.ColumnHeader color="fg.subtle">
                          Actions
                        </Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>

                    <Table.Body>
                      {reports.map((report, index) => (
                        <Table.Row
                          key={report.id}
                          bg={index % 2 === 1 ? "bg.subtle" : "transparent"}
                          _hover={{ bg: "bg.hover" }}
                          transition="background 0.16s ease"
                        >
                          <Table.Cell>
                            <Badge
                              variant="subtle"
                              colorPalette={
                                report.type === "AUDIT" ? "brand" : "green"
                              }
                              rounded="full"
                            >
                              {report.type}
                            </Badge>
                          </Table.Cell>

                          <Table.Cell>
                            {report.client?.username || "-"}
                          </Table.Cell>

                          <Table.Cell>
                            {report.createdBy?.username || "-"}
                          </Table.Cell>

                          <Table.Cell whiteSpace="nowrap">
                            {formatReportDate(report.reportDate)}
                          </Table.Cell>

                          <Table.Cell whiteSpace="nowrap">
                            {new Date(report.createdAt).toLocaleString()}
                          </Table.Cell>

                          <Table.Cell>
                            <HStack gap={2}>
                              <Button
                                colorPalette="brand"
                                variant="outline"
                                size="sm"
                                rounded="lg"
                                onClick={() => setEditReport(report)}
                              >
                                Edit
                              </Button>

                              <Button
                                colorPalette="red"
                                variant="outline"
                                size="sm"
                                rounded="lg"
                                onClick={() => setDeleteReport(report)}
                              >
                                Delete
                              </Button>
                            </HStack>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Box>

                {/* Sentinel for infinite scroll */}
                <Box
                  ref={loadMoreRef}
                  py={6}
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  {reportsQuery.isFetchingNextPage ? (
                    <HStack gap={2}>
                      <Spinner size="sm" color="brand.solid" />
                      <Text color="fg.muted" fontSize="sm">
                        Loading more...
                      </Text>
                    </HStack>
                  ) : !reportsQuery.hasNextPage ? (
                    <Text color="fg.subtle" fontSize="sm">
                      End of results
                    </Text>
                  ) : null}
                </Box>
              </>
            )}
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  );
};

export default Dashboard;
