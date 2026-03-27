"use client";

import {
  Badge,
  Box,
  Button,
  CloseButton,
  Dialog,
  Heading,
  Portal,
  Select,
  Table,
  Text,
  Textarea,
  VStack,
  createListCollection,
} from "@chakra-ui/react";
import { useCallback, useState, memo } from "react";
import axios from "../../api/axios";
import { toaster } from "../../components/ui/toaster";

type RowData = {
  feedback: string;
  rating: string;
  notes: string;
};

type FormState = Record<string, RowData>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  baseData: {
    id?: string;
    type: string;
    clientId: string;
    reportDate: string;
    content?: FormState;
  };
  onReportCreated: (report: any) => void;
}

const feedbackCollection = createListCollection({
  items: [
    { label: "Yes", value: "YES" },
    { label: "No", value: "NO" },
  ],
});

const ratingCollection = createListCollection({
  items: [
    { label: "N/A", value: "NA" },
    { label: "Low", value: "LOW" },
    { label: "Medium", value: "MEDIUM" },
    { label: "High", value: "HIGH" },
  ],
});

const campaignPerformanceRows = {
  effortIssue: "Effort Issue from Agents",
  rebuttalsIssue: "Rebuttals Issue",
  releasingIssue: "Releasing Issue",
  activeTonalityIssue: "Active Tonality Issue",
};

const actionPointRows = {
  agentsNeedCoaching: "Agents Need Coaching",
  agentsAllocationIssue: "Agents Allocation Issue",
  campaignListIssue: "Campaign List Issue",
};

const initialRow: RowData = {
  feedback: "",
  rating: "",
  notes: "",
};

const selectTriggerStyles = {
  rounded: "lg",
  bg: "bg.panel",
  borderWidth: "1px",
  borderColor: "border",
  transition: "border-color 0.2s ease, background 0.2s ease",
  _hover: {
    borderColor: "border.emphasized",
  },
  _focusVisible: {
    borderColor: "brand.solid",
  },
} as const;

const selectContentStyles = {
  rounded: "xl",
  bg: "bg.panel",
  borderColor: "border.emphasized",
  shadow: "lg",
} as const;

