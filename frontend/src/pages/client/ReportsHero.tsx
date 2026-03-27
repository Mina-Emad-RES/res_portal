"use client";

import { Badge, Box, Card, Flex, Heading, Text } from "@chakra-ui/react";

type ReportsHeroProps = {
  selectedClientLabel: string;
  selectedDate: string;
  periodCount: number;
  hasAudit: boolean;
  hasDM: boolean;
};

export default function ReportsHero({
  selectedClientLabel,
  selectedDate,
  periodCount,
  hasAudit,
  hasDM,
}: ReportsHeroProps) {
  return (
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
            <Text fontSize="sm" fontWeight="medium" color="fg.subtle" mb={2}>
              Reporting workspace
            </Text>

            <Heading size="xl" letterSpacing="-0.02em">
              Reports
            </Heading>

            <Text mt={3} color="fg.muted" maxW="3xl" lineHeight="tall">
              Get to know more about your campaign in a few clicks.
            </Text>
          </Box>

          <Flex gap={2} wrap="wrap">
            {selectedClientLabel ? (
              <Badge
                variant="subtle"
                colorPalette="brand"
                rounded="full"
                px="3"
                py="1.5"
              >
                {selectedClientLabel}
              </Badge>
            ) : null}

            {selectedDate ? (
              <Badge variant="outline" rounded="full" px="3" py="1.5">
                {new Date(selectedDate).toLocaleDateString()}
              </Badge>
            ) : null}

            <Badge variant="outline" rounded="full" px="3" py="1.5">
              {periodCount} Available Report{periodCount === 1 ? "" : "s"}
            </Badge>

            <Badge
              variant="subtle"
              colorPalette={hasAudit ? "green" : "gray"}
              rounded="full"
              px="3"
              py="1.5"
            >
              {hasAudit ? "Audit ready" : "No audit"}
            </Badge>

            <Badge
              variant="subtle"
              colorPalette={hasDM ? "green" : "gray"}
              rounded="full"
              px="3"
              py="1.5"
            >
              {hasDM ? "Data ready" : "No data"}
            </Badge>
          </Flex>
        </Flex>
      </Card.Body>
    </Card.Root>
  );
}
