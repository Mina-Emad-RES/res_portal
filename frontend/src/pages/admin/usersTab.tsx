"use client";

import {
  Badge,
  Box,
  Button,
  Card,
  CloseButton,
  Dialog,
  Flex,
  HStack,
  Portal,
  Select,
  Spinner,
  Table,
  Text,
  VStack,
  createListCollection,
} from "@chakra-ui/react";
import { Tooltip } from "../../components/ui/tooltip";
import { toaster } from "../../components/ui/toaster";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../../api/axios";
import CreateUserModal from "./CreateUserModal";
import type { User } from "../../types/auth";
import { useSortParams } from "../../hooks/useSortParams";
import SortableColumnHeader from "../../components/my-ui/SortableColumnHeader";

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

const roleCollection = createListCollection({
  items: [
    { label: "Admin", value: "ADMIN" },
    { label: "Auditor", value: "AUDITOR" },
    { label: "DM", value: "DM" },
    { label: "Client", value: "CLIENT" },
  ],
});

type UserStatus =
  | { type: "MAGIC_LINK"; color: "blue" }
  | { type: "SETUP_EXPIRED"; color: "gray" }
  | { type: "ACTIVE"; color: "green" }
  | { type: "INACTIVE"; color: "orange" };

const selectTriggerStyles = {
  rounded: "lg",
  bg: "bg.panel",
  borderWidth: "1px",
  borderColor: "border",
  transition: "background 0.2s ease, border-color 0.2s ease",
  _hover: { bg: "bg.hover", borderColor: "border.emphasized" },
  _focusVisible: { borderColor: "brand.solid" },
  _disabled: {
    opacity: 1,
    bg: "bg.subtle",
    color: "fg.muted",
    cursor: "not-allowed",
  },
} as const;

const selectContentStyles = {
  rounded: "xl",
  bg: "bg.panel",
  borderColor: "border.emphasized",
  shadow: "lg",
} as const;

const ROLE_ORDER = ["ADMIN", "AUDITOR", "DM", "CLIENT"];

// Order used when sorting by the (derived) Status column.
const STATUS_ORDER: UserStatus["type"][] = [
  "ACTIVE",
  "INACTIVE",
  "MAGIC_LINK",
  "SETUP_EXPIRED",
];

// --- Status helpers (module-scope so the sort comparator can reuse them) ---

const getUserStatus = (user: User): UserStatus => {
  if (user.passwordSetupToken) {
    if (
      user.passwordSetupExpires &&
      new Date(user.passwordSetupExpires) > new Date()
    ) {
      return { type: "MAGIC_LINK", color: "blue" };
    }
    return { type: "SETUP_EXPIRED", color: "gray" };
  }
  return user.isActive
    ? { type: "ACTIVE", color: "green" }
    : { type: "INACTIVE", color: "orange" };
};

const getStatusLabel = (status: UserStatus) => {
  if (status.type === "MAGIC_LINK") return "Setup Pending";
  if (status.type === "SETUP_EXPIRED") return "Setup Expired";
  if (status.type === "ACTIVE") return "Active";
  return "Inactive";
};

const getStatusPalette = (status: UserStatus) => {
  if (status.type === "MAGIC_LINK") return "brand";
  if (status.type === "SETUP_EXPIRED") return "gray";
  if (status.type === "ACTIVE") return "green";
  return "orange";
};

