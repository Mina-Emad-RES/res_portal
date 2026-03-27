"use client";

import {
  Badge,
  Box,
  Card,
  Flex,
  Grid,
  Heading,
  HStack,
  Link,
  Tabs,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import InfoPopover from "../../components/my-ui/InfoPopover";
import { sections } from "./report-config";
import type { ReportContent } from "./report-types";

type DMViewProps = {
  content: ReportContent;
};

export default function DMView({ content }: DMViewProps) {
  const [activeTab, setActiveTab] = useState(sections[0].key);

  const renderValue = (value: unknown) => {
    if (value === null || value === undefined || value === "") {
      return <Text color="fg.subtle">—</Text>;
    }

    if (typeof value === "string" && /^https?:\/\//.test(value)) {
      return (
        <Link
          href={value}
          target="_blank"
          rel="noreferrer"
          variant="underline"
          colorPalette="brand"
          wordBreak="break-all"
        >
          {value}
        </Link>
      );
    }

    if (typeof value === "object") {
      return (
        <Box
          as="pre"
          fontSize="sm"
          overflowX="auto"
          p={3}
          rounded="lg"
          bg="bg.panel"
          borderWidth="1px"
          borderColor="border.muted"
        >
          {JSON.stringify(value, null, 2)}
        </Box>
      );
    }

    return <Text whiteSpace="pre-wrap">{String(value)}</Text>;
  };

  return (
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

      {sections.map((section) => {
        const data = content?.[section.key];
        const actionsCount = data?.actions?.length ?? 0;

        return (
          <Tabs.Content key={section.key} value={section.key} pt={5}>
            <Card.Root
              variant="outline"
              bg="bg.panel"
              borderColor="border"
              rounded="xl"
              shadow="xs"
            >
              <Card.Header>
                <Flex
                  direction={{ base: "column", md: "row" }}
                  justify="space-between"
                  align={{ base: "start", md: "center" }}
                  gap={3}
                >
                  <Box>
                    <Text
                      fontSize="xs"
                      fontWeight="semibold"
                      textTransform="uppercase"
                      letterSpacing="0.12em"
                      color="brand.fg"
                    >
                      Data report section
                    </Text>

                    <HStack gap={2} mt={1} mb={3} align="center">
                      <Heading size="md">{section.label}</Heading>
                      <InfoPopover content={section.description} />
                    </HStack>
                  </Box>

                  <Badge
                    variant="subtle"
                    colorPalette="brand"
                    rounded="full"
                    px="3"
                    py="1"
                  >
                    {actionsCount} action{actionsCount === 1 ? "" : "s"}
                  </Badge>
                </Flex>
              </Card.Header>

              <Card.Body pt={0}>
                <VStack align="stretch" gap={5}>
                  <Grid
                    templateColumns={{
                      base: "1fr",
                      xl: "repeat(2, minmax(0, 1fr))",
                    }}
                    gap={4}
                  >
                    {section.fields.map((field) => (
                      <Box
                        key={field.name}
                        p={4}
                        rounded="xl"
                        bg="bg.subtle"
                        borderWidth="1px"
                        borderColor="border"
                      >
                        <HStack gap={2} mb={3} align="center">
                          <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color="fg.subtle"
                          >
                            {field.label}
                          </Text>
                          {field.help && <InfoPopover content={field.help} />}
                        </HStack>

                        {renderValue(data?.fields?.[field.name])}
                      </Box>
                    ))}
                  </Grid>

                  <Box>
                    <Flex justify="space-between" align="center" mb={3}>
                      <Heading size="sm">Actions</Heading>
                      <Text fontSize="sm" color="fg.muted">
                        {actionsCount} item{actionsCount === 1 ? "" : "s"}
                      </Text>
                    </Flex>

                    {actionsCount ? (
                      <VStack align="stretch" gap={3}>
                        {data.actions.map((action: any, i: number) => (
                          <Box
                            key={`${action.title ?? "action"}-${i}`}
                            p={4}
                            rounded="xl"
                            borderWidth="1px"
                            borderColor="border"
                            bg="bg.subtle"
                            transition="background 0.18s ease, border-color 0.18s ease"
                            _hover={{
                              bg: "bg.hover",
                              borderColor: "border.emphasized",
                            }}
                          >
                            <Text fontWeight="semibold">
                              {action.title || `Action ${i + 1}`}
                            </Text>
                            <Text
                              mt={1.5}
                              color="fg.muted"
                              whiteSpace="pre-wrap"
                            >
                              {action.description || "—"}
                            </Text>
                          </Box>
                        ))}
                      </VStack>
                    ) : (
                      <Box
                        p={4}
                        rounded="xl"
                        borderWidth="1px"
                        borderStyle="dashed"
                        borderColor="border.emphasized"
                        bg="bg.subtle"
                      >
                        <Text color="fg.muted">
                          No actions listed for this section.
                        </Text>
                      </Box>
                    )}
                  </Box>
                </VStack>
              </Card.Body>
            </Card.Root>
          </Tabs.Content>
        );
      })}
    </Tabs.Root>
  );
}
