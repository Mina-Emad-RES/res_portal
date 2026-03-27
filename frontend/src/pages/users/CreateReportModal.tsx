"use client";

import {
  Badge,
  Box,
  Button,
  CloseButton,
  Combobox,
  Dialog,
  Field,
  Input,
  Portal,
  Select,
  Text,
  VStack,
  createListCollection,
  useFilter,
  useListCollection,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import axios from "../../api/axios";
import { toaster } from "../../components/ui/toaster";
import AuditReportModal from "./AuditReportModal";
import DMReportModal from "./DMReportModal";
import { useAuth } from "../../context/useAuth";

type ReportType = "AUDIT" | "DM";

type Client = {
  id: string;
  username: string;
};

type ClientOption = {
  label: string;
  value: string;
};

type Report = {
  id: string;
  type: string;
  reportDate: string;
  content: any;
  createdAt: string;
  client?: {
    id: string;
    username: string;
  };
  createdBy?: {
    id: string;
    username: string;
  };
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReportCreated: (report: Report) => void;
}

const reportModalMap: Partial<Record<ReportType, React.ComponentType<any>>> = {
  AUDIT: AuditReportModal,
  DM: DMReportModal,
};

const triggerStyles = {
  rounded: "xl",
  bg: "bg.subtle",
  borderWidth: "1px",
  borderColor: "border",
  transition: "background 0.2s ease, border-color 0.2s ease",
  _hover: {
    bg: "bg.hover",
    borderColor: "border.emphasized",
  },
  _focusVisible: {
    borderColor: "brand.solid",
  },
} as const;

const contentStyles = {
  rounded: "xl",
  bg: "bg.panel",
  borderColor: "border.emphasized",
  shadow: "lg",
} as const;

const DAY_MS = 24 * 60 * 60 * 1000;

const parseDateString = (value: string) => {
  const raw = value.slice(0, 10);
  const [year, month, day] = raw.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
};

const normalizeDateString = (value: string) => value.slice(0, 10);

const isFriday = (value: string) => {
  return parseDateString(value).getDay() === 5;
};

const getDifferenceInDays = (selectedDate: string, previousDate: string) => {
  const selected = parseDateString(selectedDate);
  const previous = parseDateString(previousDate);
  return Math.round((selected.getTime() - previous.getTime()) / DAY_MS);
};

const formatDisplayDate = (value: string) => {
  return parseDateString(value).toLocaleDateString();
};

const getDifferenceLabel = (diffDays: number) => {
  if (diffDays === 0) return "on the same day as";

  const absoluteDays = Math.abs(diffDays);
  const dayLabel = `${absoluteDays} day${absoluteDays === 1 ? "" : "s"}`;

  if (diffDays > 0) {
    return `${dayLabel} before`;
  }

  return `${dayLabel} after`;
};

type ClientSearchFieldProps = {
  clientOptions: ClientOption[];
  value: string;
  onChange: (value: string) => void;
};

const ClientSearchField = ({
  clientOptions,
  value,
  onChange,
}: ClientSearchFieldProps) => {
  const { contains } = useFilter({ sensitivity: "base" });

  const { collection, filter, reset } = useListCollection({
    initialItems: clientOptions,
    filter: contains,
  });

  useEffect(() => {
    reset();
  }, [value, reset]);

  return (
    <Field.Root>
      <Field.Label fontWeight="medium" color="fg.subtle" mb={2}>
        Client
      </Field.Label>

      <Combobox.Root
        collection={collection}
        value={value ? [value] : []}
        openOnClick
        positioning={{ strategy: "fixed", hideWhenDetached: true }}
        onInputValueChange={(details) => {
          filter(details.inputValue);
        }}
        onValueChange={(details) => {
          reset();
          onChange(details.value[0] ?? "");
        }}
      >
        <Combobox.Control>
          <Combobox.Input
            placeholder="Search client..."
            autoComplete="off"
            rounded="xl"
            bg="bg.subtle"
            borderWidth="1px"
            borderColor="border"
            transition="background 0.2s ease, border-color 0.2s ease"
            _hover={{
              bg: "bg.hover",
              borderColor: "border.emphasized",
            }}
            _focusVisible={{
              borderColor: "brand.solid",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-solid)",
            }}
          />

          <Combobox.IndicatorGroup color="fg.muted" pe="2">
            <Combobox.ClearTrigger />
            <Combobox.Trigger />
          </Combobox.IndicatorGroup>
        </Combobox.Control>

        <Combobox.Positioner>
          <Combobox.Content
            rounded="xl"
            bg="bg.panel"
            borderColor="border.emphasized"
            shadow="lg"
            maxH="280px"
            overflowY="auto"
          >
            <Combobox.Empty px={3} py={2} color="fg.muted">
              No clients found
            </Combobox.Empty>

            {collection.items.map((item) => (
              <Combobox.Item key={item.value} item={item}>
                {item.label}
              </Combobox.Item>
            ))}
          </Combobox.Content>
        </Combobox.Positioner>
      </Combobox.Root>
    </Field.Root>
  );
};