const UsersTab = ({ roleFilter }: { roleFilter?: string }) => {
  const queryClient = useQueryClient();
  const isClientView = roleFilter === "CLIENT";
  const [modalOpen, setModalOpen] = useState(false);

  // Sort state lives in the URL (shared across both admin tabs since the
  // columns are identical). Pass keyParam/dirParam if you want per-tab sort.
  const { sortKey, sortDir, toggleSort } = useSortParams();

  // Single query for the full user list. We filter/sort in-memory below so
  // both UsersTab variants (clients view + internal view) can share the cache.
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: () => axios.get<User[]>("/users").then((r) => r.data),
  });

  const users = useMemo(() => {
    const data = usersQuery.data;
    if (!Array.isArray(data)) return [];

    const filtered = roleFilter
      ? data.filter((u) => u.role === roleFilter)
      : data.filter((u) => u.role !== "CLIENT");

    const dir = sortDir === "asc" ? 1 : -1;

    const compare = (a: User, b: User): number => {
      // No active column -> default ordering: role order, then username.
      if (!sortKey) {
        if (a.role !== b.role) {
          return ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role);
        }
        return a.username.localeCompare(b.username);
      }

      let cmp = 0;
      switch (sortKey) {
        case "username":
          cmp = a.username.localeCompare(b.username);
          break;
        case "role":
          cmp = ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role);
          break;
        case "status":
          cmp =
            STATUS_ORDER.indexOf(getUserStatus(a).type) -
            STATUS_ORDER.indexOf(getUserStatus(b).type);
          break;
        case "createdAt":
          cmp =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "updatedAt":
          cmp =
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }
      // Stable tiebreak.
      if (cmp === 0) cmp = a.username.localeCompare(b.username);
      return cmp * dir;
    };

    return [...filtered].sort(compare);
  }, [usersQuery.data, roleFilter, sortKey, sortDir]);

  // Mutations: each one fires the API call, then invalidates the users
  // query on success — TanStack Query refetches and the table updates.
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: User["role"] }) =>
      axios.patch(`/users/${userId}`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toaster.create({ title: "Role updated", type: "success" });
    },
    onError: () => {
      toaster.create({ title: "Failed to update role", type: "error" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => axios.delete(`/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toaster.create({ title: "User deleted", type: "success" });
    },
    onError: () => {
      toaster.create({ title: "Failed to delete user", type: "error" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      axios.patch(`/users/${userId}`, { isActive }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toaster.create({
        title: variables.isActive ? "User activated" : "User deactivated",
        type: "success",
      });
    },
    onError: () => {
      toaster.create({
        title: "Failed to update user status",
        type: "error",
      });
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: (userId: string) =>
      axios.patch<{ setupToken: string }>(`/users/${userId}/resend-setup-link`),
    onSuccess: async (res) => {
      const link = `${FRONTEND_URL}/set-password?token=${res.data.setupToken}`;
      await navigator.clipboard.writeText(link);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toaster.create({
        title: "New setup link generated",
        description: "Link copied to clipboard",
        type: "success",
      });
    },
    onError: () => {
      toaster.create({ title: "Failed to generate link", type: "error" });
    },
  });

  if (usersQuery.isLoading) {
    return (
      <Flex minH="30vh" align="center" justify="center">
        <VStack gap={3}>
          <Spinner size="lg" color="brand.solid" />
          <Text color="fg.muted">
            Loading {isClientView ? "campaigns" : "users"}...
          </Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <VStack align="stretch" gap={6}>
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "start", md: "center" }}
        gap={4}
      >
        <Box>
          <Text fontSize="sm" fontWeight="medium" color="fg.subtle" mb={2}>
            {isClientView ? "Campaign accounts" : "Internal accounts"}
          </Text>

          <HStack gap={2} wrap="wrap">
            <Badge
              variant="subtle"
              colorPalette="brand"
              rounded="full"
              px="3"
              py="1.5"
            >
              {users.length} {isClientView ? "campaign" : "user"}
              {users.length === 1 ? "" : "s"}
            </Badge>
          </HStack>
        </Box>

        <Button
          colorPalette="brand"
          size="lg"
          rounded="xl"
          onClick={() => setModalOpen(true)}
        >
          {roleFilter === "CLIENT" ? "Create New Campaign" : "Create New User"}
        </Button>
      </Flex>

      <CreateUserModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onUserCreated={() =>
          queryClient.invalidateQueries({ queryKey: ["users"] })
        }
        defaultRole={roleFilter === "CLIENT" ? "CLIENT" : undefined}
        mode={roleFilter === "CLIENT" ? "CLIENT" : "USER"}
      />

      <Card.Root
        variant="outline"
        bg="bg.panel"
        borderColor="border"
        rounded="2xl"
        shadow="xs"
      >
        <Card.Body p={0}>
          {!users.length ? (
            <Box px={{ base: 5, md: 6 }} py={{ base: 10, md: 12 }}>
              <VStack gap={2} textAlign="center">
                <Text fontSize="lg" fontWeight="semibold">
                  No {isClientView ? "campaigns" : "users"} yet
                </Text>
                <Text color="fg.muted">
                  Create a new {isClientView ? "campaign" : "user"} to get
                  started.
                </Text>
              </VStack>
            </Box>
          ) : (
            <Box overflowX="auto" padding="10px">
              <Table.Root variant="line" size="sm" stickyHeader>
                <Table.Header>
                  <Table.Row bg="bg.muted">
                    <SortableColumnHeader
                      label="Username"
                      columnKey="username"
                      activeKey={sortKey}
                      direction={sortDir}
                      onSort={toggleSort}
                    />
                    <SortableColumnHeader
                      label="Role"
                      columnKey="role"
                      activeKey={sortKey}
                      direction={sortDir}
                      onSort={toggleSort}
                    />
                    <SortableColumnHeader
                      label="Status"
                      columnKey="status"
                      activeKey={sortKey}
                      direction={sortDir}
                      onSort={toggleSort}
                    />
                    <SortableColumnHeader
                      label="Created At"
                      columnKey="createdAt"
                      activeKey={sortKey}
                      direction={sortDir}
                      onSort={toggleSort}
                    />
                    <SortableColumnHeader
                      label="Updated At"
                      columnKey="updatedAt"
                      activeKey={sortKey}
                      direction={sortDir}
                      onSort={toggleSort}
                    />
                    <Table.ColumnHeader color="fg.subtle">
                      Actions
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {users.map((user, index) => {
                    const status = getUserStatus(user);

                    return (
                      <Table.Row
                        key={user.id}
                        bg={index % 2 === 1 ? "bg.subtle" : "transparent"}
                        _hover={{ bg: "bg.hover" }}
                        transition="background 0.16s ease"
                      >
                        <Table.Cell fontWeight="medium">
                          {user.username}
                        </Table.Cell>

                        <Table.Cell minW="180px">
                          <Select.Root
                            disabled={isClientView}
                            collection={roleCollection}
                            multiple={false}
                            size="sm"
                            value={[user.role]}
                            onValueChange={(details) => {
                              const val = details.value[0] as User["role"];
                              updateRoleMutation.mutate({
                                userId: user.id,
                                role: val,
                              });
                            }}
                          >
                            <Select.HiddenSelect />

                            <Select.Control>
                              <Select.Trigger {...selectTriggerStyles}>
                                <Select.ValueText />
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
                        </Table.Cell>

                        <Table.Cell>
                          <Badge
                            variant="subtle"
                            colorPalette={getStatusPalette(status)}
                            rounded="full"
                            px="3"
                            py="1"
                          >
                            {getStatusLabel(status)}
                          </Badge>
                        </Table.Cell>

                        <Table.Cell whiteSpace="nowrap">
                          {new Date(user.createdAt).toLocaleString()}
                        </Table.Cell>

                        <Table.Cell whiteSpace="nowrap">
                          {new Date(user.updatedAt).toLocaleString()}
                        </Table.Cell>

                        <Table.Cell>
                          <Flex wrap="wrap" gap={2}>
                            <Dialog.Root role="alertdialog">
                              <Dialog.Trigger asChild>
                                <Button
                                  colorPalette="red"
                                  variant="outline"
                                  size="sm"
                                  rounded="lg"
                                >
                                  Delete
                                </Button>
                              </Dialog.Trigger>

                              <Portal>
                                <Dialog.Backdrop
                                  bg="blackAlpha.600"
                                  backdropFilter="blur(6px)"
                                />
                                <Dialog.Positioner px={4}>
                                  <Dialog.Content
                                    maxW="md"
                                    rounded="2xl"
                                    borderWidth="1px"
                                    borderColor="border"
                                    bg="bg.panel"
                                    shadow="2xl"
                                  >
                                    <Box
                                      h="1.5"
                                      bg="status.danger"
                                      borderTopRadius="inherit"
                                    />

                                    <Dialog.Header
                                      display="flex"
                                      justifyContent="space-between"
                                      alignItems="start"
                                      px={6}
                                      pt={6}
                                      pb={3}
                                    >
                                      <Box>
                                        <Dialog.Title>
                                          Are you sure?
                                        </Dialog.Title>
                                      </Box>

                                      <Dialog.CloseTrigger asChild>
                                        <CloseButton size="sm" />
                                      </Dialog.CloseTrigger>
                                    </Dialog.Header>

                                    <Dialog.Body px={6} pb={4}>
                                      <Text color="fg.muted" lineHeight="tall">
                                        This action cannot be undone. This will
                                        permanently delete the user and remove
                                        their data from our systems.
                                      </Text>
                                    </Dialog.Body>

                                    <Dialog.Footer px={6} pb={6} pt={0}>
                                      <Dialog.ActionTrigger asChild>
                                        <Button variant="outline" rounded="xl">
                                          Cancel
                                        </Button>
                                      </Dialog.ActionTrigger>

                                      <Button
                                        onClick={() =>
                                          deleteMutation.mutate(user.id)
                                        }
                                        colorPalette="red"
                                        rounded="xl"
                                      >
                                        Delete
                                      </Button>
                                    </Dialog.Footer>
                                  </Dialog.Content>
                                </Dialog.Positioner>
                              </Portal>
                            </Dialog.Root>

                            <Dialog.Root role="alertdialog">
                              <Dialog.Trigger asChild>
                                <Button
                                  disabled={!!user.passwordSetupToken}
                                  size="sm"
                                  variant="outline"
                                  rounded="lg"
                                  colorPalette={
                                    user.isActive ? "orange" : "green"
                                  }
                                >
                                  <Tooltip
                                    content="User must finish password setup first"
                                    disabled={!user.passwordSetupToken}
                                  ></Tooltip>
                                  {user.isActive ? "Deactivate" : "Activate"}
                                </Button>
                              </Dialog.Trigger>

                              <Portal>
                                <Dialog.Backdrop
                                  bg="blackAlpha.600"
                                  backdropFilter="blur(6px)"
                                />
                                <Dialog.Positioner px={4}>
                                  <Dialog.Content
                                    maxW="md"
                                    rounded="2xl"
                                    borderWidth="1px"
                                    borderColor="border"
                                    bg="bg.panel"
                                    shadow="2xl"
                                  >
                                    <Box
                                      h="1.5"
                                      bg={
                                        user.isActive
                                          ? "status.warning"
                                          : "status.success"
                                      }
                                      borderTopRadius="inherit"
                                    />

                                    <Dialog.Header
                                      display="flex"
                                      justifyContent="space-between"
                                      alignItems="start"
                                      px={6}
                                      pt={6}
                                      pb={3}
                                    >
                                      <Box>
                                        <Dialog.Title>
                                          {user.isActive
                                            ? "Deactivate user?"
                                            : "Activate user?"}
                                        </Dialog.Title>
                                      </Box>

                                      <Dialog.CloseTrigger asChild>
                                        <CloseButton size="sm" />
                                      </Dialog.CloseTrigger>
                                    </Dialog.Header>

                                    <Dialog.Body px={6} pb={4}>
                                      <Text color="fg.muted" lineHeight="tall">
                                        {user.isActive
                                          ? "The user will not be able to log in until reactivated."
                                          : "The user will regain access to the system."}
                                      </Text>
                                    </Dialog.Body>

                                    <Dialog.Footer px={6} pb={6} pt={0}>
                                      <Dialog.ActionTrigger asChild>
                                        <Button variant="outline" rounded="xl">
                                          Cancel
                                        </Button>
                                      </Dialog.ActionTrigger>

                                      <Dialog.ActionTrigger asChild>
                                        <Button
                                          onClick={() =>
                                            toggleActiveMutation.mutate({
                                              userId: user.id,
                                              isActive: !user.isActive,
                                            })
                                          }
                                          colorPalette={
                                            user.isActive ? "orange" : "green"
                                          }
                                          rounded="xl"
                                        >
                                          {user.isActive
                                            ? "Deactivate"
                                            : "Activate"}
                                        </Button>
                                      </Dialog.ActionTrigger>
                                    </Dialog.Footer>
                                  </Dialog.Content>
                                </Dialog.Positioner>
                              </Portal>
                            </Dialog.Root>

                            <Button
                              onClick={() => regenerateMutation.mutate(user.id)}
                              colorPalette="brand"
                              size="sm"
                              rounded="lg"
                            >
                              Generate setup link
                            </Button>
                          </Flex>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>

                <Table.Footer>
                  <Table.Row bg="bg.subtle">
                    <Table.Cell colSpan={6}>
                      <Text fontWeight="medium" color="fg.subtle">
                        Total Users: {users.length}
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                </Table.Footer>
              </Table.Root>
            </Box>
          )}
        </Card.Body>
      </Card.Root>
    </VStack>
  );
};

export default UsersTab;
