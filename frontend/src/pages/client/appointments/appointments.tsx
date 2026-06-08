"use client";

import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "../../../api/axios";
import { useAuth } from "../../../context/useAuth";
import { toaster } from "../../../components/ui/toaster";
import SearchableSelect from "../../../components/my-ui/SearchableSelect";

type SelectOption = { label: string; value: string };

const ALLOWED_EXTENSIONS = ["csv", "xlsx", "xls", "txt"];

export default function AppointmentsFeedbackLoop() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [selectedClientId, setSelectedClientId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // Client list for the admin dropdown.
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
        value: c.id,
      })),
    [clientsQuery.data],
  );

  const selectedClientLabel = useMemo(() => {
    if (!isAdmin) return user?.username ?? "";
    return clientOptions.find((c) => c.value === selectedClientId)?.label ?? "";
  }, [isAdmin, user, clientOptions, selectedClientId]);

  const validateAndSet = (f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      toaster.create({
        title: "Unsupported file type",
        description: "Upload a CSV, Excel (.xlsx, .xls), or text (.txt) file.",
        type: "error",
      });
      return;
    }
    setFile(f);
  };

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("file", file as File);
      if (isAdmin) formData.append("clientId", selectedClientId);

      const res = await axios.post("/appointments/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data as { client: string; filename: string };
    },
    onSuccess: (data) => {
      toaster.create({
        title: "File uploaded",
        description: `Saved to ${data.client}'s folder.`,
        type: "success",
      });
      setFile(null);
    },
    onError: () => {
      toaster.create({ title: "Upload failed", type: "error" });
    },
  });

  const canUpload =
    !!file && (!isAdmin || !!selectedClientId) && !uploadMutation.isPending;

  if (isAdmin && clientsQuery.isLoading) {
    return (
      <Flex minH="50vh" align="center" justify="center" bg="bg">
        <VStack gap={3}>
          <Spinner size="lg" color="brand.solid" />
          <Text color="fg.muted">Loading clients...</Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <Box minH="100dvh" bg="bg">
      <Box
        maxW="1240px"
        mx="auto"
        px={{ base: 4, md: 6 }}
        py={{ base: 6, md: 8 }}
      >
        <VStack align="stretch" gap={6}>
          {/* Hero */}
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
                    Appointments workspace
                  </Text>

                  <Heading size="xl" letterSpacing="-0.02em">
                    Appointments Feedback Loop
                  </Heading>

                  <Text mt={3} color="fg.muted" maxW="3xl" lineHeight="tall">
                    Upload a CSV, Excel, or text file. It will be stored in the
                    {isAdmin
                      ? " selected client's folder."
                      : " your campaign's folder."}
                  </Text>
                </Box>

                {selectedClientLabel ? (
                  <Flex gap={2} wrap="wrap">
                    <Badge
                      variant="subtle"
                      colorPalette="brand"
                      rounded="full"
                      px="3"
                      py="1.5"
                    >
                      {selectedClientLabel}
                    </Badge>
                  </Flex>
                ) : null}
              </Flex>
            </Card.Body>
          </Card.Root>

          {/* Upload form */}
          <Card.Root
            variant="outline"
            bg="bg.panel"
            borderColor="border"
            rounded="2xl"
            shadow="xs"
          >
            <Card.Body p={{ base: 4, md: 5 }}>
              <VStack align="stretch" gap={5}>
                {isAdmin && (
                  <Box>
                    <Text
                      fontWeight="medium"
                      color="fg.subtle"
                      mb={2}
                      h="40px"
                      display="flex"
                      alignItems="center"
                    >
                      Select Client
                    </Text>
                    <SearchableSelect
                      options={clientOptions}
                      value={selectedClientId}
                      onChange={setSelectedClientId}
                      placeholder="Search client..."
                      emptyText="No clients found"
                      size="lg"
                    />
                  </Box>
                )}

                {/* Dropzone */}
                <Box>
                  <Text fontWeight="medium" color="fg.subtle" mb={2}>
                    File
                  </Text>
                  <Box
                    border="2px dashed"
                    borderColor="border.emphasized"
                    rounded="xl"
                    p={10}
                    textAlign="center"
                    bg="bg.subtle"
                    cursor="pointer"
                    transition="background 0.16s ease, border-color 0.16s ease"
                    _hover={{ bg: "bg.hover", borderColor: "brand.solid" }}
                    onClick={() =>
                      document
                        .getElementById("appointments-file-input")
                        ?.click()
                    }
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files[0]) {
                        validateAndSet(e.dataTransfer.files[0]);
                      }
                    }}
                  >
                    <input
                      id="appointments-file-input"
                      type="file"
                      accept=".csv,.xlsx,.xls,.txt"
                      hidden
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          validateAndSet(e.target.files[0]);
                        }
                        // Allow re-selecting the same file later.
                        e.target.value = "";
                      }}
                    />

                    <Text fontWeight="medium">
                      {file
                        ? file.name
                        : "Drag & drop a file or click to select"}
                    </Text>
                    <Text mt={1} fontSize="sm" color="fg.muted">
                      CSV, Excel (.xlsx, .xls), or text (.txt)
                    </Text>
                  </Box>
                </Box>

                <Button
                  colorPalette="brand"
                  size="lg"
                  rounded="xl"
                  disabled={!canUpload}
                  loading={uploadMutation.isPending}
                  onClick={() => uploadMutation.mutate()}
                >
                  Upload
                </Button>
              </VStack>
            </Card.Body>
          </Card.Root>
        </VStack>
      </Box>
    </Box>
  );
}