const CreateReportModal = ({ open, onOpenChange, onReportCreated }: Props) => {
  const { user } = useAuth();

  const derivedType: ReportType =
    user?.role === "DM" ? "DM" : user?.role === "AUDITOR" ? "AUDIT" : "AUDIT";

  const [type, setType] = useState<ReportType>(derivedType);
  const [clientId, setClientId] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [activeReportType, setActiveReportType] = useState<
    "AUDIT" | "DM" | null
  >(null);
  const [validatingNext, setValidatingNext] = useState(false);

  const [warningOpen, setWarningOpen] = useState(false);
  const [pendingType, setPendingType] = useState<ReportType | null>(null);
  const [lastReportDate, setLastReportDate] = useState("");
  const [selectedVsLastDiff, setSelectedVsLastDiff] = useState(0);

  const SelectedReportModal = activeReportType
    ? reportModalMap[activeReportType]
    : null;

  const reportTypeCollection = useMemo(() => {
    if (user?.role === "DM") {
      return createListCollection({
        items: [{ label: "DM", value: "DM" }],
      });
    }

    if (user?.role === "AUDITOR") {
      return createListCollection({
        items: [{ label: "Audit", value: "AUDIT" }],
      });
    }

    return createListCollection({
      items: [
        { label: "Audit", value: "AUDIT" },
        { label: "DM", value: "DM" },
      ],
    });
  }, [user]);

  const clientOptions = useMemo<ClientOption[]>(
    () =>
      clients.map((client) => ({
        label: client.username,
        value: client.id,
      })),
    [clients],
  );

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get("/users/clients");
        setClients(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchClients();
  }, []);

  const handleNext = async () => {
    if (!clientId || !reportDate || !type) {
      toaster.create({
        title: "Please fill all fields",
        type: "error",
      });
      return;
    }

    if (!isFriday(reportDate)) {
      toaster.create({
        title: "Date has to be friday",
        type: "error",
      });
      return;
    }

    const finalType = user?.role === "ADMIN" ? type : derivedType;
    const normalizedSelectedDate = normalizeDateString(reportDate);

    setValidatingNext(true);

    try {
      const res = await axios.get<Report[]>("/reports");

      const matchingReports = res.data.filter(
        (report) => report.client?.id === clientId && report.type === finalType,
      );

      const exactMatch = matchingReports.find(
        (report) =>
          normalizeDateString(report.reportDate) === normalizedSelectedDate,
      );

      if (exactMatch) {
        toaster.create({
          title: "Report already exists for this client/date/type",
          type: "error",
        });
        return;
      }

      const latestMatchingReport = matchingReports.sort(
        (a, b) =>
          parseDateString(b.reportDate).getTime() -
          parseDateString(a.reportDate).getTime(),
      )[0];

      if (latestMatchingReport) {
        const diffDays = getDifferenceInDays(
          reportDate,
          latestMatchingReport.reportDate,
        );

        if (diffDays !== 14) {
          setPendingType(finalType);
          setLastReportDate(latestMatchingReport.reportDate);
          setSelectedVsLastDiff(diffDays);
          setWarningOpen(true);
          return;
        }
      }

      setActiveReportType(finalType);
    } catch (err) {
      console.error(err);
      toaster.create({
        title: "Failed to validate report date",
        type: "error",
      });
    } finally {
      setValidatingNext(false);
    }
  };

  const handleConfirmWarning = () => {
    if (pendingType) {
      setWarningOpen(false);
      setActiveReportType(pendingType);
    }
  };

  const handleClose = () => {
    setType(derivedType);
    setClientId("");
    setReportDate("");
    setWarningOpen(false);
    setPendingType(null);
    setLastReportDate("");
    setSelectedVsLastDiff(0);
    setValidatingNext(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog.Root
        closeOnInteractOutside={false}
        open={open}
        onOpenChange={({ open }) => {
          if (!open) handleClose();
          onOpenChange(open);
        }}
      >
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(6px)" />

          <Dialog.Positioner px={4}>
            <Dialog.Content
              maxW="lg"
              rounded="2xl"
              borderWidth="1px"
              borderColor="border"
              bg="bg.panel"
              shadow="2xl"
            >
              <Box h="1.5" bg="brand.solid" borderTopRadius="inherit" />

              <Dialog.Header
                display="flex"
                justifyContent="space-between"
                alignItems="start"
                px={{ base: 5, md: 6 }}
                pt={{ base: 5, md: 6 }}
                pb={3}
              >
                <Box>
                  <Badge
                    variant="subtle"
                    colorPalette="brand"
                    rounded="full"
                    px="3"
                    py="1"
                    mb={3}
                  >
                    New Report
                  </Badge>

                  <Dialog.Title>Create New Report</Dialog.Title>

                  <Text mt={2} fontSize="sm" color="fg.muted" lineHeight="tall">
                    Choose the report type, client, and reporting date to
                    continue.
                  </Text>
                </Box>

                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" onClick={handleClose} />
                </Dialog.CloseTrigger>
              </Dialog.Header>

              <Dialog.Body px={{ base: 5, md: 6 }} pb={5}>
                <VStack gap={4}>
                  <Select.Root
                    collection={reportTypeCollection}
                    multiple={false}
                    size="lg"
                    variant="subtle"
                    value={[user?.role === "ADMIN" ? type : derivedType]}
                    disabled={user?.role !== "ADMIN"}
                    onValueChange={(details) => {
                      if (user?.role === "ADMIN") {
                        setType(details.value[0] as ReportType);
                      }
                    }}
                  >
                    <Select.HiddenSelect />

                    <Select.Label fontWeight="medium" color="fg.subtle" mb={2}>
                      Report Type
                    </Select.Label>

                    <Select.Control>
                      <Select.Trigger {...triggerStyles}>
                        <Select.ValueText placeholder="Select report type" />
                      </Select.Trigger>

                      <Select.IndicatorGroup color="fg.muted">
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>

                    <Select.Positioner>
                      <Select.Content {...contentStyles}>
                        {reportTypeCollection.items.map((item) => (
                          <Select.Item key={item.value} item={item}>
                            {item.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>

                  <ClientSearchField
                    key={clientOptions.map((option) => option.value).join("|")}
                    clientOptions={clientOptions}
                    value={clientId}
                    onChange={setClientId}
                  />

                  <Field.Root>
                    <Field.Label fontWeight="medium" color="fg.subtle" mb={2}>
                      Report Date
                    </Field.Label>

                    <Input
                      type="date"
                      size="lg"
                      value={reportDate}
                      onChange={(e) => setReportDate(e.target.value)}
                      rounded="xl"
                      bg="bg.subtle"
                      borderWidth="1px"
                      borderColor="border"
                      transition="border-color 0.2s ease, background 0.2s ease"
                      _hover={{
                        borderColor: "border.emphasized",
                      }}
                      _focusVisible={{
                        borderColor: "brand.solid",
                        boxShadow: "0 0 0 1px var(--chakra-colors-brand-solid)",
                      }}
                    />
                  </Field.Root>
                </VStack>
              </Dialog.Body>

              <Dialog.Footer
                px={{ base: 5, md: 6 }}
                pb={{ base: 5, md: 6 }}
                pt={0}
              >
                <Button
                  colorPalette="brand"
                  rounded="xl"
                  onClick={handleNext}
                  loading={validatingNext}
                >
                  Next
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>

        {SelectedReportModal && (
          <SelectedReportModal
            open={true}
            onOpenChange={() => setActiveReportType(null)}
            baseData={{
              type,
              clientId,
              reportDate,
            }}
            onReportCreated={(report: Report) => {
              onReportCreated(report);
              setActiveReportType(null);
              handleClose();
            }}
          />
        )}
      </Dialog.Root>

      <Dialog.Root
        open={warningOpen}
        closeOnInteractOutside={false}
        onOpenChange={({ open }) => {
          setWarningOpen(open);
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
              <Box h="1.5" bg="status.warning" borderTopRadius="inherit" />

              <Dialog.Header
                display="flex"
                justifyContent="space-between"
                alignItems="start"
                px={{ base: 5, md: 6 }}
                pt={{ base: 5, md: 6 }}
                pb={3}
              >
                <Box>
                  <Badge
                    variant="subtle"
                    colorPalette="orange"
                    rounded="full"
                    px="3"
                    py="1"
                    mb={3}
                  >
                    Warning
                  </Badge>

                  <Dialog.Title>Biweekly report check</Dialog.Title>
                </Box>

                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Dialog.CloseTrigger>
              </Dialog.Header>

              <Dialog.Body px={{ base: 5, md: 6 }} pb={5}>
                <Text color="fg.muted" lineHeight="tall">
                  The date you have picked doesn&apos;t seem to be after 2 weeks
                  of the last report. The last report for this campaign and
                  report type was on <b>{formatDisplayDate(lastReportDate)}</b>,
                  which is <b>{getDifferenceLabel(selectedVsLastDiff)}</b> the
                  selected date. Are you sure you want to continue?
                </Text>
              </Dialog.Body>

              <Dialog.Footer
                px={{ base: 5, md: 6 }}
                pb={{ base: 5, md: 6 }}
                pt={0}
              >
                <Button
                  variant="outline"
                  rounded="xl"
                  onClick={() => setWarningOpen(false)}
                >
                  No
                </Button>

                <Button
                  colorPalette="orange"
                  rounded="xl"
                  onClick={handleConfirmWarning}
                >
                  Yes, Continue
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};

export default CreateReportModal;
