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
import { useEffect, useState } from "react";
import axios from "../../api/axios";
import CreateUserModal from "./CreateUserModal";
import type { User } from "../../types/auth";

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
  | {
      type: "MAGIC_LINK";
      color: "blue";
    }
  | {
      type: "SETUP_EXPIRED";
      color: "gray";
    }
  | {
      type: "ACTIVE";
      color: "green";
    }
  | {
      type: "INACTIVE";
      color: "orange";
    };

const selectTriggerStyles = {
  rounded: "lg",
  bg: "bg.panel",
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

const UsersTab = ({ roleFilter }: { roleFilter?: string }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const isClientView = roleFilter === "CLIENT";

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/users");
      const roleOrder = ["ADMIN", "AUDITOR", "DM", "CLIENT"];

      const sortedUsers = res.data.sort((a: User, b: User) => {
        if (a.role === b.role) {
          return a.username.localeCompare(b.username);
        }
        return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role);
      });

      const filteredUsers = roleFilter
        ? sortedUsers.filter((u: User) => u.role === roleFilter)
        : sortedUsers.filter((u: User) => u.role !== "CLIENT");

      setUsers(filteredUsers);
    } catch (err) {
      console.error(err);
      toaster.create({
        title: "Error fetching users",
        type: "error",
        duration: 5000,
        closable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: User["role"]) => {
    try {
      await axios.patch(`/users/${userId}`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
      toaster.create({ title: "Role updated", type: "success" });
    } catch (err) {
      console.error(err);
      toaster.create({ title: "Failed to update role", type: "error" });
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await axios.delete(`/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toaster.create({ title: "User deleted", type: "success" });
    } catch (err) {
      console.error(err);
      toaster.create({ title: "Failed to delete user", type: "error" });
    }
  };

  const handleRegenerate = async (userId: string) => {
    try {
      const res = await axios.patch(`/users/${userId}/resend-setup-link`);
      const link = `${FRONTEND_URL}/set-password?token=${res.data.setupToken}`;

      await navigator.clipboard.writeText(link);

      toaster.create({
        title: "New setup link generated",
        description: "Link copied to clipboard",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      toaster.create({ title: "Failed to delete user", type: "error" });
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      const newState = !isActive;

      await axios.patch(`/users/${userId}`, {
        isActive: newState,
      });

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: newState } : u)),
      );

      toaster.create({
        title: newState ? "User activated" : "User deactivated",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      toaster.create({
        title: "Failed to update user status",
        type: "error",
      });
    }
  };

  const getUserStatus = (user: User): UserStatus => {
    if (user.passwordSetupToken) {
      if (
        user.passwordSetupExpires &&
        new Date(user.passwordSetupExpires) > new Date()
      ) {
        return {
          type: "MAGIC_LINK",
          color: "blue",
        };
      }

      return {
        type: "SETUP_EXPIRED",
        color: "gray",
      };
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

  if (loading) {
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
        onUserCreated={(user) => setUsers((prev) => [...prev, user])}
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
            <Box overflowX="auto">
              <Table.ScrollArea maxH="650px" rounded="lg">
                <Table.Root variant="line" size="sm" stickyHeader>
                  <Table.Header>
                    <Table.Row bg="bg.muted">
                      <Table.ColumnHeader color="fg.subtle">
                        Username
                      </Table.ColumnHeader>
                      <Table.ColumnHeader color="fg.subtle">
                        Role
                      </Table.ColumnHeader>
                      <Table.ColumnHeader color="fg.subtle">
                        Status
                      </Table.ColumnHeader>
                      <Table.ColumnHeader color="fg.subtle">
                        Created At
                      </Table.ColumnHeader>
                      <Table.ColumnHeader color="fg.subtle">
                        Updated At
                      </Table.ColumnHeader>
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
                                handleRoleChange(user.id, val);
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
                                        <Text
                                          color="fg.muted"
                                          lineHeight="tall"
                                        >
                                          This action cannot be undone. This
                                          will permanently delete the user and
                                          remove their data from our systems.
                                        </Text>
                                      </Dialog.Body>

                                      <Dialog.Footer px={6} pb={6} pt={0}>
                                        <Dialog.ActionTrigger asChild>
                                          <Button
                                            variant="outline"
                                            rounded="xl"
                                          >
                                            Cancel
                                          </Button>
                                        </Dialog.ActionTrigger>

                                        <Button
                                          onClick={() => handleDelete(user.id)}
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
                                        <Text
                                          color="fg.muted"
                                          lineHeight="tall"
                                        >
                                          {user.isActive
                                            ? "The user will not be able to log in until reactivated."
                                            : "The user will regain access to the system."}
                                        </Text>
                                      </Dialog.Body>

                                      <Dialog.Footer px={6} pb={6} pt={0}>
                                        <Dialog.ActionTrigger asChild>
                                          <Button
                                            variant="outline"
                                            rounded="xl"
                                          >
                                            Cancel
                                          </Button>
                                        </Dialog.ActionTrigger>

                                        <Dialog.ActionTrigger asChild>
                                          <Button
                                            onClick={() =>
                                              handleToggleActive(
                                                user.id,
                                                user.isActive,
                                              )
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
                                onClick={() => handleRegenerate(user.id)}
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
              </Table.ScrollArea>
            </Box>
          )}
        </Card.Body>
      </Card.Root>
    </VStack>
  );
};

export default UsersTab;