const AuditRow = memo(
  ({
    rowKey,
    label,
    data,
    rowIndex,
    updateField,
  }: {
    rowKey: string;
    label: string;
    data: RowData;
    rowIndex: number;
    updateField: (key: string, field: keyof RowData, value: string) => void;
  }) => (
    <Table.Row
      bg={rowIndex % 2 === 1 ? "bg.subtle" : "transparent"}
      _hover={{ bg: "bg.hover" }}
      transition="background 0.16s ease"
    >
      <Table.Cell fontWeight="medium" verticalAlign="top" minW="220px">
        {label}
      </Table.Cell>

      <Table.Cell minW="180px">
        <Select.Root
          collection={feedbackCollection}
          multiple={false}
          value={data.feedback ? [data.feedback] : []}
          onValueChange={(details) =>
            updateField(rowKey, "feedback", details.value[0] ?? "")
          }
        >
          <Select.HiddenSelect />

          <Select.Control>
            <Select.Trigger {...selectTriggerStyles}>
              <Select.ValueText placeholder="Select" />
            </Select.Trigger>

            <Select.IndicatorGroup color="fg.muted">
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>

          <Select.Positioner>
            <Select.Content {...selectContentStyles}>
              {feedbackCollection.items.map((item) => (
                <Select.Item key={item.value} item={item}>
                  {item.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      </Table.Cell>

      <Table.Cell minW="180px">
        <Select.Root
          collection={ratingCollection}
          multiple={false}
          value={data.rating ? [data.rating] : []}
          onValueChange={(details) =>
            updateField(rowKey, "rating", details.value[0] ?? "")
          }
        >
          <Select.HiddenSelect />

          <Select.Control>
            <Select.Trigger {...selectTriggerStyles}>
              <Select.ValueText placeholder="Select" />
            </Select.Trigger>

            <Select.IndicatorGroup color="fg.muted">
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>

          <Select.Positioner>
            <Select.Content {...selectContentStyles}>
              {ratingCollection.items.map((item) => (
                <Select.Item key={item.value} item={item}>
                  {item.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      </Table.Cell>

      <Table.Cell minW="280px">
        <Textarea
          size="sm"
          value={data.notes}
          onChange={(e) => updateField(rowKey, "notes", e.target.value)}
          minH="100px"
          resize="vertical"
          rounded="lg"
          bg="bg.panel"
          borderColor="border"
          transition="border-color 0.2s ease, background 0.2s ease"
          _hover={{ borderColor: "border.emphasized" }}
          _focusVisible={{
            borderColor: "brand.solid",
            boxShadow: "0 0 0 1px var(--chakra-colors-brand-solid)",
          }}
        />
      </Table.Cell>
    </Table.Row>
  ),
);

AuditRow.displayName = "AuditRow";

const AuditReportModal = ({
  open,
  onOpenChange,
  baseData,
  onReportCreated,
}: Props) => {
  const [loading, setLoading] = useState(false);

  const buildInitialForm = (): FormState => ({
    effortIssue: { ...initialRow },
    rebuttalsIssue: { ...initialRow },
    releasingIssue: { ...initialRow },
    activeTonalityIssue: { ...initialRow },
    agentsNeedCoaching: { ...initialRow },
    agentsAllocationIssue: { ...initialRow },
    campaignListIssue: { ...initialRow },
  });

  const [form, setForm] = useState<FormState>(
    baseData.content ? baseData.content : buildInitialForm(),
  );

  const updateField = useCallback(
    (key: string, field: keyof RowData, value: string) => {
      setForm((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          [field]: value,
        },
      }));
    },
    [],
  );

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const { id, ...bodyData } = baseData;

      const formattedBody = {
        ...bodyData,
        reportDate: new Date(bodyData.reportDate).toISOString().split("T")[0],
        content: form,
      };

      let res;
      if (id) {
        res = await axios.put(`/reports/${id}`, formattedBody);
        toaster.create({
          title: "Report updated successfully!",
          type: "success",
        });
      } else {
        res = await axios.post("/reports", formattedBody);
        toaster.create({
          title: "Report created successfully!",
          type: "success",
        });
      }

      onReportCreated(res.data);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toaster.create({ title: "Failed to submit report", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root
      open={open}
      closeOnInteractOutside={false}
      onOpenChange={({ open }) => onOpenChange(open)}
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(6px)" />

        <Dialog.Positioner px={4}>
          <Dialog.Content
            maxW="6xl"
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
                  {baseData.id ? "Edit Report" : "New Report"}
                </Badge>

                <Dialog.Title>Audit Report</Dialog.Title>

                <Text mt={2} fontSize="sm" color="fg.muted" lineHeight="tall">
                  Capture auditing feedback, issue ratings, and notes for the
                  selected campaign period.
                </Text>
              </Box>

              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body px={{ base: 5, md: 6 }} pb={5}>
              <VStack align="stretch" gap={6}>
                <Box
                  rounded="xl"
                  borderWidth="1px"
                  borderColor="border"
                  bg="bg.subtle"
                  p={{ base: 4, md: 5 }}
                >
                  <Heading size="md" mb={4}>
                    Campaign Performance Report
                  </Heading>

                  <Box
                    overflowX="auto"
                    rounded="lg"
                    borderWidth="1px"
                    borderColor="border.muted"
                    bg="bg.panel"
                  >
                    <Table.Root variant="line" size="sm">
                      <Table.Header>
                        <Table.Row bg="bg.muted">
                          <Table.ColumnHeader color="fg.subtle">
                            Issue
                          </Table.ColumnHeader>
                          <Table.ColumnHeader color="fg.subtle">
                            Auditing Feedback
                          </Table.ColumnHeader>
                          <Table.ColumnHeader color="fg.subtle">
                            Issue Rating
                          </Table.ColumnHeader>
                          <Table.ColumnHeader color="fg.subtle">
                            Notes
                          </Table.ColumnHeader>
                        </Table.Row>
                      </Table.Header>

                      <Table.Body>
                        {Object.entries(campaignPerformanceRows).map(
                          ([key, label], index) => (
                            <AuditRow
                              key={key}
                              rowKey={key}
                              label={label}
                              data={form[key]}
                              rowIndex={index}
                              updateField={updateField}
                            />
                          ),
                        )}
                      </Table.Body>
                    </Table.Root>
                  </Box>
                </Box>

                <Box
                  rounded="xl"
                  borderWidth="1px"
                  borderColor="border"
                  bg="bg.subtle"
                  p={{ base: 4, md: 5 }}
                >
                  <Heading size="md" mb={4}>
                    Action Points
                  </Heading>

                  <Box
                    overflowX="auto"
                    rounded="lg"
                    borderWidth="1px"
                    borderColor="border.muted"
                    bg="bg.panel"
                  >
                    <Table.Root variant="line" size="sm">
                      <Table.Header>
                        <Table.Row bg="bg.muted">
                          <Table.ColumnHeader color="fg.subtle">
                            Issue
                          </Table.ColumnHeader>
                          <Table.ColumnHeader color="fg.subtle">
                            Auditing Feedback
                          </Table.ColumnHeader>
                          <Table.ColumnHeader color="fg.subtle">
                            Issue Rating
                          </Table.ColumnHeader>
                          <Table.ColumnHeader color="fg.subtle">
                            Notes
                          </Table.ColumnHeader>
                        </Table.Row>
                      </Table.Header>

                      <Table.Body>
                        {Object.entries(actionPointRows).map(
                          ([key, label], index) => (
                            <AuditRow
                              key={key}
                              rowKey={key}
                              label={label}
                              data={form[key]}
                              rowIndex={index}
                              updateField={updateField}
                            />
                          ),
                        )}
                      </Table.Body>
                    </Table.Root>
                  </Box>
                </Box>
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
                onClick={handleSubmit}
                loading={loading}
              >
                {baseData.id ? "Update Report" : "Create Report"}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default AuditReportModal;
