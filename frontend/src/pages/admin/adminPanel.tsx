"use client";

import {
  Badge,
  Box,
  Card,
  Heading,
  Tabs,
  Text,
  VStack,
} from "@chakra-ui/react";
import UsersTab from "./usersTab";

export const AdminPanel = () => {
  return (
    <Box maxW="7xl" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 6, md: 8 }}>
      <VStack align="stretch" gap={6}>
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
            <Badge
              variant="subtle"
              colorPalette="brand"
              rounded="full"
              px="3"
              py="1"
              mb={3}
            >
              Administration
            </Badge>

            <Heading size="xl" letterSpacing="-0.02em">
              Admin Panel
            </Heading>

            <Text mt={3} color="fg.muted" maxW="3xl" lineHeight="tall">
              Manage internal users and client campaigns admin workspace.
            </Text>
          </Card.Body>
        </Card.Root>

        <Card.Root
          variant="outline"
          bg="bg.panel"
          borderColor="border"
          rounded="2xl"
          shadow="xs"
        >
          <Card.Body p={{ base: 4, md: 5 }}>
            <Tabs.Root defaultValue="users" variant="plain">
              <Tabs.List
                bg="bg.muted"
                p="1"
                rounded="xl"
                gap="1"
                borderWidth="1px"
                borderColor="border"
              >
                <Tabs.Trigger
                  value="users"
                  px={4}
                  py={2.5}
                  rounded="lg"
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
                  Users
                </Tabs.Trigger>

                <Tabs.Trigger
                  value="campaigns"
                  px={4}
                  py={2.5}
                  rounded="lg"
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
                  Campaigns
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="users" pt={5}>
                <UsersTab roleFilter={undefined} />
              </Tabs.Content>

              <Tabs.Content value="campaigns" pt={5}>
                <UsersTab roleFilter="CLIENT" />
              </Tabs.Content>
            </Tabs.Root>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  );
};
