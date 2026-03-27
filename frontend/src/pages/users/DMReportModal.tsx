"use client";

import {
  Badge,
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  Heading,
  HStack,
  IconButton,
  Portal,
  Tabs,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import axios from "../../api/axios";
import { toaster } from "../../components/ui/toaster";
import { Plus, Trash2 } from "lucide-react";
import FloatingLabelInput from "../../components/my-ui/FloatingInputField";
import FloatingLabelTextarea from "../../components/my-ui/FloatingTextareaField";

/* ----------------------------- */
/* Types */
/* ----------------------------- */

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

type ActionItem = {
  title: string;
  description: string;
};

type SectionField = {
  name: string;
  label: string;
  type: "input" | "textarea";
};

type SectionConfig = {
  key: string;
  label: string;
  fields: SectionField[];
};

type SectionData = {
  actions: ActionItem[];
  fields: Record<string, string>;
};

type FormState = Record<string, SectionData>;

/* ----------------------------- */
/* CONFIG */
/* ----------------------------- */

const sections: SectionConfig[] = [
  {
    key: "callLogsSummary",
    label: "Call Logs Summary File",
    fields: [
      { name: "fileOverview", label: "File Overview (link)", type: "input" },
      { name: "listName", label: "List Name", type: "input" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "filesReport",
    label: "Files Report File",
    fields: [
      { name: "fileOverview", label: "File Overview (link)", type: "input" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "campaignReport",
    label: "Campaign Report File",
    fields: [
      { name: "fileOverview", label: "File Overview (link)", type: "input" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "callLogsOutput",
    label: "Call Logs Output",
    fields: [
      { name: "fileOverview", label: "File Overview (link)", type: "input" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "didsLogs",
    label: "DIDs Logs File",
    fields: [
      { name: "fileOverview", label: "File Overview", type: "input" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "flashCards",
    label: "Flash Cards",
    fields: [
      { name: "fileOverview", label: "File Overview", type: "input" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
  },
];

/* ----------------------------- */
/* Section Component */
/* ----------------------------- */

interface ActionSectionProps {
  title: string;
  sectionKey: string;
  sectionData: SectionData;
  fields: SectionField[];
  updateField: (section: string, field: string, value: string) => void;
  updateAction: (
    section: string,
    index: number,
    field: keyof ActionItem,
    value: string,
  ) => void;
  addAction: (section: string) => void;
  removeAction: (section: string, index: number) => void;
}

const ActionSection = ({
  title,
  sectionKey,
  sectionData,
  fields,
  updateField,
  updateAction,
  addAction,
  removeAction,
}: ActionSectionProps) => {
  return (
    <VStack align="stretch" gap={5}>
      <Box>
        <Text
          fontSize="xs"
          fontWeight="semibold"
          textTransform="uppercase"
          letterSpacing="0.12em"
          color="brand.fg"
        >
          Section
        </Text>
        <Heading size="md" mt={1}>
          {title}
        </Heading>
      </Box>

      <Box
        p={{ base: 4, md: 5 }}
        rounded="xl"
        borderWidth="1px"
        borderColor="border"
        bg="bg.subtle"
      >
        <VStack align="stretch" gap={4}>
          {fields.map((field) =>
            field.type === "input" ? (
              <FloatingLabelInput
                key={field.name}
                label={field.label}
                value={sectionData.fields[field.name] ?? ""}
                onValueChange={(val) =>
                  updateField(sectionKey, field.name, val)
                }
              />
            ) : (
              <FloatingLabelTextarea
                key={field.name}
                label={field.label}
                value={sectionData.fields[field.name] ?? ""}
                onValueChange={(val) =>
                  updateField(sectionKey, field.name, val)
                }
              />
            ),
          )}
        </VStack>
      </Box>

      <Box
        p={{ base: 4, md: 5 }}
        rounded="xl"
        borderWidth="1px"
        borderColor="border"
        bg="bg.subtle"
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "start", md: "center" }}
          gap={4}
          mb={4}
        >
          <Box>
            <Heading size="sm">Data Team Actions</Heading>
            <Text mt={1.5} fontSize="sm" color="fg.muted">
              Add and manage actions related to this section.
            </Text>
          </Box>

          <Button
            variant="outline"
            colorPalette="brand"
            rounded="xl"
            onClick={() => addAction(sectionKey)}
          >
            <HStack gap={2}>
              <Plus size={16} />
              <span>Add Action</span>
            </HStack>
          </Button>
        </Flex>

        <VStack align="stretch" gap={3}>
          {sectionData.actions.map((action, index) => (
            <Box
              key={index}
              p={4}
              rounded="xl"
              borderWidth="1px"
              borderColor="border"
              bg="bg.panel"
              transition="background 0.18s ease, border-color 0.18s ease"
              _hover={{
                bg: "bg.hover",
                borderColor: "border.emphasized",
              }}
            >
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="xs">Action #{index + 1}</Heading>

                {sectionData.actions.length > 1 && (
                  <IconButton
                    aria-label="Delete action"
                    variant="ghost"
                    colorPalette="red"
                    rounded="full"
                    size="sm"
                    onClick={() => removeAction(sectionKey, index)}
                  >
                    <Trash2 size={14} />
                  </IconButton>
                )}
              </Flex>

              <VStack gap={4} align="stretch">
                <FloatingLabelInput
                  label="Action Title"
                  value={action.title}
                  onValueChange={(val) =>
                    updateAction(sectionKey, index, "title", val)
                  }
                />

                <FloatingLabelTextarea
                  label="Action Description"
                  value={action.description}
                  onValueChange={(val) =>
                    updateAction(sectionKey, index, "description", val)
                  }
                />
              </VStack>
            </Box>
          ))}
        </VStack>
      </Box>
    </VStack>
  );
};

/* ----------------------------- */
/* Main Modal */
/* ----------------------------- */

const DMReportModal = ({
  open,
  onOpenChange,
  baseData,
  onReportCreated,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(sections[0].key);

  const buildInitialForm = (): FormState => {
    const obj: FormState = {};
    sections.forEach((section) => {
      const sectionData: SectionData = {
        actions: [{ title: "", description: "" }],
        fields: {},
      };
      section.fields.forEach((field) => {
        sectionData.fields[field.name] = "";
      });
      obj[section.key] = sectionData;
    });
    return obj;
  };

  const [form, setForm] = useState<FormState>(
    baseData.content ? baseData.content : buildInitialForm(),
  );

  const updateField = (section: string, field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        fields: { ...prev[section].fields, [field]: value },
      },
    }));
  };

  const updateAction = (
    section: string,
    index: number,
    field: keyof ActionItem,
    value: string,
  ) => {
    setForm((prev) => {
      const updatedActions = [...prev[section].actions];
      updatedActions[index] = { ...updatedActions[index], [field]: value };
      return {
        ...prev,
        [section]: { ...prev[section], actions: updatedActions },
      };
    });
  };

  const addAction = (section: string) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        actions: [...prev[section].actions, { title: "", description: "" }],
      },
    }));
  };

  const removeAction = (section: string, index: number) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        actions: prev[section].actions.filter((_, i) => i !== index),
      },
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      let res;
      const { id, ...bodyData } = baseData;

      const formattedBody = {
        ...bodyData,
        reportDate: new Date(bodyData.reportDate).toISOString().split("T")[0],
        content: form,
      };

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

  const isLastTab = activeTab === sections[sections.length - 1].key;

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

                <Dialog.Title>DM Report</Dialog.Title>

                <Text mt={2} fontSize="sm" color="fg.muted" lineHeight="tall">
                  Fill in each report section and add the relevant action items
                  before submitting.
                </Text>
              </Box>

              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body px={{ base: 5, md: 6 }} pb={5}>
              <Tabs.Root
                value={activeTab}
                onValueChange={(e) => setActiveTab(e.value)}
                variant="plain"
                lazyMount
                unmountOnExit
              >
                <Box overflowX="auto" pb={1}>
                  <Tabs.List
                    minW="max-content"
                    bg="bg.muted"
                    p="1"
                    rounded="xl"
                    gap="1"
                    borderWidth="1px"
                    borderColor="border"
                  >
                    {sections.map((section) => (
                      <Tabs.Trigger
                        key={section.key}
                        value={section.key}
                        px={4}
                        py={2.5}
                        rounded="lg"
                        whiteSpace="nowrap"
                        color="fg.muted"
                        borderWidth="1px"
                        borderColor="transparent"
                        transition="all 0.2s ease"
                        _hover={{ color: "fg" }}
                        _selected={{
                          bg: "brand.subtle",
                          color: "brand.fg",
                          borderColor: "brand.emphasized",
                          shadow: "xs",
                        }}
                      >
                        {section.label}
                      </Tabs.Trigger>
                    ))}
                  </Tabs.List>
                </Box>

                {sections.map((section) => (
                  <Tabs.Content key={section.key} value={section.key} pt={5}>
                    <ActionSection
                      title={section.label}
                      sectionKey={section.key}
                      sectionData={form[section.key]}
                      fields={section.fields}
                      updateField={updateField}
                      updateAction={updateAction}
                      addAction={addAction}
                      removeAction={removeAction}
                    />
                  </Tabs.Content>
                ))}
              </Tabs.Root>
            </Dialog.Body>

            {isLastTab && (
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
            )}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default DMReportModal;
