"use client";

import { Badge, Box, Card, Flex, Table, Text, VStack } from "@chakra-ui/react";
import { auditSections } from "./report-config";
import type { ReportContent } from "./report-types";

type AuditViewProps = {
  content: ReportContent;
};

const getFeedbackColorPalette = (value: unknown) => {
  const normalized = String(value ?? "").toUpperCase();

  switch (normalized) {
    case "YES":
      return "red";
    case "NO":
      return "green";
    default:
      return "gray";
  }
};

const getRatingColorPalette = (value: unknown) => {
  const normalized = String(value ?? "").toUpperCase();

  switch (normalized) {
    case "NA":
      return "gray";
    case "LOW":
      return "green";
    case "MEDIUM":
      return "orange";
    case "HIGH":
      return "red";
    default:
      return "gray";
  }
};

export default function AuditView({ content }: AuditViewProps) {
  return (
    <VStack align="stretch" gap={5}>
      {auditSections.map((section) => (
        <Card.Root
          key={section.title}
          variant="outline"
          bg="bg.panel"
          borderColor="border"
          rounded="xl"
          shadow="xs"
        >
          <Card.Header pb={0}>
            <Flex
              direction={{ base: "column", md: "row" }}
              justify="space-between"
              align={{ base: "start", md: "center" }}
              gap={3}
            >
              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  textTransform="uppercase"
                  letterSpacing="0.12em"
                  color="brand.fg"
                >
                  {section.title}
                </Text>
              </Box>

              <Badge
                variant="subtle"
                colorPalette="brand"
                rounded="full"
                px="3"
                py="1"
              >
                {section.fields.length} item
                {section.fields.length === 1 ? "" : "s"}
              </Badge>
            </Flex>
          </Card.Header>

          <Card.Body pt={4}>
            <Box
              overflowX="auto"
              rounded="lg"
              borderWidth="1px"
              borderColor="border.muted"
            >
              <Table.Root variant="line" size="sm" colorPalette="brand">
                <Table.Header>
                  <Table.Row bg="bg.muted">
                    <Table.ColumnHeader minW="220px" color="fg.subtle">
                      Issue
                    </Table.ColumnHeader>
                    <Table.ColumnHeader minW="240px" color="fg.subtle">
                      Feedback
                    </Table.ColumnHeader>
                    <Table.ColumnHeader minW="120px" color="fg.subtle">
                      Rating
                    </Table.ColumnHeader>
                    <Table.ColumnHeader minW="280px" color="fg.subtle">
                      Notes
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {section.fields.map((field, index) => {
                    const row = content?.[field.key] || {};

                    const hasFeedback =
                      row.feedback !== undefined &&
                      row.feedback !== null &&
                      row.feedback !== "";

                    const hasRating =
                      row.rating !== undefined &&
                      row.rating !== null &&
                      row.rating !== "";

                    const hasNotes =
                      row.notes !== undefined &&
                      row.notes !== null &&
                      row.notes !== "";

                    return (
                      <Table.Row
                        key={field.key}
                        bg={index % 2 === 1 ? "bg.subtle" : "transparent"}
                        _hover={{ bg: "bg.hover" }}
                        transition="background 0.16s ease"
                      >
                        <Table.Cell fontWeight="semibold" verticalAlign="top">
                          {field.label}
                        </Table.Cell>

                        <Table.Cell verticalAlign="top">
                          {hasFeedback ? (
                            <Badge
                              variant="subtle"
                              colorPalette={getFeedbackColorPalette(
                                row.feedback,
                              )}
                              rounded="full"
                            >
                              {String(row.feedback).toUpperCase()}
                            </Badge>
                          ) : (
                            <Text color="fg.subtle">—</Text>
                          )}
                        </Table.Cell>

                        <Table.Cell verticalAlign="top">
                          {hasRating ? (
                            <Badge
                              variant="subtle"
                              colorPalette={getRatingColorPalette(row.rating)}
                              rounded="full"
                            >
                              {String(row.rating).toUpperCase()}
                            </Badge>
                          ) : (
                            <Text color="fg.subtle">—</Text>
                          )}
                        </Table.Cell>

                        <Table.Cell
                          verticalAlign="top"
                          color={hasNotes ? "fg" : "fg.subtle"}
                          whiteSpace="pre-wrap"
                          lineHeight="tall"
                        >
                          {hasNotes ? row.notes : "—"}
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table.Root>
            </Box>
          </Card.Body>
        </Card.Root>
      ))}
    </VStack>
  );
}
