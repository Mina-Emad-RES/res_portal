"use client";

import {
  Box,
  Button,
  Card,
  CloseButton,
  Dialog,
  Field,
  Flex,
  HStack,
  Input,
  Portal,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../../api/axios";
import { toaster } from "../../components/ui/toaster";
import InfoPopover from "../../components/my-ui/InfoPopover";

type DriveFolderResponse = { driveFolderId: string | null };

const SettingsTab = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const settingsQuery = useQuery({
    queryKey: ["settings", "drive-folder-id"],
    queryFn: () =>
      axios
        .get<DriveFolderResponse>("/settings/drive-folder-id")
        .then((r) => r.data),
  });

  const currentId = settingsQuery.data?.driveFolderId ?? "";

  const updateMutation = useMutation({
    mutationFn: (driveFolderId: string) =>
      axios.put("/settings/drive-folder-id", { driveFolderId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["settings", "drive-folder-id"],
      });
      toaster.create({ title: "Drive folder updated", type: "success" });
      setOpen(false);
    },
    onError: () => {
      toaster.create({
        title: "Failed to update Drive folder",
        type: "error",
      });
    },
  });

  const openModal = () => {
    setDraft(currentId);
    setOpen(true);
  };

  const handleConfirm = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      toaster.create({ title: "Folder ID cannot be empty", type: "error" });
      return;
    }
    updateMutation.mutate(trimmed);
  };

  if (settingsQuery.isLoading) {
    return (
      <Flex minH="30vh" align="center" justify="center">
        <VStack gap={3}>
          <Spinner size="lg" color="brand.solid" />
          <Text color="fg.muted">Loading settings...</Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <VStack align="stretch" gap={6}>
      <Card.Root
        variant="outline"
        bg="bg.panel"
        borderColor="border"
        rounded="2xl"
        shadow="xs"
      >
        <Card.Body p={{ base: 5, md: 6 }}>
          <Field.Root>
            <Box>
              <HStack mb={2} h="40px" align="center" gap={2}>
                <Field.Label fontWeight="medium" color="fg.subtle">
                  Drive folder ID
                </Field.Label>
                <Box as="span" className="tour-info-popover">
                  <InfoPopover content="The Drive folder where client files uploaded through the Appointments feedback loop are stored, Click the field to change the folder." />
                </Box>
              </HStack>
            </Box>
            <Flex
              gap={3}
              align="center"
              direction={{ base: "column", sm: "row" }}
            >
              <Input
                readOnly
                value={currentId || "Not set"}
                onClick={openModal}
                cursor="pointer"
                size="lg"
                rounded="xl"
                bg="bg.subtle"
                borderWidth="1px"
                borderColor="border"
                color={currentId ? "fg" : "fg.muted"}
                transition="background 0.2s ease, border-color 0.2s ease"
                _hover={{ bg: "bg.hover", borderColor: "border.emphasized" }}
                _focusVisible={{ borderColor: "brand.solid" }}
              />

              <Button
                colorPalette="brand"
                size="lg"
                rounded="xl"
                flexShrink={0}
                onClick={openModal}
              >
                Change
              </Button>
            </Flex>
          </Field.Root>
        </Card.Body>
      </Card.Root>

      {/* Confirm modal */}
      <Dialog.Root
        role="alertdialog"
        open={open}
        onOpenChange={(e) => setOpen(e.open)}
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
              <Box h="1.5" bg="status.warning" borderTopRadius="inherit" />

              <Dialog.Header
                display="flex"
                justifyContent="space-between"
                alignItems="start"
                px={6}
                pt={6}
                pb={3}
              >
                <Box>
                  <Dialog.Title>Change Drive folder?</Dialog.Title>
                </Box>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Dialog.CloseTrigger>
              </Dialog.Header>

              <Dialog.Body px={6} pb={4}>
                <Box
                  p={4}
                  mb={4}
                  rounded="xl"
                  borderWidth="1px"
                  borderColor="border"
                  bg="bg.subtle"
                >
                  <Text color="fg.muted" lineHeight="tall">
                    This folder is used to store all the files clients have
                    uploaded using the Appointments feedback loop. Changing the
                    ID will make new files get uploaded to the new folder, but
                    already uploaded files will stay as they are in the current
                    folder.
                  </Text>
                </Box>

                <Field.Root>
                  <Field.Label fontWeight="medium" color="fg.subtle" mb={2}>
                    Drive folder ID
                  </Field.Label>
                  <Input
                    placeholder="Enter folder ID"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    size="lg"
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
                </Field.Root>
              </Dialog.Body>

              <Dialog.Footer px={6} pb={6} pt={0}>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline" rounded="xl">
                    Cancel
                  </Button>
                </Dialog.ActionTrigger>

                <Button
                  colorPalette="brand"
                  rounded="xl"
                  onClick={handleConfirm}
                  loading={updateMutation.isPending}
                >
                  Confirm
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </VStack>
  );
};

export default SettingsTab;
