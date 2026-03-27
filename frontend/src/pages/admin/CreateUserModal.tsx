"use client";

import {
  Badge,
  Box,
  Button,
  Clipboard,
  CloseButton,
  Dialog,
  Field,
  IconButton,
  Input,
  InputGroup,
  Portal,
  Select,
  Text,
  VStack,
  createListCollection,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import axios from "../../api/axios";
import { toaster } from "../../components/ui/toaster";
import type { User } from "../../types/auth";

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

const getRoleCollection = (mode: "USER" | "CLIENT") =>
  createListCollection({
    items:
      mode === "CLIENT"
        ? [{ label: "Client", value: "CLIENT" }]
        : [
            { label: "Admin", value: "ADMIN" },
            { label: "Auditor", value: "AUDITOR" },
            { label: "DM", value: "DM" },
          ],
  });

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated: (user: User) => void;
  defaultRole?: User["role"];
  mode?: "USER" | "CLIENT";
}

const selectTriggerStyles = {
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

const selectContentStyles = {
  rounded: "xl",
  bg: "bg.panel",
  borderColor: "border.emphasized",
  shadow: "lg",
} as const;

const CreateUserModal = ({
  open,
  onOpenChange,
  onUserCreated,
  defaultRole,
  mode = "USER",
}: CreateUserModalProps) => {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<User["role"]>(
    defaultRole || (mode === "CLIENT" ? "CLIENT" : "AUDITOR"),
  );
  const [loading, setLoading] = useState(false);
  const [magicLink, setMagicLink] = useState<string | null>(null);

  const roleCollection = useMemo(() => getRoleCollection(mode), [mode]);
  const isClientMode = mode === "CLIENT";

  useEffect(() => {
    if (open) {
      setRole(defaultRole || (mode === "CLIENT" ? "CLIENT" : "AUDITOR"));
    }
  }, [open, defaultRole, mode]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/users", { username, role });
      setMagicLink(`${FRONTEND_URL}/set-password?token=${res.data.setupToken}`);
      onUserCreated(res.data.user);

      toaster.create({ title: "User created successfully!", type: "success" });
    } catch (err) {
      console.error(err);
      toaster.create({ title: "Failed to create user", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUsername("");
    setRole(defaultRole || "AUDITOR");
    setMagicLink(null);
    onOpenChange(false);
  };

  const ClipboardIconButton = () => {
    return (
      <Clipboard.Trigger asChild>
        <IconButton
          aria-label="Copy invitation link"
          variant="ghost"
          size="xs"
          rounded="full"
          me="-2"
          color="fg.muted"
          _hover={{ bg: "bg.hover", color: "brand.fg" }}
        >
          <Clipboard.Indicator />
        </IconButton>
      </Clipboard.Trigger>
    );
  };

  return (
    <Dialog.Root
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
                  {isClientMode ? "New Campaign" : "New User"}
                </Badge>

                <Dialog.Title>
                  {isClientMode ? "Create New Campaign" : "Create New User"}
                </Dialog.Title>

                <Text mt={2} fontSize="sm" color="fg.muted" lineHeight="tall">
                  {isClientMode
                    ? "Create a client account and generate a setup link to share."
                    : "Create a team member account and generate a setup link to share."}
                </Text>
              </Box>

              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" onClick={handleClose} />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body px={{ base: 5, md: 6 }} pb={5}>
              <VStack gap={4} align="stretch">
                <Field.Root>
                  <Field.Label fontWeight="medium" color="fg.subtle" mb={2}>
                    Username
                  </Field.Label>
                  <Input
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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

                <Select.Root
                  collection={roleCollection}
                  multiple={false}
                  size="lg"
                  variant="subtle"
                  value={[role]}
                  onValueChange={(details) => {
                    const val = details.value[0] as User["role"];
                    setRole(val);
                  }}
                >
                  <Select.HiddenSelect />

                  <Select.Label fontWeight="medium" color="fg.subtle" mb={2}>
                    Role
                  </Select.Label>

                  <Select.Control>
                    <Select.Trigger {...selectTriggerStyles}>
                      <Select.ValueText placeholder="Select role" />
                    </Select.Trigger>
                    <Select.IndicatorGroup color="fg.muted">
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>

                  <Select.Positioner>
                    <Select.Content {...selectContentStyles}>
                      {roleCollection.items.map((item) => (
                        <Select.Item key={item.value} item={item}>
                          {item.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Select.Root>

                {magicLink && (
                  <Box
                    p={4}
                    rounded="xl"
                    borderWidth="1px"
                    borderColor="border"
                    bg="bg.subtle"
                  >
                    <Clipboard.Root value={magicLink}>
                      <Clipboard.Label
                        fontWeight="medium"
                        color="fg.subtle"
                        mb={2}
                      >
                        Invitation Link
                      </Clipboard.Label>

                      <InputGroup endElement={<ClipboardIconButton />}>
                        <Clipboard.Input asChild>
                          <Input
                            readOnly
                            rounded="xl"
                            bg="bg.panel"
                            borderColor="border"
                            color="fg"
                          />
                        </Clipboard.Input>
                      </InputGroup>

                      <Text mt={3} fontSize="sm" color="fg.muted">
                        Copy and share this link so the user can set their
                        password.
                      </Text>
                    </Clipboard.Root>
                  </Box>
                )}
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
                Create
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default CreateUserModal;
